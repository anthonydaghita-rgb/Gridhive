import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { HMIIcon } from '../../../lib/icons'

export function HMINode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<HMIIcon className="text-pink-300" size={20} />}
      color="bg-pink-900/50"
      borderColor="border-pink-800"
    />
  )
}
