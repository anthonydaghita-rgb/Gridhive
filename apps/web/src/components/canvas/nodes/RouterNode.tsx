import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { RouterIcon } from '../../../lib/icons'

export function RouterNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<RouterIcon className="text-purple-300" size={20} />}
      color="bg-purple-900/50"
      borderColor="border-purple-800"
    />
  )
}
