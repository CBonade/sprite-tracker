import crownMastered from '../assets/crown_mastered.png'

const CARD_WIDTH = 1080
const COLUMNS = 8
const GAP = 16
const PADDING = 48
const TILE = Math.floor((CARD_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS)
const HEADER_HEIGHT = 220
const FOOTER_HEIGHT = 70
const SCALE = 2 // render at 2x for a crisp share image

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Draws the collection summary directly on a <canvas> and exports it as a
// PNG blob. Deliberately avoids DOM-to-image capture libraries (html-to-image,
// html2canvas, etc.) — those serialize the DOM into an SVG <foreignObject> and
// rasterize that, which has longstanding WebKit bugs that silently drop raster
// images from the output (confirmed via a WebKit-engine test 2026-07-09; the
// generated image had every sprite tile blank while text/local-asset badges
// rendered fine). Native canvas drawImage has no such issue on any engine.
export async function generateShareImage({ displayName, sprites, collection }) {
  const total = sprites.length
  const owned = sprites.filter(s => collection[s.id]).length
  const mastered = sprites.filter(s => collection[s.id] === 'mastered').length
  const pct = total ? Math.round((owned / total) * 100) : 0

  const rows = Math.max(1, Math.ceil(sprites.length / COLUMNS))
  const gridHeight = rows * TILE + (rows - 1) * GAP
  const height = HEADER_HEIGHT + gridHeight + FOOTER_HEIGHT + PADDING * 2

  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, '#111827')
  grad.addColorStop(1, '#030712')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CARD_WIDTH, height)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#60a5fa'
  ctx.font = '800 22px system-ui, -apple-system, sans-serif'
  ctx.fillText('SPRITE TRACKER', CARD_WIDTH / 2, PADDING + 20)

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 40px system-ui, -apple-system, sans-serif'
  ctx.fillText(`${displayName}’s Collection`, CARD_WIDTH / 2, PADDING + 72)

  const statsY = PADDING + 118
  const seg1 = `${owned}/${total} Acquired`
  const seg2 = `${mastered} Mastered`
  const seg3 = `${pct}% Complete`
  const segGap = 24
  ctx.font = '22px system-ui, -apple-system, sans-serif'
  const w1 = ctx.measureText(seg1).width
  const w2 = ctx.measureText(seg2).width
  const w3 = ctx.measureText(seg3).width
  let x = CARD_WIDTH / 2 - (w1 + w2 + w3 + segGap * 2) / 2
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(seg1, x, statsY)
  x += w1 + segGap
  ctx.fillStyle = '#4ade80'
  ctx.fillText(seg2, x, statsY)
  x += w2 + segGap
  ctx.fillStyle = '#fbbf24'
  ctx.fillText(seg3, x, statsY)

  const crownImg = await loadImage(crownMastered).catch(() => null)
  const spriteImages = await Promise.all(
    sprites.map(s => (s.image_url ? loadImage(s.image_url).catch(() => null) : null))
  )

  const gridTop = HEADER_HEIGHT
  sprites.forEach((sprite, i) => {
    const col = i % COLUMNS
    const row = Math.floor(i / COLUMNS)
    const tx = PADDING + col * (TILE + GAP)
    const ty = gridTop + row * (TILE + GAP)
    const status = collection[sprite.id] ?? null

    ctx.fillStyle = '#1f2937'
    roundRect(ctx, tx, ty, TILE, TILE, 12)
    ctx.fill()

    const img = spriteImages[i]
    if (img) {
      ctx.save()
      roundRect(ctx, tx, ty, TILE, TILE, 12)
      ctx.clip()
      ctx.globalAlpha = status ? 1 : 0.25
      const coverScale = Math.max(TILE / img.width, TILE / img.height)
      const dw = img.width * coverScale
      const dh = img.height * coverScale
      ctx.drawImage(img, tx + (TILE - dw) / 2, ty + (TILE - dh) / 2, dw, dh)
      ctx.restore()
      ctx.globalAlpha = 1
    }

    if (status === 'mastered' && crownImg) {
      const badgeW = 22
      const badgeH = badgeW * (crownImg.height / crownImg.width)
      ctx.drawImage(crownImg, tx + TILE - 6, ty - 6, badgeW, badgeH)
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = '#6b7280'
  ctx.font = '14px system-ui, -apple-system, sans-serif'
  ctx.fillText(`Generated ${new Date().toLocaleDateString()}`, CARD_WIDTH / 2, gridTop + gridHeight + 40)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}
