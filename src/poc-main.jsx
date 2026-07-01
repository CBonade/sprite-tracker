import { createRoot } from 'react-dom/client'
import SpriteGroup from './components/SpriteGroup'
import waterBase from './assets/base_water_sprite.webp'
import waterGold from './assets/gold_water_sprite.webp'
import waterGummy from './assets/gummy_water_sprite.webp'
import waterGalaxy from './assets/galaxy_water_sprite.webp'
import './index.css'

const sprites = [
  { id: 'w1', base_name: 'Water', variant: 'base',   full_name: 'Water Sprite',        rarity: 'rare',    image_url: waterBase },
  { id: 'w2', base_name: 'Water', variant: 'gold',    full_name: 'Gold Water Sprite',   rarity: 'special', image_url: waterGold },
  { id: 'w3', base_name: 'Water', variant: 'gummy',   full_name: 'Gummy Water Sprite',  rarity: 'special', image_url: waterGummy },
  { id: 'w4', base_name: 'Water', variant: 'galaxy',  full_name: 'Galaxy Water Sprite', rarity: 'special', image_url: waterGalaxy },
]

// base: not acquired (faded) · gold: acquired (solid) · gummy: acquired (solid) · galaxy: mastered (solid + crown)
const collection = { w2: 'acquired', w3: 'acquired', w4: 'mastered' }

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen bg-gray-900 p-6">
    <p className="text-gray-400 text-xs mb-4">POC — full Water row: base=missing, gold=acquired, gummy=acquired, galaxy=mastered</p>
    <div className="max-w-md mx-auto border border-gray-800 rounded-xl overflow-hidden">
      <SpriteGroup baseName="Water" sprites={sprites} collection={collection} filter="all" onToggle={() => {}} />
    </div>
  </div>
)
