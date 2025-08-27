import {
  EnemApiQuestion,
  EnemApiQuestionsResponse,
  GetQuestionsParams,
  GetQuestionParams,
  EnemApiError,
  RateLimitInfo,
  CacheEntry,
} from '../types/enem-api';
import {
  ENEM_API_CONFIG,
  DEFAULT_HEADERS,
  API_ENDPOINTS,
  RATE_LIMIT_HEADERS,
  CACHE_KEYS,
  RETRY_CONFIG,
} from '../config/api';

class EnemApiService {
  private cache = new Map<string, CacheEntry<any>>();
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(private config = ENEM_API_CONFIG) {}

  /**
   * Buscar questões de um ano específico
   */
  async getQuestions(params: GetQuestionsParams): Promise<EnemApiQuestionsResponse> {
    const { year = "2023", limit = 10, offset = 0, language, discipline } = params;
    const cacheKey = CACHE_KEYS.QUESTIONS(year, limit, offset, language, discipline);

    console.log('🌐 EnemApiService.getQuestions chamado com:', { year, limit, offset, language, discipline });

    // Verificar cache
    if (this.config.enableCache) {
      const cached = this.getFromCache<EnemApiQuestionsResponse>(cacheKey);
      if (cached) {
        console.log('📦 Dados encontrados no cache');
        return cached;
      }
    }

    // Construir URL com query parameters
    const queryParams: Record<string, string> = {
      limit: limit.toString(),
      offset: offset.toString(),
    };

    if (language) queryParams.language = language;
    if (discipline) queryParams.discipline = discipline;

    const url = this.buildUrl(API_ENDPOINTS.QUESTIONS(year), queryParams);
    console.log('🔗 URL construída:', url);

    try {
      const response = await this.fetchWithRetry(url);
      console.log('📡 Resposta HTTP recebida:', response.status, response.statusText);
      
      const data = await response.json() as EnemApiQuestionsResponse;
      console.log('📊 Dados JSON parseados:', { 
        questionsCount: data.questions?.length || 0, 
        metadata: data.metadata 
      });

      // Salvar no cache
      if (this.config.enableCache) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no EnemApiService.getQuestions:', error);
      console.error('❌ URL que falhou:', url);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar uma questão específica
   */
  async getQuestion(params: GetQuestionParams): Promise<EnemApiQuestion> {
    const { year, index } = params;
    const cacheKey = CACHE_KEYS.QUESTION(year, index);

    // Verificar cache
    if (this.config.enableCache) {
      const cached = this.getFromCache<EnemApiQuestion>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = this.buildUrl(API_ENDPOINTS.QUESTION(year, index));

    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json() as EnemApiQuestion;

      // Salvar no cache
      if (this.config.enableCache) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch com retry logic
   */
  private async fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Extrair informações de rate limiting
      this.extractRateLimitInfo(response);

      // Se rate limited, aguardar e tentar novamente
      if (response.status === 429) {
        const retryAfter = this.rateLimitInfo?.retryAfter || RETRY_CONFIG.baseDelay;
        
        if (attempt <= RETRY_CONFIG.maxAttempts) {
          await this.delay(retryAfter * 1000);
          return this.fetchWithRetry(url, attempt + 1);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (attempt <= RETRY_CONFIG.maxAttempts && this.isRetryableError(error)) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1),
          RETRY_CONFIG.maxDelay
        );
        
        await this.delay(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Construir URL com query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // Para URLs relativas (proxy local), construir URL completa
    let fullUrl: string;
    if (this.config.baseURL.startsWith('/')) {
      // URL relativa - usar window.location.origin se disponível, senão assumir localhost
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      fullUrl = `${origin}${this.config.baseURL}${endpoint}`;
    } else {
      // URL absoluta - usar new URL normalmente
      const url = new URL(endpoint, this.config.baseURL);
      fullUrl = url.toString();
    }

    // Adicionar query parameters se fornecidos
    if (params && Object.keys(params).length > 0) {
      const url = new URL(fullUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
      return url.toString();
    }

    return fullUrl;
  }

  /**
   * Extrair informações de rate limiting dos headers
   */
  private extractRateLimitInfo(response: Response): void {
    const limit = response.headers.get(RATE_LIMIT_HEADERS.LIMIT);
    const remaining = response.headers.get(RATE_LIMIT_HEADERS.REMAINING);
    const reset = response.headers.get(RATE_LIMIT_HEADERS.RESET);
    const retryAfter = response.headers.get(RATE_LIMIT_HEADERS.RETRY_AFTER);

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
      };
    }
  }

  /**
   * Verificar se erro é passível de retry
   */
  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('fetch')) return true;
    if (error.message?.includes('network')) return true;
    return false;
  }

  /**
   * Tratar erros da API
   */
  private handleError(error: any): EnemApiError {
    // Verificar se já é um erro formatado da API
    if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
      return error as EnemApiError;
    }

    return {
      message: error.message || 'Erro desconhecido na API',
      status: error.status || 500,
      code: error.code,
    };
  }

  /**
   * Gerenciamento de cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.cacheTimeout,
    };

    this.cache.set(key, entry);
  }

  /**
   * Limpar cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obter informações de rate limiting
   */
  public getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância singleton
export const enemApiService = new EnemApiService();
export default EnemApiService;
