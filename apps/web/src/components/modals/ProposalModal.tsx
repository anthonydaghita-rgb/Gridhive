import { useState, useMemo } from 'react'
import { X, FileText, Download, Plus, Trash2, ChevronDown, ChevronRight, Building2, Loader2 } from 'lucide-react'
import { useCanvasStore } from '../../stores/canvasStore'
import { useProjectStore } from '../../stores/projectStore'
import type { DeviceData } from '@gridhive/shared'
import type { Node } from '@xyflow/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BOMLine {
  id: string
  category: 'hardware' | 'licensing' | 'services' | 'support'
  description: string
  partNumber?: string
  qty: number
  unitCost: number
  unitPrice: number
  nodeId?: string   // linked canvas device
}

interface ProposalMeta {
  clientName: string
  clientEmail: string
  projectName: string
  validDays: number
  preparedBy: string
  notes: string
  taxRate: number
  marginPct: number
}

// ── Default pricing per device type ─────────────────────────────────────────

const DEFAULT_PRICING: Record<string, { desc: string; unitCost: number; partNumber?: string }> = {
  'switch-l2':     { desc: 'Managed L2 Switch (24-port)', unitCost: 450,  partNumber: 'SW-L2-24' },
  'switch-l3':     { desc: 'Managed L3 Switch (24-port)', unitCost: 1200, partNumber: 'SW-L3-24' },
  'router':        { desc: 'Enterprise Router',           unitCost: 800,  partNumber: 'RTR-ENT' },
  'firewall':      { desc: 'NGFW Appliance',              unitCost: 2500, partNumber: 'FW-NG' },
  'firewall-edge': { desc: 'Edge Firewall / UTM',         unitCost: 1800, partNumber: 'FW-UTM' },
  'wireless-ap':   { desc: 'Wireless Access Point',       unitCost: 350,  partNumber: 'AP-802' },
  'server':        { desc: 'Rack Server (1U)',             unitCost: 3500, partNumber: 'SRV-1U' },
  'server-rack':   { desc: 'Rack Server (2U)',             unitCost: 4500, partNumber: 'SRV-2U' },
  'nas':           { desc: 'NAS / Storage Appliance',     unitCost: 1200, partNumber: 'NAS-4B' },
  'workstation':   { desc: 'Workstation PC',              unitCost: 900,  partNumber: 'WS-STD' },
  'laptop':        { desc: 'Business Laptop',             unitCost: 1200, partNumber: 'LT-BIZ' },
  'voip-phone':    { desc: 'VoIP Desk Phone',             unitCost: 120,  partNumber: 'VOIP-PH' },
  'camera':        { desc: 'IP Security Camera',          unitCost: 250,  partNumber: 'CAM-IP' },
  'ups':           { desc: 'UPS / Battery Backup (1500VA)',unitCost: 350,  partNumber: 'UPS-15' },
  'patch-panel':   { desc: 'Patch Panel (24-port)',        unitCost: 80,   partNumber: 'PP-24' },
  'printer':       { desc: 'Laser Printer',               unitCost: 450,  partNumber: 'PRT-LZR' },
  'internet':      { desc: 'Internet Circuit (monthly)',   unitCost: 400,  partNumber: 'ISP-MRC' },
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function buildBOMFromCanvas(nodes: Node<DeviceData>[], marginPct: number): BOMLine[] {
  const lines: BOMLine[] = []
  for (const node of nodes) {
    const pricing = DEFAULT_PRICING[node.type as string]
    if (!pricing) continue
    const data = node.data as DeviceData & Record<string, unknown>
    const unitCost = pricing.unitCost
    const unitPrice = Math.round(unitCost * (1 + marginPct / 100))
    lines.push({
      id: generateId(),
      category: 'hardware',
      description: (data.label as string | undefined) || pricing.desc,
      partNumber: pricing.partNumber,
      qty: 1,
      unitCost,
      unitPrice,
      nodeId: node.id,
    })
  }
  return lines
}

// ── Currency format ───────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Category badge ────────────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  hardware:   'bg-blue-900/50 text-blue-300',
  licensing:  'bg-purple-900/50 text-purple-300',
  services:   'bg-green-900/50 text-green-300',
  support:    'bg-yellow-900/50 text-yellow-300',
}

// ── PDF generation ────────────────────────────────────────────────────────────

