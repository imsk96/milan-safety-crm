import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Truck,
  CalendarCheck,
  Settings,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'staff'] },
  { path: '/leads', icon: Users, label: 'Leads', roles: ['admin', 'staff'] },
  { path: '/tasks', icon: ClipboardList, label: 'Tasks', roles: ['admin', 'staff'] },
  { path: '/dispatch', icon: Truck, label: 'Dispatch', roles: ['admin', 'staff'] },
  { path: '/visits', icon: CalendarCheck, label: 'Visits', roles: ['admin', 'staff'] },
  { path: '/staff', icon: UserPlus, label: 'Staff', roles: ['admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

export default function Sidebar() {
  const { profile } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, closeSidebarIfMobile } = useAppStore()

  if (!sidebarOpen) return null

  return (
    <>
      {/* ✅ OVERLAY (mobile only) */}
      <div
        className="fixed inset-0 bg-black/50 z-20 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 sm:w-64 md:w-64 h-screen glass border-r border-white/20 fixed left-0 top-0 z-30 p-3 sm:p-4 flex flex-col overflow-y-auto"
      >
        {/* ✅ CLOSE BUTTON (mobile only) */}
        <div className="flex justify-end mb-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl px-2 py-1 rounded hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 sm:mb-8 px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Milan Safety
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            if (!item.roles.includes(profile?.role)) return null
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebarIfMobile} // ✅ AUTO CLOSE ON MOBILE
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/30 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-white/20 dark:hover:bg-gray-800/30'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-sm sm:text-base">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-white/20">
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
              {profile?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name}</p>
              <p className="text-xs opacity-70 truncate">{profile?.tag_name}</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}