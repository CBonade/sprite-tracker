import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const spriteWebp = path.join(__dirname, '../src/assets/galaxy_aura_sprite.webp')

const size = 512
const padding = 80
const spriteSize = size - padding * 2

const spriteBuffer = await sharp(spriteWebp)
  .resize(spriteSize, spriteSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer()

await sharp({
  create: { width: size, height: size, channels: 4, background: { r: 17, g: 24, b: 39, alpha: 1 } },
})
  .composite([{ input: spriteBuffer, top: padding, left: padding }])
  .png()
  .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))

await sharp({
  create: { width: 192, height: 192, channels: 4, background: { r: 17, g: 24, b: 39, alpha: 1 } },
})
  .composite([{
    input: await sharp(spriteWebp)
      .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer(),
    top: 26, left: 26,
  }])
  .png()
  .toFile(path.join(__dirname, '../public/icon-192.png'))

console.log('Icons generated.')
