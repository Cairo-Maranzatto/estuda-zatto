'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user para desenvolvimento
const createMockUser = (credentials: LoginCredentials | RegisterCredentials): User => {
  const baseUser = {
    uid: 'mock-user-' + Date.now(),
    email: credentials.email,
    displayName: 'displayName' in credentials ? credentials.displayName : 'Usuário Teste',
    photoURL: null,
    emailVerified: true,
    targetScore: 'targetScore' in credentials ? credentials.targetScore : 650,
    course: 'course' in credentials ? credentials.course : 'Medicina',
    studyStartDate: new Date(),
    preferences: {
      theme: 'light' as const,
      notifications: true,
      studyReminders: true,
      weeklyGoals: 20,
    },
  }
  return baseUser
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false, // Começar sem loading para desenvolvimento
    error: null,
    isAuthenticated: false,
  })

  // Login mock para desenvolvimento
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validação básica
      if (credentials.email === 'admin@test.com' && credentials.password === '123456') {
        const user = createMockUser(credentials)
        
        // Salvar no localStorage para persistência
        localStorage.setItem('mockUser', JSON.stringify(user))
        
        setAuthState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        })
      } else {
        throw new Error('Credenciais inválidas. Use admin@test.com / 123456')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Registro mock para desenvolvimento
  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const user = createMockUser(credentials)
      
      // Salvar no localStorage para persistência
      localStorage.setItem('mockUser', JSON.stringify(user))
      
      setAuthState({
        user,
        loading: false,
        error: null,
        isAuthenticated: true,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      // Remover do localStorage
      localStorage.removeItem('mockUser')
      
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout'
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Atualizar perfil
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado')

      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Atualizar estado local
      const updatedUser = { ...authState.user, ...data }
      
      // Salvar no localStorage
      localStorage.setItem('mockUser', JSON.stringify(updatedUser))
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`Email de reset enviado para: ${email}`)
      // Em produção, aqui seria a chamada real para Firebase
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar email'
      throw new Error(errorMessage)
    }
  }

  // Verificar localStorage na inicialização
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mockUser')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setAuthState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        })
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
