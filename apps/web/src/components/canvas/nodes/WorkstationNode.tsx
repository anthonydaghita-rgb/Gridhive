import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { WorkstationIcon } from '../../../lib/icons'

export function WorkstationNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<WorkstationIcon className="text-gray-300" size={20} />}
      color="bg-gray-800/80"
      borderColor="border-gray-700"
    />
  )
}
