import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import gummyFishy from '../assets/gummy_fishy_sprite.webp'

export default function Friends() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [following, setFollowing] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadFollowing()
  }, [])

  async function loadFollowing() {
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', profile.id)

    const ids = followData?.map(f => f.following_id) ?? []
    if (ids.length === 0) { setFollowing([]); return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', ids)

    setFollowing(profileData ?? [])
  }

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(doSearch, 300)
    return () => clearTimeout(t)
  }, [query])

  async function doSearch() {
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${query.trim()}%`)
      .neq('id', profile.id)
      .limit(10)
    setResults(data ?? [])
    setSearching(false)
  }

  async function follow(userId) {
    await supabase.from('follows').insert({ follower_id: profile.id, following_id: userId })
    setQuery('')
    setResults([])
    loadFollowing()
  }

  async function unfollow(userId) {
    await supabase.from('follows').delete()
      .eq('follower_id', profile.id)
      .eq('following_id', userId)
    setFollowing(prev => prev.filter(f => f.id !== userId))
  }

  const followingIds = new Set(following.map(f => f.id))

  return (
    <div>
      <div className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white mb-3">Friends</h1>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by display name..."
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {query.trim() && (
        <div className="border-b border-gray-800">
          {searching && <div className="text-gray-500 text-sm px-4 py-3">Searching...</div>}
          {!searching && results.length === 0 && (
            <div className="text-gray-500 text-sm px-4 py-3">No users found</div>
          )}
          {results.map(user => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <span className="text-white text-sm">{user.display_name}</span>
              {followingIds.has(user.id) ? (
                <button onClick={() => unfollow(user.id)} className="text-red-400 text-sm font-medium">Unfollow</button>
              ) : (
                <button onClick={() => follow(user.id)} className="text-blue-400 text-sm font-medium">Follow</button>
              )}
            </div>
          ))}
        </div>
      )}

      {!query.trim() && (
        <div>
          {following.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <img src={gummyFishy} alt="" className="w-16 h-16 object-contain opacity-40" />
              <div className="text-gray-500 text-sm">Search above to add friends</div>
            </div>
          )}
          {following.map(user => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <button
                onClick={() => navigate(`/friend/${user.id}`)}
                className="text-white text-sm font-medium flex-1 text-left"
              >
                {user.display_name}
              </button>
              <button onClick={() => unfollow(user.id)} className="text-gray-600 text-sm">Unfollow</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
