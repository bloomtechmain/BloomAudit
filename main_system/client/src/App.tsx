import './App.css'
import { useState, useEffect, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

type User = { 
  id: number
  name: string
  email: string
  roleId: number | null
  roleName: string | null
  permissions: string[]
}

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ background: '#eee', padding: 10, borderRadius: 4, maxWidth: '800px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', borderRadius: 8, background: '#0061ff', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Try to load auth state from localStorage
    const stored = localStorage.getItem('authState')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return { user: null, accessToken: null, refreshToken: null }
      }
    }
    return { user: null, accessToken: null, refreshToken: null }
  })

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (authState.user && authState.accessToken) {
      localStorage.setItem('authState', JSON.stringify(authState))
    } else {
      localStorage.removeItem('authState')
    }
  }, [authState])

  const handleLogin = (user: User, accessToken: string, refreshToken: string) => {
    setAuthState({ user, accessToken, refreshToken })
  }

  const handleLogout = () => {
    setAuthState({ user: null, accessToken: null, refreshToken: null })
    localStorage.removeItem('authState')
  }

  if (!authState.user || !authState.accessToken || !authState.refreshToken) {
    return <Login onLoggedIn={handleLogin} />
  }

  return (
    <ErrorBoundary>
      <Dashboard 
        user={authState.user} 
        accessToken={authState.accessToken}
        refreshToken={authState.refreshToken}
        onLogout={handleLogout}
        onTokenRefresh={(newAccessToken: string) => {
          setAuthState(prev => ({ ...prev, accessToken: newAccessToken }))
        }}
      />
    </ErrorBoundary>
  )
}
