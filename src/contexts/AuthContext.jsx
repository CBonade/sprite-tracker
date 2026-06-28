import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('hash on mount:', window.location.hash)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession result:', session, error)
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('auth event:', event, session)
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
    setLoading(false)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function setDisplayName(displayName) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: session.user.id, display_name: displayName })
      .select()
      .single()
    if (error) throw error
    setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signInWithGoogle, signOut, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
