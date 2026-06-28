import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import DisplayNameModal from './components/DisplayNameModal'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Friends from './pages/Friends'
import FriendView from './pages/FriendView'

function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Sprite Tracker</h1>
        <p className="text-gray-400">Track your Fortnite sprite collection</p>
      </div>
      <button
        onClick={signInWithGoogle}
        className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl active:opacity-70"
      >
        Sign in with Google
      </button>
    </div>
  )
}

function AppShell() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) return <LoginScreen />

  if (!profile) return <DisplayNameModal />

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-auto pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friend/:userId" element={<FriendView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <NavBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
