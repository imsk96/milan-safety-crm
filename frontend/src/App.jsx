import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useAppStore } from './store/appStore'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'                 // ✅ Added
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Tasks from './pages/Tasks'
import Dispatch from './pages/Dispatch'
import Visits from './pages/Visits'
import StaffManagement from './pages/StaffManagement'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const initializeApp = useAppStore((state) => state.initialize)

  useEffect(() => {
    initializeAuth()
    initializeApp()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'glass-card !bg-white/80 dark:!bg-gray-800/80' }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />   {/* ✅ Added */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/staff" element={<StaffManagement />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App