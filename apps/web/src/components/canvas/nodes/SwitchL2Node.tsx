import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { SwitchL2Icon } from '../../../lib/icons'

export function SwitchL2Node(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<SwitchL2Icon className="text-blue-300" size={20} />}
      color="bg-blue-900/50"
      borderColor="border-blue-800"
    />
  )
}
