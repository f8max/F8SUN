/* SYRE V2 — Best Placeholder: app.js */
/* C5 Drift mechanics (Brownian + cursor nudge), single rAF loop, DPR c2 */
(function() {
  'use strict';

  /* --- DOM refs --- */
  var logoLayer = document.getElementById('logo-layer');
  var corridor = document.getElementById('corridor');
  var zoneC = document.getElementById('zone-c');
  var toast = document.getElementById('toast');
  var emailCta = document.getElementById('email-cta');
  var emailInput = document.getElementById('email-input');
  var emailSubmit = document.getElementById('email-submit');
  var learnMore = document.getElementById('learn-more');

  /* --- CANVAS SETUP --- */
  var canvas = document.createElement('canvas');
  canvas.id = 'c';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  /* --- STATE --- */
  var frames = [];
  var frameImages = [];
  var loadedCount = 0;
  var totalFrames = 14; /* all 14 loaded, but only FC rendered */

  var mx = -200, my = -200;
  var pmx = -200, pmy = -200;
  var mdx = 0, mdy = 0;
  var frozen = false;
  var reducedMotion = false;
  var interacted = false;
  var running = false;

  /* S-hold corridor state */
  var sHeld = false;
  var sHoldStart = 0;
  var corridorActive = false;

  /* Toast timer */
  var toastTimer = null;

  /* --- DETECT MOBILE --- */
  function isMobile() { return window.innerWidth < 768; }

  /* --- FRAME COUNT BASED ON VIEWPORT --- */
  function getFrameCount() {
    return isMobile() ? 6 : 10;
  }

  /* --- REDUCED MOTION DETECTION --- */
  var mm = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = mm.matches;
  mm.addEventListener('change', function(e) { reducedMotion = e.matches; });

  /* --- CANVAS RESIZE WITH DPR CAP AT 2 --- */
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  /* --- LOAD ALL 14 FRAMES --- */
  function loadFrames() {
    for (var i = 1; i <= 14; i++) {
      var img = new Image();
      var idx = i;
      img.onload = function() {
        loadedCount++;
        /* Start rendering as soon as first frame arrives */
        if (loadedCount === 1 && !running) {
          initFrames();
          running = true;
          loop();
        }
      };
      img.onerror = function() {
        loadedCount++;
        console.warn('SYRE V2: frame-' + idx + '.png failed to load');
      };
      img.src = 'assets/frame-' + String(i).padStart(2, '0') + '.png';
      frameImages.push(img);
    }
  }

  /* --- INITIALIZE FRAMES --- */
  function initFrames() {
    var fc = getFrameCount();
    var avail = [];
    for (var i = 0; i < frameImages.length; i++) {
      if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
        avail.push(frameImages[i]);
      }
    }
    if (avail.length === 0) {
      /* Nothing loaded yet, retry later */
      setTimeout(initFrames, 200);
      return;
    }

    frames = [];
    var w = window.innerWidth;
    var h = window.innerHeight;
    for (var j = 0; j < fc; j++) {
      var img = avail[Math.floor(Math.random() * avail.length)];
      /* Scale range: 0.14-0.22 per V2 spec */
      var s = 0.14 + Math.random() * 0.08;
      var fw = img.naturalWidth * s;
      var fh = img.naturalHeight * s;
      frames.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * Math.PI * 2,
        av: (Math.random() - 0.5) * 0.003,
        s: s,
        img: img,
        w: fw,
        h: fh
      });
    }
  }

  /* --- C5 DRIFT PHYSICS UPDATE --- */
  function update() {
    if (frozen || reducedMotion) {
      mdx = 0;
      mdy = 0;
      return;
    }

    var w = window.innerWidth;
    var h = window.innerHeight;

    /* Corridor push force when S-hold active */
    var cx = w / 2;  /* corridor center */
    var cwHalf = isMobile() ? 90 : 125;

    for (var i = frames.length - 1; i >= 0; i--) {
      var f = frames[i];

      /* C5 Drift cursor force: 80/(dist+100)*0.008 + mdx*0.0003 */
      var dx = f.x - mx;
      var dy = f.y - my;
      var dist = Math.sqrt(dx * dx + dy * dy) + 1;
      var force = 80 / (dist + 100);

      f.vx += (dx / dist) * force * 0.008 + mdx * 0.0003;
      f.vy += (dy / dist) * force * 0.005;

      /* Brownian drift: +/-0.015 per axis per frame (from C5 spec) */
      f.vx += (Math.random() - 0.5) * 0.015;
      f.vy += (Math.random() - 0.5) * 0.015;

      /* Damping: 0.995 per axis */
      f.vx *= 0.995;
      f.vy *= 0.995;

      /* Speed cap: 1.5 px/frame */
      var sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
      if (sp > 1.5) {
        f.vx *= 1.5 / sp;
        f.vy *= 1.5 / sp;
      }

      /* S-hold corridor push — gently push frames away from corridor */
      if (corridorActive) {
        var distCx = Math.abs(f.x - cx);
        if (distCx < cwHalf + f.w * 0.5) {
          var pushDir = (f.x < cx) ? -1 : 1;
          var pushForce = (1 - distCx / (cwHalf + f.w * 0.5)) * 0.4;
          f.vx += pushDir * pushForce;
        }
      }

      /* Integration */
      f.x += f.vx;
      f.y += f.vy;

      /* Rotation from cursor force: cursorForce*0.0003, damped *0.997 */
      f.av += force * 0.0003 * (dx > 0 ? 1 : -1);
      f.av *= 0.997;
      f.rot += f.av;

      /* Edge wrap (persistent frame lifecycle) */
      if (f.x > w + f.w) f.x = -f.w;
      if (f.x < -f.w) f.x = w + f.w;
      if (f.y > h + f.h) f.y = -f.h;
      if (f.y < -f.h) f.y = h + f.h;
    }

    /* Ensure we maintain target frame count */
    var fc = getFrameCount();
    while (frames.length < fc) {
      var avail = [];
      for (var j = 0; j < frameImages.length; j++) {
        if (frameImages[j] && frameImages[j].complete && frameImages[j].naturalWidth > 0) {
          avail.push(frameImages[j]);
        }
      }
      if (avail.length === 0) break;
      var img = avail[Math.floor(Math.random() * avail.length)];
      var s = 0.14 + Math.random() * 0.08;
      var fw = img.naturalWidth * s;
      var fh = img.naturalHeight * s;
      frames.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * Math.PI * 2,
        av: (Math.random() - 0.5) * 0.003,
        s: s,
        img: img,
        w: fw,
        h: fh
      });
    }

    /* Reset mouse deltas after processing */
    mdx = 0;
    mdy = 0;
  }

  /* --- DRAW --- */
  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = 0.75;
      ctx.drawImage(f.img, -f.w / 2, -f.h / 2, f.w, f.h);
      ctx.restore();
    }
  }

  /* --- SINGLE rAF LOOP --- */
  function loop() {
    if (document.hidden) {
      /* Pause when tab is hidden, resume deterministically */
      requestAnimationFrame(loop);
      return;
    }
    update();
    draw();
    requestAnimationFrame(loop);
  }

  /* --- SHOW TOAST --- */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toast.classList.remove('visible');
    }, 2000);
  }

  /* --- TOGGLE FREEZE --- */
  function toggleFreeze() {
    frozen = !frozen;
    if (frozen) {
      showToast('\u23F8 Frozen \u2014 Space/double-click to resume');
    } else {
      showToast('\u25B6 Resumed');
    }
  }

  /* --- DISMISS HINT --- */
  function dismissHint() {
    if (!interacted) {
      interacted = true;
      zoneC.classList.add('dismissed');
    }
  }

  /* --- CORRIDOR ACTIVATE/DEACTIVATE --- */
  function activateCorridor() {
    if (!corridorActive) {
      corridorActive = true;
      corridor.classList.add('active');
    }
  }
  function deactivateCorridor() {
    if (corridorActive) {
      corridorActive = false;
      corridor.classList.remove('active');
    }
  }

  /* --- INTERACTION HANDLERS --- */

  /* Mouse move — cursor nudge */
  document.addEventListener('mousemove', function(e) {
    dismissHint();
    pmx = mx;
    pmy = my;
    mx = e.clientX;
    my = e.clientY;
    mdx = mx - pmx;
    mdy = my - pmy;
  });

  /* Touch move — shallow trajectory change */
  document.addEventListener('touchmove', function(e) {
    dismissHint();
    var t = e.touches[0];
    pmx = mx;
    pmy = my;
    mx = t.clientX;
    my = t.clientY;
    mdx = mx - pmx;
    mdy = my - pmy;
  }, { passive: true });

  /* Double-click / double-tap freeze toggle */
  var clickCount = 0;
  var clickTimer = null;
  document.addEventListener('click', function(e) {
    /* Don't interfere with email input clicks */
    if (e.target === emailInput || e.target === emailSubmit) return;
    dismissHint();
    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(function() {
      clickCount = 0;
    }, 400);
    if (clickCount >= 2) {
      toggleFreeze();
      clickCount = 0;
      if (clickTimer) clearTimeout(clickTimer);
    }
  });

  /* Keyboard controls */
  document.addEventListener('keydown', function(e) {
    /* Space: toggle freeze */
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      dismissHint();
      toggleFreeze();
      return;
    }

    /* S: start corridor hold timer */
    if (e.code === 'KeyS' && !e.repeat) {
      e.preventDefault();
      sHeld = true;
      sHoldStart = performance.now();
      /* Check every 100ms whether 800ms has elapsed */
      var check = function() {
        if (!sHeld) return;
        if (performance.now() - sHoldStart >= 800) {
          activateCorridor();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    }
  });

  /* Key up — release corridor */
  document.addEventListener('keyup', function(e) {
    if (e.code === 'KeyS') {
      sHeld = false;
      deactivateCorridor();
    }
  });

  /* --- VISIBILITY CHANGE — pause when hidden --- */
  document.addEventListener('visibilitychange', function() {
    /* The rAF loop checks document.hidden and skips update/draw */
    /* Frame positions are preserved naturally */
  });

  /* --- RESIZE HANDLER --- */
  var resizeTimeout;
  window.addEventListener('resize', function() {
    resize();
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      /* Re-init frames if mobile/desktop boundary crossed */
      var fc = getFrameCount();
      if (frames.length !== fc) {
        initFrames();
      }
    }, 300);
  });

  /* Orientation change */
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      resize();
      initFrames();
    }, 300);
  });

  /* --- EMAIL/CTA STATE MACHINE (localStorage only, no live send) --- */
  var savedEmail = null;
  try {
    savedEmail = localStorage.getItem('syre-v2-email');
  } catch (e) {}

  emailCta.classList.add('visible');
  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.disabled = true;
    emailSubmit.textContent = '\u2713 Submitted';
    emailSubmit.style.opacity = '0.6';
  }

  emailSubmit.addEventListener('click', function() {
    var val = emailInput.value.trim();
    if (!val || val.indexOf('@') === -1) {
      showToast('Please enter a valid email address');
      return;
    }
    try {
      localStorage.setItem('syre-v2-email', val);
    } catch (e) {
      /* localStorage may be unavailable */
    }
    emailInput.disabled = true;
    emailSubmit.textContent = '\u2713 Submitted';
    emailSubmit.style.opacity = '0.6';
    showToast('Saved locally \u2014 nothing is sent or stored');
  });

  /* --- INITIALIZATION --- */
  resize();
  loadFrames();

  /* Fallback: if no frames load within 3s, show poster state */
  setTimeout(function() {
    if (loadedCount === 0) {
      console.warn('SYRE V2: No frame assets loaded. Showing static poster.');
      canvas.style.opacity = '0';
    }
  }, 3000);

})();
