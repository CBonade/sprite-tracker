import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { supabase } from '../lib/supabase'
import ShareCard from './ShareCard'

// html-to-image's built-in cross-origin image fetching is unreliable on real
// mobile browsers (silently produces blank tiles). Fetching each sprite image
// ourselves and inlining it as a same-origin data URI sidesteps that entirely.
async function toDataUrl(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function ShareButton({ userId, displayName }) {
  const cardRef = useRef(null)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: spritesData }, { data: collectionData }] = await Promise.all([
        supabase.from('sprites').select('*').order('sort_order'),
        supabase.from('user_collections').select('sprite_id, status').eq('user_id', userId),
      ])
      const map = {}
      for (const row of collectionData ?? []) map[row.sprite_id] = row.status

      const sprites = await Promise.all(
        (spritesData ?? []).map(async sprite => {
          if (!sprite.image_url) return sprite
          try {
            return { ...sprite, image_url: await toDataUrl(sprite.image_url) }
          } catch {
            return sprite // fall back to the remote URL if the fetch fails
          }
        })
      )

      setData({ sprites, collection: map })
    }
    load()
  }, [userId])

  async function handleShare() {
    if (busy || !data) return
    setBusy(true)
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2 })
      if (!blob) throw new Error('Failed to generate image')
      const file = new File([blob], 'sprite-collection.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Sprite Collection',
          text: 'Check out my Fortnite sprite collection!',
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sprite-collection.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Share failed:', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={busy || !data}
        className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
      >
        {busy ? 'Generating…' : 'Share'}
      </button>

      {data && (
        <div style={{ position: 'fixed', top: 0, left: -99999, pointerEvents: 'none' }}>
          <ShareCard ref={cardRef} displayName={displayName} sprites={data.sprites} collection={data.collection} />
        </div>
      )}
    </>
  )
}
