/**
 * The Reeforge atoll symbol, inline so it takes the token colours (--rf-primary ring, --rf-accent ember).
 * Geometry copied from design/preview.html: never redraw, rotate or recolour it (DESIGN.md).
 */
export function BrandMark() {
  return (
    <svg className="rf-brand-mark" viewBox="0 0 53 53" aria-hidden="true">
      <path className="rf-brand-mark__ring" d="M32.93 47.54A22 22 0 1 1 47.54 32.93" />
      <circle className="rf-brand-mark__ember" cx="42.06" cy="42.06" r="5" />
    </svg>
  )
}

/** Mark + "Reeforge Finance", as in the sidebar and above the login form. */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`rf-sidebar__brand ${className}`.trim()}>
      <BrandMark />
      Reeforge <span>Finance</span>
    </div>
  )
}
