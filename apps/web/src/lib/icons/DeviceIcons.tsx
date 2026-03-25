// Custom SVG device icons for Gridhive
// All icons are 24x24 viewBox SVG React components

interface IconProps {
  className?: string
  size?: number
}

export function FirewallIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6L12 2z" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  )
}

export function FirewallEdgeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6L12 2z" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <polyline points="17 8 20 8 20 11" />
      <line x1="17" y1="8" x2="20" y2="11" />
    </svg>
  )
}

export function SwitchL2Icon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <line x1="6" y1="15" x2="6" y2="19" />
      <line x1="10" y1="15" x2="10" y2="19" />
      <line x1="14" y1="15" x2="14" y2="19" />
      <line x1="18" y1="15" x2="18" y2="19" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SwitchL3Icon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <line x1="6" y1="15" x2="6" y2="19" />
      <line x1="10" y1="15" x2="10" y2="19" />
      <line x1="14" y1="15" x2="14" y2="19" />
      <line x1="18" y1="15" x2="18" y2="19" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
      <polyline points="19 5 21 3 21 7" />
      <line x1="17" y1="3" x2="21" y2="3" />
    </svg>
  )
}

export function RouterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="12" rx="10" ry="5" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 7v10" />
      <polyline points="8 9 6 8 6 5" />
      <polyline points="16 9 18 8 18 5" />
      <line x1="6" y1="5" x2="18" y2="5" />
    </svg>
  )
}

export function ServerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="10" width="20" height="5" rx="1" />
      <rect x="2" y="17" width="20" height="4" rx="1" />
      <circle cx="18" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <line x1="5" y1="5.5" x2="14" y2="5.5" />
      <line x1="5" y1="12.5" x2="14" y2="12.5" />
    </svg>
  )
}

export function WorkstationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="13" height="10" rx="1" />
      <line x1="8" y1="13" x2="8" y2="17" />
      <line x1="4" y1="17" x2="12" y2="17" />
      <rect x="17" y="3" width="5" height="10" rx="1" />
      <line x1="18" y1="6" x2="21" y2="6" />
      <line x1="18" y1="8" x2="21" y2="8" />
      <line x1="18" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function WirelessAPIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CameraIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

export function VoIPPhoneIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.61 5.61l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export function PrinterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

export function NASIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="5" rx="1" />
      <rect x="2" y="9" width="20" height="5" rx="1" />
      <rect x="2" y="16" width="20" height="5" rx="1" />
      <circle cx="18" cy="4.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InternetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

export function PLCIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="1" />
      <line x1="6" y1="6" x2="6" y2="4" />
      <line x1="10" y1="6" x2="10" y2="4" />
      <line x1="14" y1="6" x2="14" y2="4" />
      <line x1="18" y1="6" x2="18" y2="4" />
      <line x1="6" y1="18" x2="6" y2="20" />
      <line x1="10" y1="18" x2="10" y2="20" />
      <line x1="14" y1="18" x2="14" y2="20" />
      <line x1="18" y1="18" x2="18" y2="20" />
      <rect x="5" y="9" width="5" height="6" rx="0.5" />
      <line x1="14" y1="11" x2="19" y2="11" />
      <line x1="14" y1="13" x2="19" y2="13" />
    </svg>
  )
}

export function SensorIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="8" />
      <path d="M8.5 9.5a5 5 0 0 0 7 7" />
      <path d="M5.5 6.5a10 10 0 0 0 13 13" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

export function PatchPanelIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <rect x="4" y="10" width="2.5" height="4" rx="0.5" />
      <rect x="8" y="10" width="2.5" height="4" rx="0.5" />
      <rect x="12" y="10" width="2.5" height="4" rx="0.5" />
      <rect x="16" y="10" width="2.5" height="4" rx="0.5" />
      <line x1="5.25" y1="8" x2="5.25" y2="5" />
      <line x1="9.25" y1="8" x2="9.25" y2="5" />
      <line x1="13.25" y1="8" x2="13.25" y2="5" />
      <line x1="17.25" y1="8" x2="17.25" y2="5" />
    </svg>
  )
}

export function HMIIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="15" rx="2" />
      <line x1="8" y1="18" x2="8" y2="21" />
      <line x1="16" y1="18" x2="16" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <path d="M10 10l2-2 2 2" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ACServerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="10" width="20" height="5" rx="1" />
      <circle cx="18" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <line x1="5" y1="5.5" x2="14" y2="5.5" />
      <line x1="5" y1="12.5" x2="14" y2="12.5" />
      <path d="M9 18l3 3 3-3" />
      <line x1="12" y1="15" x2="12" y2="21" />
    </svg>
  )
}

export function ACControllerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="13" y1="9" x2="19" y2="9" />
      <line x1="13" y1="12" x2="19" y2="12" />
      <line x1="13" y1="15" x2="17" y2="15" />
    </svg>
  )
}

