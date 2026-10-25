import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider, useAuth } from './services/AuthContext.tsx'
import { LoginView } from './views/LoginView.tsx'

// Só renderiza o app com sessão válida; caso contrário, mostra o login
function AuthGate() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <App /> : <LoginView />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>,
)
