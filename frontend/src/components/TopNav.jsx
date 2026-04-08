import { Menu, LogOut, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { useNavigate } from 'react-router-dom'

export default function TopNav() {
  const { signOut } = useAuthStore()
  const { darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-20 h-16 glass border-b border-white/20 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold hidden sm:block">Milan Safety CRM</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-red-500"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}