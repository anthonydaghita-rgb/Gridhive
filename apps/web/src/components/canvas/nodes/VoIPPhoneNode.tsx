import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { VoIPPhoneIcon } from '../../../lib/icons'

export function VoIPPhoneNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<VoIPPhoneIcon className="text-cyan-300" size={20} />}
      color="bg-cyan-900/50"
      borderColor="border-cyan-800"
    />
  )
}
