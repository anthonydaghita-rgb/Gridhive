import type { NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { PrinterIcon } from '../../../lib/icons'

export function PrinterNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      data={props.data as DeviceData}
      icon={<PrinterIcon className="text-gray-300" size={20} />}
      color="bg-gray-800/80"
      borderColor="border-gray-600"
    />
  )
}
