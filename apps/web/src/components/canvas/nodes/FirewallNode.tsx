import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { FirewallIcon } from '../../../lib/icons'

export function FirewallNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<FirewallIcon className="text-red-300" size={20} />}
      color="bg-red-900/50"
      borderColor="border-red-800"
    />
  )
}
