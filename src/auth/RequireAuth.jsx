import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-center">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
