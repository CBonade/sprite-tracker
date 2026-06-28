import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CollectionView from '../components/CollectionView'

export default function FriendView() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [friendProfile, setFriendProfile] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
      .then(({ data }) => {
        if (!data) navigate('/friends', { replace: true })
        else setFriendProfile(data)
      })
  }, [userId])

  if (!friendProfile) {
    return <div className="text-gray-500 text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => navigate('/friends')} className="text-blue-400 text-sm">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-white">{friendProfile.display_name}</h1>
      </div>
      <CollectionView userId={userId} isReadOnly />
    </div>
  )
}
