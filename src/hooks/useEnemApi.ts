import { useState, useCallback, useRef, useEffect } from 'react';
import {
  EnemApiQuestion,
  EnemApiQuestionsResponse,
  GetQuestionsParams,
  GetQuestionParams,
  EnemApiError,
  RateLimitInfo,
  UseEnemApiState,
} from '../types/enem-api';
import { enemApiService } from '../services/EnemApiService';

export function useEnemApi() {
  const [state, setState] = useState<UseEnemApiState>({
    data: null,
    loading: false,
    error: null,
    rateLimitInfo: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Limpar requisições pendentes ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Buscar questões
   */
  const fetchQuestions = useCallback(async (params: GetQuestionsParams) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const data = await enemApiService.getQuestions(params);
      const rateLimitInfo = enemApiService.getRateLimitInfo();

      setState({
        data,
        loading: false,
        error: null,
        rateLimitInfo,
      });

      return data;
    } catch (error) {
      const apiError = error as EnemApiError;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        rateLimitInfo: enemApiService.getRateLimitInfo(),
      }));

      throw apiError;
    }
  }, []);

  /**
   * Buscar questão específica
   */
  const fetchQuestion = useCallback(async (params: GetQuestionParams): Promise<EnemApiQuestion> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const question = await enemApiService.getQuestion(params);
      const rateLimitInfo = enemApiService.getRateLimitInfo();

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        rateLimitInfo,
      }));

      return question;
    } catch (error) {
      const apiError = error as EnemApiError;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        rateLimitInfo: enemApiService.getRateLimitInfo(),
      }));

      throw apiError;
    }
  }, []);

  /**
   * Limpar cache
   */
  const clearCache = useCallback(() => {
    enemApiService.clearCache();
  }, []);

  /**
   * Reset do estado
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      rateLimitInfo: null,
    });
  }, []);

  return {
    ...state,
    fetchQuestions,
    fetchQuestion,
    clearCache,
    reset,
  };
}

/**
 * Hook para buscar questões com paginação automática
 */
export function useEnemQuestions(initialParams: GetQuestionsParams) {
  const { fetchQuestions, ...apiState } = useEnemApi();
  const [allQuestions, setAllQuestions] = useState<EnemApiQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);

  const loadQuestions = useCallback(async (reset = false) => {
    const offset = reset ? 0 : currentOffset;
    
    try {
      const response = await fetchQuestions({
        ...initialParams,
        offset,
      });

      if (reset) {
        setAllQuestions(response.questions);
      } else {
        setAllQuestions(prev => [...prev, ...response.questions]);
      }

      setHasMore(response.metadata.hasMore);
      setCurrentOffset(offset + response.questions.length);
    } catch (error) {
      // Error já está no estado do useEnemApi
    }
  }, [fetchQuestions, initialParams, currentOffset]);

  const loadMore = useCallback(() => {
    if (!apiState.loading && hasMore) {
      loadQuestions(false);
    }
  }, [loadQuestions, apiState.loading, hasMore]);

  const refresh = useCallback(() => {
    setCurrentOffset(0);
    setHasMore(true);
    loadQuestions(true);
  }, [loadQuestions]);

  // Carregar questões iniciais
  useEffect(() => {
    loadQuestions(true);
  }, [initialParams.year, initialParams.discipline, initialParams.language]);

  return {
    ...apiState,
    questions: allQuestions,
    metadata: apiState.data?.metadata || { limit: 0, offset: 0, total: 0, hasMore: false },
    hasMore,
    loadMore,
    refresh,
    refetch: () => refresh(),
    rateLimited: apiState.rateLimitInfo?.remaining === 0,
  };
}

export default useEnemApi;
