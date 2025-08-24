import { BaseService as IBaseService, ServiceConfig, ApiResponse } from '../../types/services'

export abstract class BaseService implements IBaseService {
  protected _config: ServiceConfig
  protected _isInitialized: boolean = false

  constructor(config: ServiceConfig) {
    this._config = {
      timeout: 10000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }
  }

  get config(): ServiceConfig {
    return this._config
  }

  get isInitialized(): boolean {
    return this._isInitialized
  }

  // Métodos abstratos que devem ser implementados pelos serviços específicos
  abstract isConnected(): Promise<boolean>
  abstract healthCheck(): Promise<boolean>
  abstract initialize(): Promise<void>

  // Método utilitário para fazer requisições HTTP
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this._config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this._config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: 'Request successful',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Método utilitário para retry de operações
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this._config.retries || 3
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt === maxRetries) {
          throw lastError
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  // Método para logging (pode ser expandido futuramente)
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${this.constructor.name}] ${message}`
    
    switch (level) {
      case 'info':
        console.info(logMessage, data || '')
        break
      case 'warn':
        console.warn(logMessage, data || '')
        break
      case 'error':
        console.error(logMessage, data || '')
        break
    }
  }
}
