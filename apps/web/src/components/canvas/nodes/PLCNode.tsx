import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { PLCIcon } from '../../../lib/icons'

export function PLCNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<PLCIcon className="text-lime-300" size={20} />}
      color="bg-lime-900/50"
      borderColor="border-lime-800"
    />
  )
}
