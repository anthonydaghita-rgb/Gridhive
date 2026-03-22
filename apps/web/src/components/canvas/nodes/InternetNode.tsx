import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { InternetIcon } from '../../../lib/icons'

export function InternetNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<InternetIcon className="text-amber-300" size={20} />}
      color="bg-amber-900/50"
      borderColor="border-amber-700"
    />
  )
}
