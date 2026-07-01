import crownMastered from '../assets/crown_mastered.png'

const VARIANT_ORDER = ['base', 'gold', 'gummy', 'galaxy']
const VARIANT_LABEL = { base: 'Base', gold: 'Gold', gummy: 'Gum', galaxy: 'Gal' }

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
  if (status === 'mastered') return 'bg-green-700 text-green-100'
  if (status === 'acquired') return 'bg-amber-700 text-amber-100'
  return 'bg-gray-700 text-gray-300'
}

export default function SpriteGroup({ baseName, sprites, collection, filter = 'all', onToggle }) {
  const isOneOff = sprites.length === 1 && sprites[0].variant === null
  const baseSprite = sprites.find(s => s.variant === 'base' || s.variant === null)
  const baseRarity = baseSprite?.rarity ?? 'rare'

  const allVariants = isOneOff
    ? sprites
    : VARIANT_ORDER.map(v => sprites.find(s => s.variant === v)).filter(Boolean)

  const orderedVariants = filter === 'all'
    ? allVariants
    : allVariants.filter(s => {
        const status = collection[s.id] ?? null
        if (filter === 'missing') return status === null
        if (filter === 'acquired') return status === 'acquired'
        if (filter === 'mastered') return status === 'mastered'
        return true
      })

  function handleTap(sprite) {
    if (!onToggle) return
    const current = collection[sprite.id] ?? null
    const next = current === null ? 'acquired' : current === 'acquired' ? 'mastered' : null
    onToggle(sprite.id, next)
  }

  return (
    <div className="px-4 py-3 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${RARITY_CLASS[baseRarity] ?? ''}`}
          style={RARITY_STYLE[baseRarity] ?? undefined}
        >
          {RARITY_LABEL[baseRarity]}
        </span>
        <span className="text-white text-sm font-medium">{baseName}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {orderedVariants.map(sprite => {
          const status = collection[sprite.id] ?? null

          if (sprite.image_url) {
            return (
              <button
                key={sprite.id}
                onClick={() => handleTap(sprite)}
                disabled={!onToggle}
                className={`relative w-10 h-9 rounded-lg overflow-visible transition-transform ${onToggle ? 'active:scale-90' : 'cursor-default'}`}
                title={sprite.full_name}
              >
                <div className="w-full h-full rounded-lg bg-gray-800 overflow-hidden">
                  <img
                    src={sprite.image_url}
                    alt={sprite.full_name}
                    className={`w-full h-full object-cover transition-opacity ${status ? 'opacity-100' : 'opacity-35'}`}
                  />
                </div>
                {status === 'mastered' && (
                  <img
                    src={crownMastered}
                    alt=""
                    className="absolute -top-1.5 -right-1.5 w-4 drop-shadow"
                  />
                )}
              </button>
            )
          }

          return (
            <button
              key={sprite.id}
              onClick={() => handleTap(sprite)}
              disabled={!onToggle}
              className={`w-10 h-9 rounded-lg text-[10px] font-bold transition-transform ${statusClass(status)} ${onToggle ? 'active:scale-90' : 'cursor-default'}`}
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
