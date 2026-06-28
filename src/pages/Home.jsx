import { useAuth } from '../contexts/AuthContext'
import CollectionView from '../components/CollectionView'
import kingSprite from '../assets/base_king_sprite.webp'

export default function Home() {
  const { profile } = useAuth()

  return (
    <div>
      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-3">
        <img src={kingSprite} alt="" className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-bold text-white">{profile?.display_name}</h1>
      </div>
      <CollectionView userId={profile.id} />
    </div>
  )
}
