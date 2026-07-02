// Uploads all `{variant}_{base_name}_sprite.webp` files from src/assets/ to the
// Supabase "sprite-images" storage bucket, then sets `image_url` on the matching
// `sprites` row (matched by base_name + variant).
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (not VITE_ prefixed — server-side only).
//
// Usage:
//   node --env-file=.env scripts/upload-sprite-images.js

import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = join(__dir, '..', 'src', 'assets')
const BUCKET = 'sprite-images'
const VARIANTS = ['base', 'gold', 'gummy', 'galaxy']

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

let role
try {
  role = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString()).role
} catch {}
if (role !== 'service_role') {
  console.error(`SUPABASE_SERVICE_ROLE_KEY has role="${role}" — that is not a service_role key.`)
  console.error('Get the real service role key from: Supabase dashboard → Project Settings → API → service_role secret')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const { data: sprites, error: fetchError } = await supabase
  .from('sprites')
  .select('id, base_name, variant')

if (fetchError) {
  console.error('Failed to fetch sprites:', fetchError.message)
  process.exit(1)
}

function findSprite(variant, baseNameLower) {
  return sprites.find(s => {
    const sVariant = s.variant ?? null
    return sVariant === variant && s.base_name.toLowerCase() === baseNameLower
  })
}

const files = (await readdir(ASSETS_DIR)).filter(f => f.endsWith('_sprite.webp'))
console.log(`Found ${files.length} sprite image(s) in src/assets/\n`)

let uploaded = 0
let wired = 0
let skipped = 0

for (const file of files) {
  const stem = file.replace(/_sprite\.webp$/, '')
  const parts = stem.split('_')

  let variant = null
  let baseNameLower = stem
  if (VARIANTS.includes(parts[0])) {
    variant = parts[0]
    baseNameLower = parts.slice(1).join('_')
  }

  const match = findSprite(variant, baseNameLower)
  if (!match) {
    console.warn(`  SKIP ${file}: no sprites row for variant="${variant}" base_name~="${baseNameLower}"`)
    skipped++
    continue
  }

  const buf = await readFile(join(ASSETS_DIR, file))
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(file, buf, { contentType: 'image/webp', upsert: true })

  if (uploadError) {
    console.error(`  FAIL ${file}: ${uploadError.message}`)
    continue
  }
  uploaded++

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(file)
  const { error: updateError } = await supabase
    .from('sprites')
    .update({ image_url: pub.publicUrl })
    .eq('id', match.id)

  if (updateError) {
    console.error(`  UPLOADED but DB update FAILED for ${file}: ${updateError.message}`)
    continue
  }
  wired++
  console.log(`  OK ${file} -> ${match.base_name} (${variant ?? 'one-off'})`)
}

console.log(`\nDone: ${uploaded} uploaded, ${wired} wired into sprites.image_url, ${skipped} skipped (no match).`)
