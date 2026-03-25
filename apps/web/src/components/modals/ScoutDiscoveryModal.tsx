import { useState } from 'react'
import { Download, Copy, Check, Wifi, Clock, X } from 'lucide-react'

interface ScoutDiscovery {
  discoveryId: string
  token: string
  expiresAt: string
}

interface Props {
  orgId: string
  projectId?: string
  onClose: () => void
  onDiscoveryComplete?: (discoveryId: string) => void
}

export function ScoutDiscoveryModal({ orgId, projectId, onClose }: Props) {
  const [step, setStep] = useState<'setup' | 'waiting' | 'complete'>('setup')
  const [discovery, setDiscovery] = useState<ScoutDiscovery | null>(null)
  const [scanMode, setScanMode] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [tokenCopied, setTokenCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const startDiscovery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scout/discoveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orgId, projectId, scanMode }),
      })
      const data = await res.json()
      setDiscovery(data)
      setStep('waiting')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    if (discovery?.token) {
      navigator.clipboard.writeText(discovery.token)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Gridhive Scout — Network Discovery</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'setup' && (
          <div className="space-y-5">
            <p className="text-gray-400 text-sm">
              Scout is a lightweight agent that runs inside your client's network and automatically discovers all devices and connections.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Scan Mode</label>
              <div className="space-y-2">
                {([
                  ['quick', 'Quick', 'ICMP + ARP only, ~2 min'],
                  ['standard', 'Standard', 'SNMP + LLDP/CDP, ~5-10 min (recommended)'],
                  ['deep', 'Deep', 'SSH + port scan, ~15-30 min'],
                ] as const).map(([value, label, desc]) => (
                  <label key={value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scanMode"
                      value={value}
                      checked={scanMode === value}
                      onChange={() => setScanMode(value)}
                      className="mt-0.5 accent-blue-500"
                    />
                    <div>
                      <span className="text-white text-sm font-medium">{label}</span>
                      <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              Ensure you have authorization to scan the target network before running Scout.
            </p>

            <button
              onClick={startDiscovery}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Generating token...' : 'Generate Discovery Token'}
            </button>
          </div>
        )}

        {step === 'waiting' && discovery && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Download Scout for your OS
              </div>
              <div className="flex gap-2 pl-7">
                {['Windows', 'macOS', 'Linux'].map(os => (
                  <a
                    key={os}
                    href={`/api/scout/download/${os.toLowerCase()}`}
                    className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {os}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Run Scout on a machine inside the target network
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Enter your discovery token when prompted
              </div>
              <div className="pl-7">
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  <code className="text-blue-300 font-mono text-sm tracking-wider flex-1">{discovery.token}</code>
                  <button
                    onClick={copyToken}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {tokenCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Expires in 24 hours
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2.5 border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Waiting for Scout to connect...
            </div>

            <button onClick={onClose} className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
