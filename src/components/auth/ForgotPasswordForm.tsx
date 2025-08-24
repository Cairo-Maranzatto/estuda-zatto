'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './ForgotPasswordForm.module.css'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    try {
      setIsLoading(true)
      setError('')
      setMessage('')
      
      await resetPassword(email)
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao enviar email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.forgotForm}>
      <div className={styles.header}>
        <h2>🔐 Recuperar Senha</h2>
        <p>Digite seu email para receber o link de recuperação</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className={styles.success}>
            ✅ {message}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !email}
        >
          {isLoading ? '🔄 Enviando...' : '📧 Enviar Email'}
        </button>

        <button
          type="button"
          className={styles.backButton}
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          ← Voltar ao Login
        </button>
      </form>
    </div>
  )
}
