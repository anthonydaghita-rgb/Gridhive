interface GridhiveLogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function GridhiveLogo({ className = '', iconOnly = false, size = 'md' }: GridhiveLogoProps) {
  const heights = { sm: 24, md: 32, lg: 48 }
  const h = heights[size]
  // Icon aspect ratio ~1:1, full logo ~3.8:1
  const iconW = h
  const fullW = iconOnly ? iconW : Math.round(h * 3.8)

  return (
    <svg
      width={fullW}
      height={h}
      viewBox={iconOnly ? '0 0 100 100' : '0 0 380 100'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Hexagonal network icon ── */}
      {/* Lines */}
      <g stroke="white" strokeWidth="5" strokeLinecap="round">
        {/* Outer hexagon edges */}
        <line x1="50" y1="8" x2="88" y2="29" />
        <line x1="88" y1="29" x2="88" y2="71" />
        <line x1="88" y1="71" x2="50" y2="92" />
        <line x1="50" y1="92" x2="12" y2="71" />
        <line x1="12" y1="71" x2="12" y2="29" />
        <line x1="12" y1="29" x2="50" y2="8" />
        {/* Spokes to center */}
        <line x1="50" y1="8" x2="50" y2="50" />
        <line x1="88" y1="29" x2="50" y2="50" />
        <line x1="88" y1="71" x2="50" y2="50" />
        <line x1="50" y1="92" x2="50" y2="50" />
        <line x1="12" y1="71" x2="50" y2="50" />
        <line x1="12" y1="29" x2="50" y2="50" />
      </g>
      {/* Nodes — top, top-right, bottom-right, bottom, bottom-left, top-left */}
      <circle cx="50" cy="8"  r="7" fill="white" />
      <circle cx="88" cy="29" r="7" fill="#3b82f6" />
      <circle cx="88" cy="71" r="7" fill="white" />
      <circle cx="50" cy="92" r="7" fill="white" />
      <circle cx="12" cy="71" r="7" fill="#3b82f6" />
      <circle cx="12" cy="29" r="7" fill="white" />
      {/* Center node */}
      <circle cx="50" cy="50" r="9" fill="white" />

      {/* ── "GRIDHIVE" wordmark ── */}
      {!iconOnly && (
        <text
          x="115"
          y="68"
          fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
          fontWeight="800"
          fontSize="46"
          letterSpacing="1"
          fill="white"
        >
          GRIDHIVE
        </text>
      )}
    </svg>
  )
}
