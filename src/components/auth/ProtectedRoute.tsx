'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from './AuthModal'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ 
  children, 
  fallback, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [loading, requireAuth, isAuthenticated])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#007BFF'
      }}>
        🔄 Carregando...
      </div>
    )
  }

  // Se não requer autenticação, sempre mostrar conteúdo
  if (!requireAuth) {
    return <>{children}</>
  }

  // Se requer autenticação e usuário não está logado
  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#007BFF', marginBottom: '1rem' }}>
              🔐 Acesso Restrito
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Você precisa estar logado para acessar esta área.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
              }}
            >
              🚀 Fazer Login
            </button>
          </div>
        )}
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    )
  }

  // Usuário autenticado, mostrar conteúdo
  return <>{children}</>
}
