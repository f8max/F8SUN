import type { SVGProps } from 'react'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 38" aria-hidden="true">
      {/* Abstract A mark — a hand-laid carbon frame joint */}
      <path d="M19 4L6 14v10l13 10 13-10V14L19 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 18l7 6 7-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="14" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function ChevronUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <path d="M4.5 11.25 9 6.75l4.5 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <path d="M4.5 6.75 9 11.25l4.5-4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <rect x="5" y="5" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 13V3h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <path d="M9 3v9M5.25 8.25 9 12l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M3 14.25h12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

export function FrameOutline() {
  return (
    <svg className="frame-outline" viewBox="0 0 400 320" role="img" aria-labelledby="frame-title frame-desc">
      <title id="frame-title">Abstract frame treatment reference</title>
      <desc id="frame-desc">A simplified bicycle frame silhouette for colour preview. Not a manufacturing-accurate rendering.</desc>
      {/* Abstract frame silhouette */}
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Top tube */}
        <path d="M95 80 L260 72" className="frame-tube" data-tube="top" />
        {/* Down tube */}
        <path d="M105 82 L210 195" className="frame-tube" data-tube="down" />
        {/* Seat tube */}
        <path d="M210 195 L195 282" className="frame-tube" data-tube="seat" />
        {/* Seat stays */}
        <path d="M195 282 L280 260" className="frame-tube" data-tube="seat-stay" />
        {/* Chain stays */}
        <path d="M210 195 L280 260" className="frame-tube" data-tube="chain-stay" />
        {/* Head tube */}
        <path d="M95 80 L105 82" className="frame-tube" data-tube="head" />
        {/* Fork */}
        <path d="M95 80 L88 215" className="frame-tube" data-tube="fork" />
        {/* Seat post */}
        <path d="M195 282 L192 260" className="frame-tube" data-tube="post" />
      </g>
      {/* Dropouts */}
      <circle cx="88" cy="215" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="280" cy="260" r="4" fill="currentColor" opacity="0.3" />
      {/* Bottom bracket */}
      <circle cx="210" cy="195" r="5" fill="currentColor" opacity="0.2" />
    </svg>
  )
}
