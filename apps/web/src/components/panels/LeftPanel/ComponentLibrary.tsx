import { DEVICE_CATEGORIES, DEVICE_DISPLAY_NAMES } from '@gridhive/shared'
import { DraggableDeviceIcon } from './DraggableDeviceIcon'
import type { DeviceType } from '@gridhive/shared'

const DEVICE_ICONS: Record<string, string> = {
  'firewall': '🔥',
  'firewall-edge': '🔥',
  'switch-l2': '🔀',
  'switch-l3': '🔄',
  'router': '🌐',
  'server': '🖥',
  'workstation': '💻',
  'wireless-ap': '📡',
  'camera': '📷',
  'voip-phone': '📞',
  'printer': '🖨',
  'nas': '💾',
  'internet': '🌍',
  'plc': '⚙️',
  'sensor': '📟',
  'hmi': '🖱',
  'patch-panel': '🔌',
}

export function ComponentLibrary() {
  return (
    <div className="p-3 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Device Library</h2>

      {Object.entries(DEVICE_CATEGORIES).map(([category, devices]) => (
        <div key={category}>
          <h3 className="text-xs text-gray-500 mb-2 font-medium">{category}</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(devices as readonly string[]).map((deviceType) => (
              <DraggableDeviceIcon
                key={deviceType}
                deviceType={deviceType as DeviceType}
                label={DEVICE_DISPLAY_NAMES[deviceType] || deviceType}
                icon={DEVICE_ICONS[deviceType] || '📦'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
