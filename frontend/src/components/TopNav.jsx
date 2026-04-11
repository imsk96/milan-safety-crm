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

  // ✅ FIX: proper toggle logic (mobile + desktop safe)
  const handleSidebarToggle = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(true) // mobile pe always open
    } else {
      setSidebarOpen(!sidebarOpen) // desktop toggle
    }
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-20 h-14 sm:h-16 glass border-b border-white/20 px-3 sm:px-4 flex items-center justify-between">
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleSidebarToggle}
          className="p-2 sm:p-2 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base sm:text-lg font-semibold hidden sm:block">
          Milan Safety CRM
        </h1>
        <h1 className="text-base font-semibold sm:hidden">
          Milan Safety
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 sm:p-2 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 sm:p-2 rounded-lg hover:bg-white/20 transition-colors text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}