import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { CameraIcon } from '../../../lib/icons'

export function CameraNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<CameraIcon className="text-yellow-300" size={20} />}
      color="bg-yellow-900/50"
      borderColor="border-yellow-800"
    />
  )
}
