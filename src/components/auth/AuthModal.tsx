'use client'

import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import styles from './AuthModal.module.css'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')

  if (!isOpen) return null

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
  }

  const handleForgotPassword = () => {
    setMode('forgot-password')
  }

  const handleBackToLogin = () => {
    setMode('login')
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        {mode === 'login' && (
          <LoginForm 
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm onToggleMode={handleToggleMode} />
        )}
        
        {mode === 'forgot-password' && (
          <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
        )}
      </div>
    </div>
  )
}
