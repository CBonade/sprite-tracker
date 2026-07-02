import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { signOut } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex pb-[env(safe-area-inset-bottom)]">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex-1 py-4 text-center text-sm font-medium ${isActive ? 'text-blue-400' : 'text-gray-400'}`
        }
      >
        My Sprites
      </NavLink>
      <NavLink
        to="/friends"
        className={({ isActive }) =>
          `flex-1 py-4 text-center text-sm font-medium ${isActive ? 'text-blue-400' : 'text-gray-400'}`
        }
      >
        Friends
      </NavLink>
      <button
        onClick={signOut}
        className="flex-1 py-4 text-center text-sm font-medium text-gray-400 active:text-white"
      >
        Sign Out
      </button>
    </nav>
  )
}
