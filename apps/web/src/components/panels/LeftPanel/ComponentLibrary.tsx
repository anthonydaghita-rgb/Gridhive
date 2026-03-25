import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { DEVICE_CATEGORIES, DEVICE_DISPLAY_NAMES } from '@gridhive/shared'
import { DraggableDeviceIcon } from './DraggableDeviceIcon'
import type { DeviceType } from '@gridhive/shared'
import { getDeviceIcon } from '../../../lib/icons'

export function ComponentLibrary() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    if (!search && !activeCategory) return Object.entries(DEVICE_CATEGORIES)

    return Object.entries(DEVICE_CATEGORIES)
      .filter(([cat]) => !activeCategory || cat === activeCategory)
      .map(([cat, devices]) => {
        const filtered = (devices as readonly string[]).filter(d => {
          const name = (DEVICE_DISPLAY_NAMES[d] || d).toLowerCase()
          return !search || name.includes(search.toLowerCase()) || d.includes(search.toLowerCase())
        })
        return [cat, filtered] as [string, string[]]
      })
      .filter(([, devices]) => devices.length > 0)
  }, [search, activeCategory])

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category quick-filters */}
      <div className="px-3 py-2 border-b border-gray-800 flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${!activeCategory ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          All
        </button>
        {Object.keys(DEVICE_CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredCategories.map(([category, devices]) => (
          <div key={category}>
            <h3 className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{category}</h3>
            <div className="grid grid-cols-2 gap-1">
              {(devices as string[]).map(deviceType => (
                <DraggableDeviceIcon
                  key={deviceType}
                  deviceType={deviceType as DeviceType}
                  label={DEVICE_DISPLAY_NAMES[deviceType] || deviceType}
                  icon={getDeviceIcon(deviceType as DeviceType, { size: 18 })}
                />
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-8">No devices match "{search}"</p>
        )}
      </div>
    </div>
  )
}
