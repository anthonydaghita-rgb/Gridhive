import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'

export function FirewallNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<span className="text-lg">🔥</span>}
      color="bg-red-900/50"
      borderColor="border-red-800"
    />
  )
}
