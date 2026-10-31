import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to={role === 'professor' ? '/professeur' : '/'} replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'professor' ? '/tableau-de-bord' : '/resultats'} replace />
  }
  return <Outlet />
}