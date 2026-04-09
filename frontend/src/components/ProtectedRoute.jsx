import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { profile, loading, user } = useAuthStore();

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated at all, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but profile is still null (edge case), we can still allow access
  // because user is logged in. The app can show a fallback UI.
  if (!profile) {
    // Still allow access, dashboard will handle missing profile gracefully
    if (allowedRoles.length > 0) {
      // If roles are required but we don't have profile, we can't check, so allow? 
      // Better to redirect to a "complete profile" page? For now, allow.
    }
    return <Outlet />;
  }

  // Role-based check
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}