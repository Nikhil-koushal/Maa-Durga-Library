import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return <div className="full-screen-center">Loading…</div>
  return session ? <Dashboard /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
