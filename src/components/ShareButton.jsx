import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateShareImage } from '../lib/generateShareImage'

export default function ShareButton({ userId, displayName }) {
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
      setData({ sprites: spritesData ?? [], collection: map })
    }
    load()
  }, [userId])

  async function handleShare() {
    if (busy || !data) return
    setBusy(true)
    try {
      const blob = await generateShareImage({ displayName, sprites: data.sprites, collection: data.collection })
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
    <button
      onClick={handleShare}
      disabled={busy || !data}
      className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
    >
      {busy ? 'Generating…' : 'Share'}
    </button>
  )
}
