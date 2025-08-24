'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

export default function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return
    }

    try {
      await login({ email, password })
    } catch (error) {
      console.error('Erro no login:', error)
    }
  }

  return (
    <div className={styles.loginForm}>
      <div className={styles.header}>
        <h2>🎯 Entrar no Estuda Zatto</h2>
        <p>Acesse seu dashboard personalizado</p>
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
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <div className={styles.passwordInput}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !email || !password}
        >
          {loading ? '🔄 Entrando...' : '🚀 Entrar'}
        </button>

        <div className={styles.links}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={onForgotPassword}
            disabled={loading}
          >
            Esqueceu a senha?
          </button>
          
          <button
            type="button"
            className={styles.linkButton}
            onClick={onToggleMode}
            disabled={loading}
          >
            Não tem conta? Cadastre-se
          </button>
        </div>
      </form>
    </div>
  )
}
