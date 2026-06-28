import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function DisplayNameModal() {
  const { setDisplayName } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError('')
    try {
      await setDisplayName(trimmed)
    } catch (err) {
      setError(err.message.includes('unique') ? 'That name is already taken.' : 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-1">Choose a display name</h2>
        <p className="text-gray-400 text-sm mb-5">Friends will search for you by this name.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Display name"
            maxLength={30}
            className="bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="bg-blue-600 text-white font-semibold py-3 rounded-xl disabled:opacity-40 active:opacity-80"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
