// ── SYRE bike brand marks ──

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      {/* Frame-style mark */}
      <path d="M8 32V12l4-4h16l4 4v10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v6M28 8v6M32 12h-6M14 12H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="3" fill="currentColor" />
      <path d="M20 25v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 30h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function FrameGraphic() {
  return (
    <svg className="frame-graphic" viewBox="0 0 640 480" role="img" aria-labelledby="frame-title frame-desc">
      <title id="frame-title">SYRE carbon frame design journey</title>
      <desc id="frame-desc">Abstract representation of a hand-laid carbon bicycle frame showing the five-stage configuration path</desc>
      <defs>
        <linearGradient id="frame-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      {/* Frame outline */}
      <path
        d="M160 100 L280 80 L360 100 M280 80 L280 340 L200 400 M280 340 L360 400 M200 400 L360 400 M160 100 L120 140 L180 180 M360 100 L400 140 L340 180 M180 180 L200 220 M340 180 L320 220 M200 220 L320 220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      {/* Stage nodes along the top tube path */}
      <circle cx="160" cy="100" r="8" fill="currentColor" opacity="0.5" />
      <circle cx="280" cy="80" r="8" fill="currentColor" opacity="0.5" />
      <circle cx="360" cy="100" r="8" fill="currentColor" opacity="0.5" />
      {/* Seat cluster */}
      <circle cx="280" cy="340" r="6" fill="currentColor" opacity="0.4" />
      {/* Bottom bracket */}
      <circle cx="200" cy="220" r="5" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
