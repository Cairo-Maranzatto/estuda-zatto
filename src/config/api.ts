import { EnemApiConfig } from '../types/enem-api';

// Configuração da API enem.dev
export const ENEM_API_CONFIG: EnemApiConfig = {
  baseURL: '/api/enem', // Usar proxy local ao invés da API externa
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  enableCache: true,
};

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Endpoints da API
export const API_ENDPOINTS = {
  QUESTIONS: (year: string) => `/questions?year=${year}`,
  QUESTION: (year: string, index: number) => `/questions/${index}?year=${year}`,
  EXAMS: '/exams',
} as const;

// Rate limiting headers
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After',
} as const;

// Cache keys
export const CACHE_KEYS = {
  QUESTIONS: (year: string, limit: number, offset: number, language?: string, discipline?: string) => 
    `questions_${year}_${limit}_${offset}_${language || 'all'}_${discipline || 'all'}`,
  QUESTION: (year: string, index: number) => `question_${year}_${index}`,
} as const;

// Configurações de retry
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
} as const;
