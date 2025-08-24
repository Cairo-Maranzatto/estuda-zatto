// Tipos base para a camada de serviços
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Configurações base para serviços
export interface ServiceConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

// Interface base para todos os serviços
export interface BaseService {
  config: ServiceConfig
  isConnected(): Promise<boolean>
  healthCheck(): Promise<boolean>
}

// Tipos específicos do Firebase
export interface FirebaseConfig extends ServiceConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Tipos para dados do estudante (exemplo)
export interface Student {
  id: string
  name: string
  email: string
  targetScore: number
  course: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para dados de performance
export interface Performance {
  id: string
  studentId: string
  subject: string
  score: number
  maxScore: number
  date: Date
  topics: string[]
}

// Tipos para estudos
export interface StudySession {
  id: string
  studentId: string
  subject: string
  duration: number
  topics: string[]
  startTime: Date
  endTime: Date
  performance?: number
}
