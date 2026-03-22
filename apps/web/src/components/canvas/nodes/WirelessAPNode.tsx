import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { WirelessAPIcon } from '../../../lib/icons'

export function WirelessAPNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<WirelessAPIcon className="text-teal-300" size={20} />}
      color="bg-teal-900/50"
      borderColor="border-teal-800"
    />
  )
}
