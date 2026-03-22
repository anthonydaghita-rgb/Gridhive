import type { DeviceType } from '@gridhive/shared'

interface DraggableDeviceIconProps {
  deviceType: DeviceType
  label: string
  icon: string
}

export function DraggableDeviceIcon({ deviceType, label, icon }: DraggableDeviceIconProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/gridhive-device', deviceType)
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors border border-gray-700 hover:border-gray-600"
      title={`Drag to add ${label}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] text-gray-300 text-center leading-tight">{label}</span>
    </div>
  )
}
