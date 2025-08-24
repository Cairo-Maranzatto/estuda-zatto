// Exportações principais da camada de serviços
export { ServiceManager, ServiceType } from './ServiceManager'
export { BaseService } from './base/BaseService'
export { FirebaseService } from './firebase/FirebaseService'

// Exportar tipos
export type {
  ApiResponse,
  PaginatedResponse,
  ServiceConfig,
  FirebaseConfig,
  Student,
  Performance,
  StudySession,
} from '../types/services'

// Função utilitária para configurar serviços
import { ServiceManager, ServiceType } from './ServiceManager'
import { FirebaseConfig } from '../types/services'

export const configureServices = async () => {
  const serviceManager = ServiceManager.getInstance()

  // Configuração do Firebase (usar variáveis de ambiente)
  const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  }

  // Registrar Firebase service
  serviceManager.registerService(ServiceType.FIREBASE, firebaseConfig)

  // Inicializar todos os serviços
  try {
    await serviceManager.initializeAll()
    return serviceManager
  } catch (error) {
    console.error('Failed to initialize services:', error)
    throw error
  }
}

// Hook personalizado para usar serviços (para uso futuro com React)
export const useServices = () => {
  return ServiceManager.getInstance()
}
