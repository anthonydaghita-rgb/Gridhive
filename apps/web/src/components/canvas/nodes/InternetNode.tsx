import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'

export function InternetNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<span className="text-lg">🌍</span>}
      color="bg-yellow-900/50"
      borderColor="border-yellow-700"
    />
  )
}
