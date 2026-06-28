const VARIANT_ORDER = ['base', 'gold', 'gummy', 'galaxy']
const VARIANT_LABEL = { base: 'B', gold: 'G', gummy: 'Gm', galaxy: 'Gl' }

const RARITY_CLASS = {
  rare: 'bg-blue-600',
  epic: 'bg-purple-600',
  legendary: 'bg-orange-500',
  mythic: 'bg-amber-600',
}
const RARITY_STYLE = {
  special: { background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)' },
}
const RARITY_LABEL = {
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LGND',
  mythic: 'MYTH',
  special: 'SPEC',
}

function statusClass(status) {
  if (status === 'mastered') return 'bg-green-500 text-white'
  if (status === 'acquired') return 'bg-amber-500 text-white'
  return 'bg-gray-700 text-gray-500'
}

export default function SpriteGroup({ baseName, sprites, collection, onToggle }) {
  const isOneOff = sprites.length === 1 && sprites[0].variant === null
  const baseSprite = sprites.find(s => s.variant === 'base' || s.variant === null)
  const baseRarity = baseSprite?.rarity ?? 'rare'

  const orderedVariants = isOneOff
    ? sprites
    : VARIANT_ORDER.map(v => sprites.find(s => s.variant === v)).filter(Boolean)

  function handleTap(sprite) {
    if (!onToggle) return
    const current = collection[sprite.id] ?? null
    const next = current === null ? 'acquired' : current === 'acquired' ? 'mastered' : null
    onToggle(sprite.id, next)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${RARITY_CLASS[baseRarity] ?? ''}`}
          style={RARITY_STYLE[baseRarity] ?? undefined}
        >
          {RARITY_LABEL[baseRarity]}
        </span>
        <span className="text-white text-sm font-medium truncate">{baseName}</span>
      </div>

      <div className="flex gap-1.5 shrink-0">
        {orderedVariants.map(sprite => {
          const status = collection[sprite.id] ?? null
          return (
            <button
              key={sprite.id}
              onClick={() => handleTap(sprite)}
              disabled={!onToggle}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition-transform ${statusClass(status)} ${onToggle ? 'active:scale-90' : 'cursor-default'}`}
              title={sprite.full_name}
            >
              {isOneOff ? '●' : VARIANT_LABEL[sprite.variant]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
