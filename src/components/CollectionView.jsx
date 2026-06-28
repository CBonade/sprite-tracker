import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import SpriteGroup from './SpriteGroup'
import goldGhost from '../assets/gold_ghost_sprite.webp'

const FILTERS = ['all', 'missing', 'acquired', 'mastered']
const FILTER_LABELS = { all: 'All', missing: 'Missing', acquired: 'Acquired', mastered: 'Mastered' }
const RARITY_ORDER = { rare: 1, epic: 2, legendary: 3, mythic: 4 }

export default function CollectionView({ userId, isReadOnly = false }) {
  const [sprites, setSprites] = useState([])
  const [collection, setCollection] = useState({})
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: spritesData }, { data: collectionData }] = await Promise.all([
        supabase.from('sprites').select('*').order('sort_order'),
        supabase.from('user_collections').select('sprite_id, status').eq('user_id', userId),
      ])
      setSprites(spritesData ?? [])
      const map = {}
      for (const row of collectionData ?? []) map[row.sprite_id] = row.status
      setCollection(map)
      setLoading(false)
    }
    load()
  }, [userId])

  async function handleToggle(spriteId, next) {
    setCollection(prev => {
      const updated = { ...prev }
      if (next === null) delete updated[spriteId]
      else updated[spriteId] = next
      return updated
    })

    if (next === null) {
      await supabase.from('user_collections')
        .delete()
        .eq('user_id', userId)
        .eq('sprite_id', spriteId)
    } else {
      await supabase.from('user_collections')
        .upsert({ user_id: userId, sprite_id: spriteId, status: next, updated_at: new Date().toISOString() })
    }
  }

  const groups = useMemo(() => {
    const map = new Map()
    for (const sprite of sprites) {
      if (!map.has(sprite.base_name)) map.set(sprite.base_name, [])
      map.get(sprite.base_name).push(sprite)
    }
    return [...map.entries()]
  }, [sprites])

  const filteredGroups = useMemo(() => {
    const filtered = filter === 'all'
      ? groups
      : groups.filter(([, list]) =>
          list.some(sprite => {
            const status = collection[sprite.id] ?? null
            if (filter === 'missing') return status === null
            if (filter === 'acquired') return status === 'acquired'
            if (filter === 'mastered') return status === 'mastered'
            return true
          })
        )

    if (sort === 'alpha') return [...filtered].sort(([a], [b]) => a.localeCompare(b))
    if (sort === 'rarity') {
      return [...filtered].sort(([, aList], [, bList]) => {
        const aRarity = aList.find(s => s.variant === 'base' || s.variant === null)?.rarity
        const bRarity = bList.find(s => s.variant === 'base' || s.variant === null)?.rarity
        return (RARITY_ORDER[aRarity] ?? 99) - (RARITY_ORDER[bRarity] ?? 99)
      })
    }
    return filtered
  }, [groups, collection, filter, sort])

  const total = sprites.length
  const owned = Object.keys(collection).length
  const mastered = Object.values(collection).filter(s => s === 'mastered').length

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-4 text-sm text-gray-400 border-b border-gray-800">
        <span><span className="text-white font-semibold">{owned}</span>/{total} acquired</span>
        <span><span className="text-green-400 font-semibold">{mastered}</span> mastered</span>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="ml-auto bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1 outline-none border border-gray-700"
        >
          <option value="default">Default order</option>
          <option value="alpha">A–Z</option>
          <option value="rarity">By rarity</option>
        </select>
      </div>

      <div className="flex border-b border-gray-800">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-semibold ${filter === f ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="px-4 py-2 flex gap-3 text-xs text-gray-500 border-b border-gray-800">
        <span><span className="inline-block w-3 h-3 rounded bg-gray-700 mr-1 align-middle" />None</span>
        <span><span className="inline-block w-3 h-3 rounded bg-amber-500 mr-1 align-middle" />Acquired</span>
        <span><span className="inline-block w-3 h-3 rounded bg-green-500 mr-1 align-middle" />Mastered</span>
        {!isReadOnly && <span className="ml-auto text-gray-600">tap to cycle</span>}
      </div>

      {filteredGroups.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <img src={goldGhost} alt="" className="w-16 h-16 object-contain opacity-40" />
          <div className="text-gray-500 text-sm">Nothing here</div>
        </div>
      )}
      {filteredGroups.map(([baseName, list]) => (
        <SpriteGroup
          key={baseName}
          baseName={baseName}
          sprites={list}
          collection={collection}
          onToggle={isReadOnly ? null : handleToggle}
        />
      ))}
    </div>
  )
}
