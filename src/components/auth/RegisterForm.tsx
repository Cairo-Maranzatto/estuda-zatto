'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './RegisterForm.module.css'

interface RegisterFormProps {
  onToggleMode: () => void
}

const courses = [
  'Medicina',
  'Direito',
  'Engenharia',
  'Psicologia',
  'Administração',
  'Enfermagem',
  'Arquitetura',
  'Odontologia',
  'Farmácia',
  'Fisioterapia',
  'Outros'
]

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetScore: 650,
    course: 'Medicina'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, loading, error } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetScore' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }

    if (formData.password.length < 6) {
      return
    }

    try {
      await register({
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
        targetScore: formData.targetScore,
        course: formData.course
      })
    } catch (error) {
      console.error('Erro no registro:', error)
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword
  const passwordValid = formData.password.length >= 6

  return (
    <div className={styles.registerForm}>
      <div className={styles.header}>
        <h2>🎯 Criar Conta no Estuda Zatto</h2>
        <p>Comece sua jornada rumo ao sucesso no ENEM</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="displayName">Nome Completo</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="course">Curso Desejado</label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="targetScore">Meta de Pontos</label>
            <input
              id="targetScore"
              name="targetScore"
              type="number"
              min="400"
              max="1000"
              value={formData.targetScore}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <div className={styles.passwordInput}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
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
          {formData.password && !passwordValid && (
            <span className={styles.validation}>⚠️ Senha deve ter pelo menos 6 caracteres</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <div className={styles.passwordInput}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <span className={styles.validation}>⚠️ Senhas não coincidem</span>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !passwordValid || !passwordsMatch || !formData.displayName || !formData.email}
        >
          {loading ? '🔄 Criando conta...' : '🚀 Criar Conta'}
        </button>

        <div className={styles.links}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={onToggleMode}
            disabled={loading}
          >
            Já tem conta? Faça login
          </button>
        </div>
      </form>
    </div>
  )
}
