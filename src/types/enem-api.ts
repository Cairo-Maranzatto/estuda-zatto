// Tipos para a API enem.dev
export interface EnemApiAlternative {
  letter: string;
  text: string;
  file?: string;
  isCorrect: boolean;
}

export interface EnemApiQuestion {
  title: string;
  index: number;
  discipline: string;
  language?: string;
  year: number;
  context: string;
  files?: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: EnemApiAlternative[];
}

export interface EnemApiMetadata {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface EnemApiQuestionsResponse {
  metadata: EnemApiMetadata;
  questions: EnemApiQuestion[];
}

// Parâmetros para requisições
export interface GetQuestionsParams {
  year?: string; // Opcional para permitir busca sem ano específico
  limit?: number;
  offset?: number;
  language?: 'ingles' | 'espanhol';
  discipline?: EnemDiscipline; // Adicionar discipline como parâmetro
}

export interface GetQuestionParams {
  year: string;
  index: number;
}

// Tipos para cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Tipos para rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Tipos para erros da API
export interface EnemApiError {
  message: string;
  status: number;
  code?: string;
}

// Disciplinas disponíveis
export type EnemDiscipline = 
  | 'linguagens'
  | 'matematica' 
  | 'humanas'
  | 'natureza'
  | 'todas';

// Idiomas disponíveis
export type EnemLanguage = 'ingles' | 'espanhol';

// Anos disponíveis (pode ser expandido)
export type EnemYear = 
  | '2020' 
  | '2021' 
  | '2022' 
  | '2023';

// Estado do hook useEnemApi
export interface UseEnemApiState {
  data: EnemApiQuestionsResponse | null;
  loading: boolean;
  error: EnemApiError | null;
  rateLimitInfo: RateLimitInfo | null;
}

// Configurações do serviço
export interface EnemApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  cacheTimeout: number;
  enableCache: boolean;
}
