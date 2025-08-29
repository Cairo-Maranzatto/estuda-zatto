'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEnemApi } from '../hooks/useEnemApi';
import { EnemApiQuestion, EnemDiscipline } from '../types/enem-api';
import styles from './BancoQuestoes.module.css';

// Types baseados na API enem.dev
interface Alternative {
  letter: string;
  text: string;
  file?: string;
  isCorrect: boolean;
}

interface Question {
  title: string;
  index: number;
  discipline: EnemDiscipline;
  language?: string;
  year: number;
  context: string;
  files?: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Alternative[];
}

interface QuestionsMetadata {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

interface QuestionsResponse {
  metadata: QuestionsMetadata;
  questions: Question[];
}

// Interface para o estado do BancoQuestoes
interface BancoQuestoesState {
  searchTerm: string;
  selectedArea: EnemDiscipline | "todas";
  selectedDifficulty: string;
  selectedYear: string;
  currentPage: number;
  activeFilters: string[];
  rawQuestionsData: QuestionsResponse;
  hasSearched: boolean;
}

interface BancoQuestoesProps {
  onResolverQuestao?: (question: Question, questionIndex: number, total: number) => void;
  onStateChange?: (state: BancoQuestoesState) => void;
  initialState?: BancoQuestoesState | null;
}

// Função para converter dados da API para formato interno
const convertApiQuestionToInternal = (apiQuestion: EnemApiQuestion): Question => {
  return {
    title: `Questão ${apiQuestion.index} - ENEM ${apiQuestion.year}`,
    index: apiQuestion.index,
    discipline: apiQuestion.discipline,
    language: apiQuestion.language,
    year: apiQuestion.year,
    context: apiQuestion.context,
    files: apiQuestion.files,
    correctAlternative: apiQuestion.correctAlternative,
    alternativesIntroduction: apiQuestion.alternativesIntroduction,
    alternatives: apiQuestion.alternatives.map(alt => ({
      letter: alt.letter,
      text: alt.text,
      file: alt.file,
      isCorrect: alt.isCorrect
    }))
  };
};

// Função para calcular dificuldade baseada em estatísticas simuladas
const calculateDifficulty = (questionIndex: number): 'Fácil' | 'Médio' | 'Difícil' => {
  const mockAccuracy = 45 + (questionIndex % 40); // Simula taxa de acerto entre 45-85%
  if (mockAccuracy >= 75) return 'Fácil';
  if (mockAccuracy >= 55) return 'Médio';
  return 'Difícil';
};

const BancoQuestoes: React.FC<BancoQuestoesProps> = ({ onResolverQuestao, onStateChange, initialState }) => {
  const [searchTerm, setSearchTerm] = useState(initialState?.searchTerm || "");
  const [selectedArea, setSelectedArea] = useState<EnemDiscipline | "todas">(initialState?.selectedArea || "todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialState?.selectedDifficulty || "todas");
  const [selectedYear, setSelectedYear] = useState<string | "todos">(initialState?.selectedYear || "todos");
  const [currentPage, setCurrentPage] = useState(initialState?.currentPage || 1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilters, setActiveFilters] = useState<string[]>(initialState?.activeFilters || []);
  const [loadingProgress, setLoadingProgress] = useState<{
    current: number;
    total: number;
    discipline?: string;
  } | null>(null);
  const [rawQuestionsData, setRawQuestionsData] = useState<QuestionsResponse>(
    initialState?.rawQuestionsData || {
      metadata: { limit: 0, offset: 0, total: 0, hasMore: false },
      questions: []
    }
  );
  const [hasSearched, setHasSearched] = useState(initialState?.hasSearched || false);

  // Hook para API manual
  const {
    data: apiData,
    loading,
    error,
    rateLimitInfo,
    fetchQuestions,
    reset
  } = useEnemApi();

  // Função para salvar estado atual
  const saveCurrentState = useCallback(() => {
    if (onStateChange) {
      const currentState: BancoQuestoesState = {
        searchTerm,
        selectedArea,
        selectedDifficulty,
        selectedYear,
        currentPage,
        activeFilters,
        rawQuestionsData,
        hasSearched
      };
      onStateChange(currentState);
    }
  }, [searchTerm, selectedArea, selectedDifficulty, selectedYear, currentPage, activeFilters, rawQuestionsData, hasSearched, onStateChange]);

  // Salvar estado sempre que houver mudanças relevantes
  useEffect(() => {
    saveCurrentState();
  }, [saveCurrentState]);

  // Função de filtragem local otimizada com useMemo
  const filteredQuestions = useMemo(() => {
    let questions = rawQuestionsData.questions;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      questions = questions.filter(question => 
        question.context.toLowerCase().includes(searchLower) ||
        question.title.toLowerCase().includes(searchLower) ||
        question.alternativesIntroduction.toLowerCase().includes(searchLower) ||
        question.alternatives.some(alt => alt.text.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por disciplina
    if (selectedArea !== "todas") {
      questions = questions.filter(question => question.discipline === selectedArea);
    }

    // Filtro por dificuldade
    if (selectedDifficulty !== "todas") {
      questions = questions.filter(question => {
        const difficulty = calculateDifficulty(question.index);
        return difficulty === selectedDifficulty;
      });
    }

    return questions;
  }, [rawQuestionsData.questions, searchTerm, selectedArea, selectedDifficulty]);

  // Dados paginados
  const paginatedQuestions = useMemo(() => {
    const itemsPerPage = 12;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      questions: filteredQuestions.slice(startIndex, endIndex),
      metadata: {
        limit: itemsPerPage,
        offset: startIndex,
        total: filteredQuestions.length,
        hasMore: endIndex < filteredQuestions.length
      }
    };
  }, [filteredQuestions, currentPage]);

  // Função para realizar busca na API com carregamento automático
  const handleSearch = useCallback(async () => {
    setHasSearched(true);
    setCurrentPage(1);
    setLoadingProgress({ current: 0, total: 0, discipline: selectedArea !== "todas" ? selectedArea : undefined });
    
    try {
      const year = selectedYear !== "todos" ? selectedYear : "2023";
      let allQuestions: Question[] = [];
      let offset = 0;
      let hasMore = true;
      let requestCount = 0;
      const maxRequests = 10; // Limite para evitar loop infinito
      
      // Buscar múltiplas páginas automaticamente
      while (hasMore && requestCount < maxRequests) {
        const searchParams = {
          year,
          limit: 50, // Limite máximo da API ENEM
          offset,
        };

        setLoadingProgress({ 
          current: requestCount + 1, 
          total: maxRequests,
          discipline: selectedArea !== "todas" ? selectedArea : undefined
        });

        console.log(`🔄 Buscando página ${requestCount + 1} (offset: ${offset})`);
        const response = await fetchQuestions(searchParams);
        
        if (response && response.questions && response.questions.length > 0) {
          const convertedQuestions = response.questions.map(convertApiQuestionToInternal);
          allQuestions = [...allQuestions, ...convertedQuestions];
          
          // Verificar se há mais questões
          hasMore = response.metadata.hasMore;
          offset += 50;
          requestCount++;
          
          console.log(`✅ Carregadas ${convertedQuestions.length} questões. Total: ${allQuestions.length}`);
          
          // Se não há filtro específico de disciplina, parar após algumas páginas
          if (selectedArea === "todas" && requestCount >= 4) {
            console.log('🛑 Parando busca automática - sem filtro específico');
            break;
          }
          
          // Se há filtro de disciplina, verificar se temos questões suficientes dessa disciplina
          if (selectedArea !== "todas") {
            const questionsOfSelectedArea = allQuestions.filter(q => q.discipline === selectedArea);
            if (questionsOfSelectedArea.length >= 20) { // Parar quando tiver pelo menos 20 questões da disciplina
              console.log(`🎯 Encontradas ${questionsOfSelectedArea.length} questões de ${selectedArea}`);
              break;
            }
          }
        } else {
          hasMore = false;
        }
      }

      if (allQuestions.length > 0) {
        setRawQuestionsData({
          metadata: {
            limit: 50,
            offset: 0,
            total: allQuestions.length,
            hasMore: requestCount >= maxRequests
          },
          questions: allQuestions
        });
        
        console.log(`🏁 Busca concluída: ${allQuestions.length} questões carregadas em ${requestCount} requisições`);
      }
    } catch (error) {
      console.warn('Erro ao buscar questões da API:', error);
    } finally {
      setLoadingProgress(null);
    }
  }, [fetchQuestions, selectedYear, selectedArea]);

  // Handlers para filtros (resetam página para 1)
  const handleAreaChange = (area: EnemDiscipline | "todas") => {
    setSelectedArea(area);
    setCurrentPage(1);
    if (area !== "todas") {
      addActiveFilter(`Área: ${disciplineMap[area as EnemDiscipline]?.name || area}`);
    } else {
      removeActiveFilter(activeFilters.find((f) => f.startsWith("Área:")) || "");
    }
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1);
    if (difficulty !== "todas") {
      addActiveFilter(`Dificuldade: ${difficulty}`);
    } else {
      removeActiveFilter(activeFilters.find((f) => f.startsWith("Dificuldade:")) || "");
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
    if (year !== "todos") {
      addActiveFilter(`Ano: ${year}`);
    } else {
      removeActiveFilter(activeFilters.find((f) => f.startsWith("Ano:")) || "");
    }
  };

  // Função para navegar entre páginas
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredQuestions.length / 12);

  // Mapeamento de disciplinas
  const disciplineMap: Record<EnemDiscipline, { name: string; color: string }> = {
    matematica: { name: "Matemática", color: "matematica" },
    linguagens: { name: "Linguagens", color: "linguagens" },
    humanas: { name: "Ciências Humanas", color: "humanas" },
    natureza: { name: "Ciências da Natureza", color: "natureza" },
  };

  // Função para obter estatísticas simuladas da questão
  const getQuestionStats = (index: number) => {
    const accuracy = 45 + (index % 40);
    const time = 2 + (index % 3);
    return { accuracy, time };
  };

  // Função para adicionar filtro ativo
  const addActiveFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Função para remover filtro ativo
  const removeActiveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  // Handler para resolver questão
  const handleResolverQuestao = (questionIndex: number) => {
    const question = paginatedQuestions.questions.find(q => q.index === questionIndex);
    const arrayIndex = paginatedQuestions.questions.findIndex(q => q.index === questionIndex);
    
    if (question && onResolverQuestao) {
      // Salvar estado antes de navegar para resolução
      saveCurrentState();
      onResolverQuestao(question, arrayIndex, paginatedQuestions.questions.length);
    }
  };

  return (
    <div className={styles.bancoQuestoes}>
      {/* Header */}
      <div className={styles.header}>
        <h1>
          <i className="fas fa-question-circle"></i>
          Banco de Questões ENEM
        </h1>
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            📊 {rawQuestionsData.metadata.total.toLocaleString()} questões totais
          </div>
          <div className={styles.statItem}>
            🔍 {filteredQuestions.length.toLocaleString()} encontradas
          </div>
          {hasSearched && (
            <div className={styles.statItem}>
              📝 {rawQuestionsData.questions.length} carregadas
            </div>
          )}
        </div>
      </div>

      {/* Status da API */}
      {error && (
        <div className={styles.apiStatus}>
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            Erro ao carregar questões da API.
            <button onClick={handleSearch} className={styles.retryBtn}>
              <i className="fas fa-redo"></i> Tentar novamente
            </button>
          </div>
        </div>
      )}

      {rateLimitInfo?.remaining === 0 && (
        <div className={styles.apiStatus}>
          <div className={styles.warningMessage}>
            <i className="fas fa-clock"></i>
            Limite de requisições atingido. Aguarde um momento.
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>🔍 Filtros e Busca</div>
          <div className={styles.searchBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar questões por palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || loadingProgress !== null}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Área de Conhecimento</label>
            <select
              className={styles.filterSelect}
              value={selectedArea}
              onChange={(e) => handleAreaChange(e.target.value as EnemDiscipline | "todas")}
              disabled={loading || loadingProgress !== null}
            >
              <option value="todas">Todas as áreas</option>
              <option value="matematica">Matemática</option>
              <option value="linguagens">Linguagens e Códigos</option>
              <option value="humanas">Ciências Humanas</option>
              <option value="natureza">Ciências da Natureza</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dificuldade</label>
            <select
              className={styles.filterSelect}
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              disabled={loading || loadingProgress !== null}
            >
              <option value="todas">Todas</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ano do ENEM</label>
            <select
              className={styles.filterSelect}
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={loading || loadingProgress !== null}
            >
              <option value="todos">Todos os anos</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className={styles.searchActions}>
          <button 
            className={`${styles.searchBtn} ${styles.btnPrimary}`}
            onClick={handleSearch}
            disabled={loading || loadingProgress !== null}
          >
            {loadingProgress ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Carregando... ({loadingProgress.current}/{loadingProgress.total})
              </>
            ) : loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Buscando...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i>
                Buscar na API
              </>
            )}
          </button>
          
          {hasSearched && (
            <button 
              className={`${styles.searchBtn} ${styles.btnSecondary}`}
              onClick={() => {
                setSearchTerm("");
                setSelectedArea("todas");
                setSelectedDifficulty("todas");
                setSelectedYear("todos");
                setActiveFilters([]);
                setCurrentPage(1);
                setHasSearched(false);
                setLoadingProgress(null);
                setRawQuestionsData({
                  metadata: { limit: 0, offset: 0, total: 0, hasMore: false },
                  questions: []
                });
                reset();
              }}
              disabled={loading || loadingProgress !== null}
            >
              <i className="fas fa-times"></i>
              Limpar
            </button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className={styles.filterTags}>
            {activeFilters.map((filter, index) => (
              <div key={index} className={styles.filterTag}>
                {filter}
                <i
                  className="fas fa-times"
                  onClick={() => removeActiveFilter(filter)}
                ></i>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className={styles.questionsSection}>
        <div className={styles.questionsHeader}>
          <div className={styles.questionsTitle}>
            📝 Questões Encontradas ({paginatedQuestions.questions.length} de {filteredQuestions.length})
            {(loading || loadingProgress) && <i className="fas fa-spinner fa-spin" style={{ marginLeft: '10px' }}></i>}
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
              disabled={loading || loadingProgress !== null}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
              disabled={loading || loadingProgress !== null}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {!hasSearched ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-search"></i>
            </div>
            <h3>Busque questões do ENEM</h3>
            <p>Use os filtros acima e clique em "Buscar na API" para carregar questões.</p>
          </div>
        ) : loadingProgress ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Carregando questões... ({loadingProgress.current}/{loadingProgress.total})</p>
            {loadingProgress.discipline && (
              <p>Buscando questões de: {loadingProgress.discipline}</p>
            )}
          </div>
        ) : loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Carregando questões...</p>
          </div>
        ) : paginatedQuestions.questions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3>Nenhuma questão encontrada</h3>
            <p>Tente ajustar os filtros ou fazer uma nova busca.</p>
          </div>
        ) : (
          <div className={styles.questionsGrid}>
            {paginatedQuestions.questions.map((question, index) => {
              const difficulty = calculateDifficulty(question.index);
              const stats = getQuestionStats(question.index);
              const disciplineInfo = disciplineMap[question.discipline] || { name: question.discipline, color: "default" };

              return (
                <div key={question.index} className={`${styles.questionCard} ${styles[disciplineInfo.color]}`}>
                  <div className={styles.questionHeader}>
                    <div className={styles.questionMeta}>
                      <div className={styles.questionId}>
                        ENEM {question.year} - Q{question.index}
                      </div>
                      <div className={styles.questionSubject}>
                        {disciplineInfo.name} - {question.language ? question.language : "Geral"}
                      </div>
                    </div>
                    <div className={styles.questionBadges}>
                      <div
                        className={`${styles.difficultyBadge} ${styles[`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`]}`}
                      >
                        {difficulty}
                      </div>
                    </div>
                  </div>

                  <div className={styles.questionPreview}>
                    {question.context}
                  </div>

                  <div className={styles.questionTags}>
                    <span className={styles.questionTag}>{disciplineInfo.name}</span>
                    <span className={styles.questionTag}>ENEM {question.year}</span>
                    <span className={styles.questionTag}>{difficulty}</span>
                  </div>

                  <div className={styles.questionActions}>
                    <div className={styles.questionStats}>
                      <div className={styles.stat}>
                        <i className="fas fa-users"></i>
                        <span>{stats.accuracy}% acertos</span>
                      </div>
                      <div className={styles.stat}>
                        <i className="fas fa-clock"></i>
                        <span>{stats.time}min</span>
                      </div>
                    </div>
                    <div className={styles.actionButtons}>
                      <button className={`${styles.actionBtn} ${styles.btnSecondary}`}>
                        <i className="fas fa-heart"></i>
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.btnPrimary}`}
                        onClick={() => handleResolverQuestao(question.index)}
                        disabled={loading || loadingProgress !== null}
                      >
                        Resolver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {filteredQuestions.length > 12 && (
          <div className={styles.pagination}>
            <button 
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading || loadingProgress !== null}
            >
              <i className="fas fa-chevron-left"></i>
              Anterior
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading || loadingProgress !== null}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading || loadingProgress !== null}
            >
              Próxima
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Load More da API */}
        {hasSearched && apiData?.metadata.hasMore && (
          <div className={styles.loadMoreSection}>
            <button 
              className={`${styles.loadMoreBtn} ${loading ? styles.loading : ''}`}
              onClick={async () => {
                try {
                  const searchParams = {
                    year: selectedYear !== "todos" ? selectedYear : undefined,
                    limit: 50, // Limite máximo da API ENEM
                    offset: rawQuestionsData.questions.length,
                    // Removido discipline da API - será filtrado localmente
                  };

                  const response = await fetchQuestions(searchParams);
                  
                  if (response && response.questions) {
                    const convertedQuestions = response.questions.map(convertApiQuestionToInternal);
                    
                    setRawQuestionsData({
                      metadata: response.metadata,
                      questions: [...rawQuestionsData.questions, ...convertedQuestions]
                    });
                  }
                } catch (error) {
                  console.warn('Erro ao carregar mais questões:', error);
                }
              }}
              disabled={loading || loadingProgress !== null}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Carregando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Carregar mais da API
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BancoQuestoes;
