import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { NASIcon } from '../../../lib/icons'

export function NASNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<NASIcon className="text-orange-300" size={20} />}
      color="bg-orange-900/50"
      borderColor="border-orange-800"
    />
  )
}
