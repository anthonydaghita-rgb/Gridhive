import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { PatchPanelIcon } from '../../../lib/icons'

export function PatchPanelNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<PatchPanelIcon className="text-slate-300" size={20} />}
      color="bg-slate-800/80"
      borderColor="border-slate-600"
    />
  )
}
