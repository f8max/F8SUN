# Building Milestone 2

Install Python dependencies from `requirements-build.txt`, Node dependencies with `npm ci --ignore-scripts`, the pinned Puppeteer browser, Chromium shared libraries, and LibreOffice Writer. Then run:

```bash
python build_release.py --clean
python qa/check_release.py
```

Outputs are written to ignored `dist/`; contact sheets are written to ignored `qa/rendered/`. The build is repeatable from pinned application dependencies, not claimed byte-for-byte reproducible across operating systems.
