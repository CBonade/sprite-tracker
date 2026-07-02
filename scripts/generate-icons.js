import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const spriteWebp = path.join(__dirname, '../src/assets/galaxy_aura_sprite.webp')

const PADDING_RATIO = 0.09375 // ~48px of padding at 512px size

// Sprite art carries a lot of transparent margin around the character (room
// for floating leaf/particle decorations), so trim to the character's actual
// bounding box before fitting it into the icon — otherwise it renders tiny.
const trimmedSprite = await sharp(spriteWebp).trim().toBuffer()

const size = 512
const padding = Math.round(size * PADDING_RATIO)
const spriteSize = size - padding * 2

const spriteBuffer = await sharp(trimmedSprite)
  .resize(spriteSize, spriteSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer()

await sharp({
  create: { width: size, height: size, channels: 4, background: { r: 17, g: 24, b: 39, alpha: 1 } },
})
  .composite([{ input: spriteBuffer, top: padding, left: padding }])
  .png()
  .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))

const smallSize = 192
const smallPadding = Math.round(smallSize * PADDING_RATIO)
const smallSpriteSize = smallSize - smallPadding * 2

await sharp({
  create: { width: smallSize, height: smallSize, channels: 4, background: { r: 17, g: 24, b: 39, alpha: 1 } },
})
  .composite([{
    input: await sharp(trimmedSprite)
      .resize(smallSpriteSize, smallSpriteSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer(),
    top: smallPadding, left: smallPadding,
  }])
  .png()
  .toFile(path.join(__dirname, '../public/icon-192.png'))

console.log('Icons generated.')
