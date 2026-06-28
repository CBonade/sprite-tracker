import { useAuth } from '../contexts/AuthContext'
import CollectionView from '../components/CollectionView'

export default function Home() {
  const { profile } = useAuth()

  return (
    <div>
      <div className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">{profile?.display_name}</h1>
      </div>
      <CollectionView userId={profile.id} />
    </div>
  )
}
