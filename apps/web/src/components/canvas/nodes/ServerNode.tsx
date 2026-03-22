import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { ServerIcon } from '../../../lib/icons'

export function ServerNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<ServerIcon className="text-emerald-300" size={20} />}
      color="bg-emerald-900/50"
      borderColor="border-emerald-800"
    />
  )
}