export function ACReaderIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="10" y1="6" x2="14" y2="6" />
      <line x1="10" y1="9" x2="14" y2="9" />
      <circle cx="12" cy="16" r="2" />
    </svg>
  )
}

export function ACDoorHardwareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <circle cx="15" cy="12" r="1.5" />
      <line x1="2" y1="22" x2="22" y2="22" />
    </svg>
  )
}

export function ACIntercomIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="8" r="3" />
      <rect x="8" y="13" width="8" height="5" rx="1" />
      <line x1="10" y1="15" x2="14" y2="15" />
    </svg>
  )
}

export function ACBiometricIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
      <path d="M9 9c0 1.66 1.34 3 3 3s3-1.34 3-3" />
      <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
    </svg>
  )
}

export function ACKeyPadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
      <rect x="9" y="18" width="6" height="2" rx="1" />
    </svg>
  )
}

export function ACVisitorKioskIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="7" y="5" width="10" height="8" rx="1" />
      <line x1="8" y1="16" x2="16" y2="16" />
      <line x1="8" y1="19" x2="13" y2="19" />
    </svg>
  )
}

export function ACElevatorCtrlIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="2" width="18" height="20" rx="1" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <polyline points="6 8 9 5 9 11" />
      <polyline points="18 16 15 19 15 13" />
    </svg>
  )
}

export function ACTurnstileIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="22" />
      <line x1="2" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="22" y2="12" />
      <line x1="4" y1="4" x2="9" y2="9" />
      <line x1="15" y1="15" x2="20" y2="20" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Phase 4 Icons
// ─────────────────────────────────────────────────────────────

export function LoadBalancerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="12" y1="7" x2="5" y2="17" />
      <line x1="12" y1="7" x2="19" y2="17" />
      <line x1="12" y1="7" x2="12" y2="17" />
    </svg>
  )
}

export function UPSIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <polyline points="10 14 12 11 14 14" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </svg>
  )
}

export function PDUIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="7" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="17" cy="12" r="1.5" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  )
}

export function HypervisorIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="7" rx="1" />
      <rect x="2" y="14" width="9" height="7" rx="1" />
      <rect x="13" y="14" width="9" height="7" rx="1" />
      <line x1="7" y1="10" x2="7" y2="14" />
      <line x1="17" y1="10" x2="17" y2="14" />
    </svg>
  )
}

export function CloudAWSIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 16A4.5 4.5 0 0 1 7 7a5 5 0 0 1 9.9-1A4 4 0 0 1 18 14H6.5z" />
      <path d="M8 20l-2 2" />
      <path d="M12 20v2" />
      <path d="M16 20l2 2" />
    </svg>
  )
}

export function CloudAzureIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3L4 18h4l4-6 4 6h4L12 3z" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function CloudGenericIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 16A4.5 4.5 0 0 1 7 7a5 5 0 0 1 9.9-1A4 4 0 0 1 18 14H6.5z" />
    </svg>
  )
}

export function CellularGatewayIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="8" width="14" height="13" rx="2" />
      <path d="M9 4c0 0 3-1 6 0" />
      <path d="M7 6c0 0 5-2 10 0" />
      <line x1="12" y1="8" x2="12" y2="5" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </svg>
  )
}

export function WirelessControllerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <path d="M7 6c2.8-2 7.2-2 10 0" />
      <path d="M9 4c1.8-1.5 5.2-1.5 7 0" />
      <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
      <line x1="9" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function SANSwitchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <line x1="6" y1="15" x2="6" y2="19" />
      <line x1="12" y1="15" x2="12" y2="19" />
      <line x1="18" y1="15" x2="18" y2="19" />
      <path d="M4 12h2" strokeWidth="2" />
      <path d="M10 12h2" strokeWidth="2" />
      <path d="M16 12h2" strokeWidth="2" />
    </svg>
  )
}

export function PBXIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.41 2 2 0 0 1 3.89 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export function NVRIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <line x1="4" y1="9" x2="4" y2="9.01" strokeWidth="2" />
      <line x1="4" y1="15" x2="4" y2="15.01" strokeWidth="2" />
    </svg>
  )
}

export function EnvironmentalSensorIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}

export function SIEMIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function ISPHandoffIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="9" width="8" height="6" rx="1" />
      <rect x="14" y="9" width="8" height="6" rx="1" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <polyline points="12 9 15 12 12 15" />
    </svg>
  )
}

export function VideoConferenceIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

export function BASControllerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function MedicalDeviceIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

export function SatelliteModemIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DataDiodeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="2" y1="12" x2="22" y2="12" />
      <polyline points="15 7 20 12 15 17" />
      <line x1="9" y1="7" x2="9" y2="17" />
    </svg>
  )
}

export function SCADAServerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polyline points="6 9 9 12 12 8 15 11 18 9" />
    </svg>
  )
}

export function GenericNetworkIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}
