import { BaseService } from './base/BaseService'
import { FirebaseService } from './firebase/FirebaseService'
import { FirebaseConfig } from '../types/services'

// Enum para tipos de serviços
export enum ServiceType {
  FIREBASE = 'firebase',
  // Futuros serviços podem ser adicionados aqui
  // SUPABASE = 'supabase',
  // MONGODB = 'mongodb',
  // REST_API = 'rest_api',
}

// Interface para configuração de serviços
interface ServiceConfiguration {
  [ServiceType.FIREBASE]: FirebaseConfig
  // Adicionar configurações para futuros serviços
}

// Classe principal para gerenciar todos os serviços
export class ServiceManager {
  private static instance: ServiceManager
  private services: Map<ServiceType, BaseService> = new Map()
  private initialized: boolean = false

  private constructor() {}

  // Singleton pattern
  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager()
    }
    return ServiceManager.instance
  }

  // Registrar um serviço
  registerService<T extends ServiceType>(
    type: T,
    config: ServiceConfiguration[T]
  ): void {
    let service: BaseService

    switch (type) {
      case ServiceType.FIREBASE:
        service = new FirebaseService(config as FirebaseConfig)
        break
      // Adicionar cases para futuros serviços
      default:
        throw new Error(`Unsupported service type: ${type}`)
    }

    this.services.set(type, service)
  }

  // Obter um serviço específico
  getService<T extends BaseService>(type: ServiceType): T | null {
    const service = this.services.get(type)
    return service as T || null
  }

  // Inicializar todos os serviços registrados
  async initializeAll(): Promise<void> {
    if (this.initialized) {
      console.warn('Services already initialized')
      return
    }

    const initPromises = Array.from(this.services.entries()).map(
      async ([type, service]) => {
        try {
          await service.initialize()
          console.info(`✅ ${type} service initialized successfully`)
        } catch (error) {
          console.error(`❌ Failed to initialize ${type} service:`, error)
          throw error
        }
      }
    )

    await Promise.all(initPromises)
    this.initialized = true
    console.info('🚀 All services initialized successfully')
  }

  // Verificar saúde de todos os serviços
  async healthCheckAll(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {}

    for (const [type, service] of Array.from(this.services.entries())) {
      try {
        healthChecks[type] = await service.healthCheck()
      } catch (error) {
        console.error(`Health check failed for ${type}:`, error)
        healthChecks[type] = false
      }
    }

    return healthChecks
  }

  // Verificar conectividade de todos os serviços
  async connectivityCheckAll(): Promise<Record<string, boolean>> {
    const connectivityChecks: Record<string, boolean> = {}

    for (const [type, service] of Array.from(this.services.entries())) {
      try {
        connectivityChecks[type] = await service.isConnected()
      } catch (error) {
        console.error(`Connectivity check failed for ${type}:`, error)
        connectivityChecks[type] = false
      }
    }

    return connectivityChecks
  }

  // Obter status de todos os serviços
  getServicesStatus(): Record<string, { registered: boolean; initialized: boolean }> {
    const status: Record<string, { registered: boolean; initialized: boolean }> = {}

    // Verificar todos os tipos de serviço possíveis
    Object.values(ServiceType).forEach(type => {
      const service = this.services.get(type)
      status[type] = {
        registered: !!service,
        initialized: service?.isInitialized || false,
      }
    })

    return status
  }

  // Limpar todos os serviços (útil para testes)
  clear(): void {
    this.services.clear()
    this.initialized = false
  }

  // Getter para verificar se está inicializado
  get isInitialized(): boolean {
    return this.initialized
  }

  // Getter para obter lista de serviços registrados
  get registeredServices(): ServiceType[] {
    return Array.from(this.services.keys())
  }
}
