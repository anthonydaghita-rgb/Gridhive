import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { SwitchL3Icon } from '../../../lib/icons'

export function SwitchL3Node(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<SwitchL3Icon className="text-indigo-300" size={20} />}
      color="bg-indigo-900/50"
      borderColor="border-indigo-800"
    />
  )
}
