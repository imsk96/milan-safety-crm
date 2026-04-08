import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'

export default function Layout() {
  const { backgroundImage, darkMode } = useAppStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Background image layer */}
      {backgroundImage && (
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-900/90 z-0" />

      <div className="relative z-10">
        <Sidebar />
        <TopNav />
        <main className="pt-16 md:pl-64">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}