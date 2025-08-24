// Tipos baseados na API enem.dev
export interface QuestionAlternative {
  letter: string;
  text: string;
  file?: string;
  isCorrect: boolean;
}

export interface Question {
  title: string;
  index: number;
  discipline: 'matematica' | 'linguagens' | 'humanas' | 'natureza';
  language?: string;
  year: number;
  context: string;
  files?: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: QuestionAlternative[];
  // Campos adicionais para o mockup
  id: string;
  subject: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  tags: string[];
  stats: {
    successRate: number;
    averageTime: number;
  };
  status?: 'nao_resolvida' | 'acertou' | 'errou';
  isFavorite?: boolean;
}

export interface QuestionsMetadata {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface QuestionsResponse {
  metadata: QuestionsMetadata;
  questions: Question[];
}

// Tipos para filtros
export interface QuestionFilters {
  search: string;
  discipline: string;
  difficulty: string;
  year: string;
  status: string;
}

export interface FilterTag {
  id: string;
  label: string;
  value: string;
  type: keyof QuestionFilters;
}

// Tipos para estatísticas do header
export interface QuestionsStats {
  total: number;
  resolved: number;
  successRate: number;
}

// Tipo para visualização
export type ViewMode = 'grid' | 'list';

// Mapeamento de disciplinas para cores
export const DISCIPLINE_COLORS = {
  matematica: '#e74c3c',
  linguagens: '#27ae60', 
  humanas: '#3498db',
  natureza: '#f39c12'
} as const;

// Mapeamento de dificuldades para classes CSS
export const DIFFICULTY_CLASSES = {
  facil: 'difficulty-facil',
  medio: 'difficulty-medio', 
  dificil: 'difficulty-dificil'
} as const;