async function generatePDF(meta: ProposalMeta, lines: BOMLine[]) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  ;(pdfMake as unknown as Record<string, unknown>).vfs = (pdfFonts as unknown as Record<string, unknown>).vfs

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const tax = Math.round(subtotal * meta.taxRate) / 100
  const total = subtotal + tax

  const tableRows = [
    [
      { text: 'Item', bold: true, fillColor: '#1f2937', color: '#e5e7eb' },
      { text: 'Part #', bold: true, fillColor: '#1f2937', color: '#e5e7eb' },
      { text: 'Qty', bold: true, fillColor: '#1f2937', color: '#e5e7eb', alignment: 'center' },
      { text: 'Unit Price', bold: true, fillColor: '#1f2937', color: '#e5e7eb', alignment: 'right' },
      { text: 'Total', bold: true, fillColor: '#1f2937', color: '#e5e7eb', alignment: 'right' },
    ],
    ...lines.map((l, i) => [
      { text: l.description, fillColor: i % 2 === 0 ? '#111827' : '#0f172a', color: '#e5e7eb', fontSize: 9 },
      { text: l.partNumber || '—', fillColor: i % 2 === 0 ? '#111827' : '#0f172a', color: '#6b7280', fontSize: 9 },
      { text: String(l.qty), fillColor: i % 2 === 0 ? '#111827' : '#0f172a', color: '#e5e7eb', alignment: 'center', fontSize: 9 },
      { text: fmt(l.unitPrice), fillColor: i % 2 === 0 ? '#111827' : '#0f172a', color: '#e5e7eb', alignment: 'right', fontSize: 9 },
      { text: fmt(l.qty * l.unitPrice), fillColor: i % 2 === 0 ? '#111827' : '#0f172a', color: '#e5e7eb', alignment: 'right', fontSize: 9 },
    ]),
  ]

  const docDef: object = {
    background: { canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: '#030712' }] },
    content: [
      { text: 'NETWORK INFRASTRUCTURE PROPOSAL', style: 'header', color: '#3b82f6' },
      { text: meta.projectName, style: 'subheader', color: '#e5e7eb', margin: [0, 2, 0, 0] },
      {
        columns: [
          { text: `Prepared for:\n${meta.clientName}\n${meta.clientEmail}`, color: '#9ca3af', fontSize: 9, margin: [0, 8, 0, 0] },
          { text: `Prepared by: ${meta.preparedBy}\nValid for: ${meta.validDays} days\nDate: ${new Date().toLocaleDateString()}`, color: '#9ca3af', fontSize: 9, margin: [0, 8, 0, 0], alignment: 'right' },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1f2937' }], margin: [0, 12, 0, 12] },
      {
        table: { headerRows: 1, widths: ['*', 80, 30, 70, 70], body: tableRows },
        layout: { defaultBorder: false },
      },
      {
        margin: [0, 8, 0, 0],
        columns: [
          { text: '', width: '*' },
          {
            width: 200,
            table: {
              widths: ['*', 80],
              body: [
                [{ text: 'Subtotal', color: '#9ca3af', fontSize: 9 }, { text: fmt(subtotal), color: '#e5e7eb', alignment: 'right', fontSize: 9 }],
                [{ text: `Tax (${meta.taxRate}%)`, color: '#9ca3af', fontSize: 9 }, { text: fmt(tax), color: '#e5e7eb', alignment: 'right', fontSize: 9 }],
                [{ text: 'TOTAL', bold: true, color: '#3b82f6', fontSize: 11 }, { text: fmt(total), bold: true, color: '#3b82f6', alignment: 'right', fontSize: 11 }],
              ],
            },
            layout: 'noBorders',
          },
        ],
      },
      ...(meta.notes ? [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1f2937' }], margin: [0, 16, 0, 10] },
        { text: 'Notes', bold: true, color: '#6b7280', fontSize: 9 },
        { text: meta.notes, color: '#9ca3af', fontSize: 9, margin: [0, 4, 0, 0] },
      ] : []),
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 4] },
      subheader: { fontSize: 13, margin: [0, 0, 0, 0] },
    },
    defaultStyle: { font: 'Roboto' },
    pageMargins: [40, 40, 40, 40],
  }

  pdfMake.createPdf(docDef as Parameters<typeof pdfMake.createPdf>[0]).download(`proposal-${meta.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function ProposalModal({ onClose }: { onClose: () => void }) {
  const { nodes } = useCanvasStore()
  const { currentProject } = useProjectStore()

  const [meta, setMeta] = useState<ProposalMeta>({
    clientName: '',
    clientEmail: '',
    projectName: currentProject?.name || 'Network Infrastructure',
    validDays: 30,
    preparedBy: '',
    notes: '',
    taxRate: 8.5,
    marginPct: 30,
  })

  const [lines, setLines] = useState<BOMLine[]>(() =>
    buildBOMFromCanvas(nodes as Node<DeviceData>[], 30)
  )
  const [pdfLoading, setPdfLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>('meta')

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0), [lines])
  const tax = Math.round(subtotal * meta.taxRate) / 100
  const total = subtotal + tax
  const totalCost = lines.reduce((s, l) => s + l.qty * l.unitCost, 0)
  const margin = subtotal - totalCost

  function updateLine(id: string, field: keyof BOMLine, value: string | number) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: value }
      // Auto-recalc price when cost or margin changes
      if (field === 'unitCost') updated.unitPrice = Math.round((value as number) * (1 + meta.marginPct / 100))
      return updated
    }))
  }

  function addLine() {
    setLines(prev => [...prev, {
      id: generateId(),
      category: 'services',
      description: 'New line item',
      qty: 1,
      unitCost: 0,
      unitPrice: 0,
    }])
  }

  function removeLine(id: string) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function rebuildFromCanvas() {
    setLines(buildBOMFromCanvas(nodes as Node<DeviceData>[], meta.marginPct))
  }

  async function handleDownload() {
    setPdfLoading(true)
    try { await generatePDF(meta, lines) }
    catch (e) { console.error('PDF generation failed:', e) }
    finally { setPdfLoading(false) }
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/60 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors"
        onClick={() => setActiveSection(s => s === id ? null : id)}
      >
        {title}
        {activeSection === id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {activeSection === id && <div className="p-4">{children}</div>}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">Proposal Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={rebuildFromCanvas}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors"
            >
              Rebuild from Canvas
            </button>
            <button
              onClick={handleDownload}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export PDF
            </button>
            <button onClick={onClose}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Proposal meta */}
          <Section id="meta" title="Proposal Details">
            <div className="grid grid-cols-2 gap-3">
              <MField label="Client Name">
                <input value={meta.clientName} onChange={e => setMeta(m => ({ ...m, clientName: e.target.value }))} placeholder="Acme Corp" className={iCls} />
              </MField>
              <MField label="Client Email">
                <input value={meta.clientEmail} onChange={e => setMeta(m => ({ ...m, clientEmail: e.target.value }))} placeholder="it@acme.com" className={iCls} />
              </MField>
              <MField label="Project Name">
                <input value={meta.projectName} onChange={e => setMeta(m => ({ ...m, projectName: e.target.value }))} className={iCls} />
              </MField>
              <MField label="Prepared By">
                <input value={meta.preparedBy} onChange={e => setMeta(m => ({ ...m, preparedBy: e.target.value }))} placeholder="Your name" className={iCls} />
              </MField>
              <MField label="Valid (days)">
                <input type="number" value={meta.validDays} onChange={e => setMeta(m => ({ ...m, validDays: Number(e.target.value) }))} className={iCls} />
              </MField>
              <MField label="Tax Rate (%)">
                <input type="number" step="0.1" value={meta.taxRate} onChange={e => setMeta(m => ({ ...m, taxRate: Number(e.target.value) }))} className={iCls} />
              </MField>
              <MField label="Margin %" >
                <input type="number" value={meta.marginPct} onChange={e => setMeta(m => ({ ...m, marginPct: Number(e.target.value) }))} className={iCls} />
              </MField>
            </div>
            <MField label="Notes / Terms">
              <textarea value={meta.notes} onChange={e => setMeta(m => ({ ...m, notes: e.target.value }))} rows={2} className={`${iCls} resize-none`} placeholder="Payment terms, warranty info…" />
            </MField>
          </Section>

          {/* BOM Lines */}
          <Section id="bom" title={`Bill of Materials (${lines.length} items)`}>
            <div className="space-y-1.5 mb-3">
              {lines.map(line => (
                <div key={line.id} className="grid grid-cols-[1fr_90px_50px_80px_80px_28px] gap-1.5 items-center">
                  <input
                    value={line.description}
                    onChange={e => updateLine(line.id, 'description', e.target.value)}
                    className={`${iCls} text-[11px]`}
                  />
                  <select
                    value={line.category}
                    onChange={e => updateLine(line.id, 'category', e.target.value)}
                    className={`${iCls} text-[11px]`}
                  >
                    {(['hardware', 'licensing', 'services', 'support'] as const).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number" min="1"
                    value={line.qty}
                    onChange={e => updateLine(line.id, 'qty', Number(e.target.value))}
                    className={`${iCls} text-center text-[11px]`}
                  />
                  <input
                    type="number"
                    value={line.unitCost}
                    onChange={e => updateLine(line.id, 'unitCost', Number(e.target.value))}
                    className={`${iCls} text-[11px]`}
                    title="Unit Cost (internal)"
                  />
                  <input
                    type="number"
                    value={line.unitPrice}
                    onChange={e => updateLine(line.id, 'unitPrice', Number(e.target.value))}
                    className={`${iCls} text-[11px] border-blue-800`}
                    title="Unit Price (billed to client)"
                  />
                  <button onClick={() => removeLine(line.id)} className="text-gray-700 hover:text-red-400 transition-colors flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-gray-600 grid grid-cols-[1fr_90px_50px_80px_80px_28px] gap-1.5 w-full">
                <span className="text-gray-600">Description</span>
                <span>Category</span>
                <span className="text-center">Qty</span>
                <span>Cost</span>
                <span className="text-blue-400">Price (client)</span>
                <span />
              </span>
            </div>
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line Item
            </button>
          </Section>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 w-72 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal</span><span className="text-gray-200">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Tax ({meta.taxRate}%)</span><span className="text-gray-200">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Cost basis</span><span>{fmt(totalCost)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-400">
                <span>Margin</span><span>{fmt(margin)} ({subtotal > 0 ? Math.round((margin / subtotal) * 100) : 0}%)</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-base">
                <span className="text-white">Total</span><span className="text-blue-400">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

const iCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500'
