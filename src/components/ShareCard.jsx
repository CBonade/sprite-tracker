import { forwardRef } from 'react'
import crownMastered from '../assets/crown_mastered.png'

const CARD_WIDTH = 1080
const COLUMNS = 8
const GAP = 16
const PADDING = 48
const TILE = Math.floor((CARD_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS)

const ShareCard = forwardRef(function ShareCard({ displayName, sprites, collection }, ref) {
  const total = sprites.length
  const owned = sprites.filter(s => collection[s.id]).length
  const mastered = sprites.filter(s => collection[s.id] === 'mastered').length
  const pct = total ? Math.round((owned / total) * 100) : 0

  return (
    <div
      ref={ref}
      style={{
        width: CARD_WIDTH,
        padding: PADDING,
        background: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#60a5fa' }}>
          SPRITE TRACKER
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>
          {displayName}&rsquo;s Collection
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, fontSize: 22 }}>
          <span><b>{owned}</b>/{total} Acquired</span>
          <span><b style={{ color: '#4ade80' }}>{mastered}</b> Mastered</span>
          <span><b style={{ color: '#fbbf24' }}>{pct}%</b> Complete</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLUMNS}, ${TILE}px)`,
          gap: GAP,
          justifyContent: 'center',
        }}
      >
        {sprites.map(sprite => {
          const status = collection[sprite.id] ?? null
          return (
            <div key={sprite.id} style={{ position: 'relative', width: TILE, height: TILE }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#1f2937' }}>
                {sprite.image_url && (
                  <img
                    src={sprite.image_url}
                    crossOrigin="anonymous"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: status ? 1 : 0.25 }}
                  />
                )}
              </div>
              {status === 'mastered' && (
                <img
                  src={crownMastered}
                  alt=""
                  style={{ position: 'absolute', top: -6, right: -6, width: 22 }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#6b7280' }}>
        Generated {new Date().toLocaleDateString()}
      </div>
    </div>
  )
})

export default ShareCard
