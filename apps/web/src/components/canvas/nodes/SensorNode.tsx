import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { SensorIcon } from '../../../lib/icons'

export function SensorNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<SensorIcon className="text-green-300" size={20} />}
      color="bg-green-900/50"
      borderColor="border-green-800"
    />
  )
}
