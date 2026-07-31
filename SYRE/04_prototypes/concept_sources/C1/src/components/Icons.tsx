import type { SVGProps } from 'react'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 38" aria-hidden="true">
      <path d="M19 3 8 9.5v8L19 23l11-5.5v-8Z" fill="currentColor" opacity=".14" />
      <path d="M19 3 8 9.5v8L19 23l11-5.5v-8Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 17.5v5L19 28l11-5.5v-5M19 23v5M13 14.5 19 18l6-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
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
