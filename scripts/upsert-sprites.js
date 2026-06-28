// Usage: node --env-file=.env scripts/upsert-sprites.js '[{...}, ...]'
// Or:    node --env-file=.env scripts/upsert-sprites.js path/to/sprites.json
//
// Each sprite object:
// {
//   base_name: string,          e.g. "Water"
//   variant: string | null,     "base" | "gold" | "gummy" | "galaxy" | null (for one-offs)
//   full_name: string,          e.g. "Gold Water Sprite"
//   rarity: string,             "rare" | "epic" | "legendary" | "mythic" | "special"
//   is_starter: boolean,
//   sort_order: number
// }

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const input = process.argv[2]
if (!input) {
  console.error('Usage: node --env-file=.env scripts/upsert-sprites.js \'[...]\' or path/to/file.json')
  process.exit(1)
}

let sprites
try {
  sprites = JSON.parse(input)
} catch {
  try {
    sprites = JSON.parse(readFileSync(input, 'utf-8'))
  } catch (err) {
    console.error('Failed to parse input:', err.message)
    process.exit(1)
  }
}

const { data, error } = await supabase
  .from('sprites')
  .upsert(sprites, { onConflict: 'full_name' })
  .select()

if (error) {
  console.error('Upsert failed:', error.message)
  process.exit(1)
}

console.log(`Upserted ${data.length} sprites:`)
data.forEach(s => console.log(`  [${s.sort_order}] ${s.full_name} (${s.rarity})`))
