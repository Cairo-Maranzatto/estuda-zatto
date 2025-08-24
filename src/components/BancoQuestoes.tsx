'use client';

import React, { useState, useEffect } from 'react';
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
  discipline: string;
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

interface BancoQuestoesProps {
  onResolverQuestao?: (question: Question, questionIndex: number, total: number) => void;
}

// Dados mock baseados na estrutura da API
const mockQuestionsData: QuestionsResponse = {
  metadata: {
    limit: 12,
    offset: 0,
    total: 12847,
    hasMore: true,
  },
  questions: [
    {
      title: "Questão 127 - ENEM 2023",
      index: 127,
      discipline: "matematica",
      year: 2023,
      context: "Um terreno retangular tem 120 metros de comprimento e 80 metros de largura. O proprietário deseja construir uma piscina circular no centro do terreno, ocupando a maior área possível sem ultrapassar os limites do terreno.",
      correctAlternative: "C",
      alternativesIntroduction: "Qual é o raio máximo da piscina circular?",
      alternatives: [
        { letter: "A", text: "30 metros", isCorrect: false },
        { letter: "B", text: "35 metros", isCorrect: false },
        { letter: "C", text: "40 metros", isCorrect: true },
        { letter: "D", text: "45 metros", isCorrect: false },
        { letter: "E", text: "50 metros", isCorrect: false },
      ],
    },
    {
      title: "Questão 89 - ENEM 2023",
      index: 89,
      discipline: "linguagens",
      language: "portugues",
      year: 2023,
      context: "A revolução digital transformou profundamente as relações sociais contemporâneas, criando novas formas de comunicação e interação que transcendem barreiras geográficas e temporais.",
      correctAlternative: "B",
      alternativesIntroduction: "Com base no texto, é correto afirmar que:",
      alternatives: [
        { letter: "A", text: "A tecnologia isolou as pessoas", isCorrect: false },
        { letter: "B", text: "Novas formas de comunicação surgiram", isCorrect: true },
        { letter: "C", text: "As barreiras geográficas aumentaram", isCorrect: false },
        { letter: "D", text: "A interação social diminuiu", isCorrect: false },
        { letter: "E", text: "O tempo se tornou mais limitado", isCorrect: false },
      ],
    },
    {
      title: "Questão 156 - ENEM 2022",
      index: 156,
      discipline: "humanas",
      year: 2022,
      context: "Durante o período da ditadura militar no Brasil (1964-1985), diversos movimentos de resistência se organizaram para contestar o regime autoritário, utilizando diferentes estratégias de oposição política.",
      correctAlternative: "A",
      alternativesIntroduction: "Os movimentos de resistência durante a ditadura militar caracterizaram-se por:",
      alternatives: [
        { letter: "A", text: "Diversidade de estratégias de oposição", isCorrect: true },
        { letter: "B", text: "Apoio total da população", isCorrect: false },
        { letter: "C", text: "Ausência de repressão", isCorrect: false },
        { letter: "D", text: "Foco apenas na luta armada", isCorrect: false },
        { letter: "E", text: "Apoio do governo militar", isCorrect: false },
      ],
    },
    {
      title: "Questão 201 - ENEM 2023",
      index: 201,
      discipline: "natureza",
      year: 2023,
      context: "Os compostos orgânicos são fundamentais para a vida na Terra. Considere a estrutura molecular do etanol (C₂H₆O) e analise suas propriedades físicas e químicas em diferentes contextos de aplicação.",
      correctAlternative: "D",
      alternativesIntroduction: "Sobre as propriedades do etanol, é correto afirmar:",
      alternatives: [
        { letter: "A", text: "É insolúvel em água", isCorrect: false },
        { letter: "B", text: "Não possui grupos funcionais", isCorrect: false },
        { letter: "C", text: "É um hidrocarboneto", isCorrect: false },
        { letter: "D", text: "Possui grupo hidroxila", isCorrect: true },
        { letter: "E", text: "É um composto inorgânico", isCorrect: false },
      ],
    },
  ],
};

const BancoQuestoes: React.FC<BancoQuestoesProps> = ({ onResolverQuestao }) => {
  const [questionsData, setQuestionsData] = useState<QuestionsResponse>(mockQuestionsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState("todas");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Estatísticas mock
  const stats = {
    total: 12847,
    resolved: 2341,
    accuracy: 78,
  };

  // Mapeamento de disciplinas
  const disciplineMap: Record<string, { name: string; color: string }> = {
    matematica: { name: "Matemática", color: "matematica" },
    linguagens: { name: "Linguagens", color: "linguagens" },
    humanas: { name: "Ciências Humanas", color: "humanas" },
    natureza: { name: "Ciências da Natureza", color: "natureza" },
  };

  // Função para obter dificuldade mock baseada na taxa de acerto
  const getDifficulty = (index: number): { level: string; class: string } => {
    const mockAccuracy = 45 + (index % 40); // Simula taxa de acerto entre 45-85%
    if (mockAccuracy >= 75) return { level: "Fácil", class: "facil" };
    if (mockAccuracy >= 55) return { level: "Médio", class: "medio" };
    return { level: "Difícil", class: "dificil" };
  };

  // Função para obter estatísticas mock da questão
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
    const question = questionsData.questions.find(q => q.index === questionIndex);
    const arrayIndex = questionsData.questions.findIndex(q => q.index === questionIndex);
    
    if (question && onResolverQuestao) {
      onResolverQuestao(question, arrayIndex, questionsData.questions.length);
    }
  };

  // Handlers para filtros
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    if (area !== "todas") {
      addActiveFilter(`Área: ${disciplineMap[area]?.name || area}`);
    } else {
      removeActiveFilter(activeFilters.find((f) => f.startsWith("Área:")) || "");
    }
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    if (difficulty !== "todas") {
      addActiveFilter(`Dificuldade: ${difficulty}`);
    } else {
      removeActiveFilter(activeFilters.find((f) => f.startsWith("Dificuldade:")) || "");
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
            📊 {stats.total.toLocaleString()} questões
          </div>
          <div className={styles.statItem}>
            ✅ {stats.resolved.toLocaleString()} resolvidas
          </div>
          <div className={styles.statItem}>
            🎯 {stats.accuracy}% acertos
          </div>
        </div>
      </div>

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
              onChange={(e) => handleAreaChange(e.target.value)}
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
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="todos">Todos os anos</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="nao-resolvidas">Não resolvidas</option>
              <option value="acertei">Acertei</option>
              <option value="errei">Errei</option>
              <option value="favoritas">Favoritas</option>
            </select>
          </div>
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
            📝 Questões Encontradas ({questionsData.questions.length})
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        <div className={styles.questionsGrid}>
          {questionsData.questions.map((question, index) => {
            const difficulty = getDifficulty(question.index);
            const stats = getQuestionStats(question.index);
            const disciplineInfo = disciplineMap[question.discipline];

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
                  <div
                    className={`${styles.difficultyBadge} ${styles[`difficulty${difficulty.class.charAt(0).toUpperCase() + difficulty.class.slice(1)}`]}`}
                  >
                    {difficulty.level}
                  </div>
                </div>

                <div className={styles.questionPreview}>
                  {question.context}
                </div>

                <div className={styles.questionTags}>
                  <span className={styles.questionTag}>{disciplineInfo.name}</span>
                  <span className={styles.questionTag}>ENEM {question.year}</span>
                  <span className={styles.questionTag}>{difficulty.level}</span>
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
                    >
                      Resolver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.pageBtn}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>...</button>
          <button className={styles.pageBtn}>42</button>
          <button className={styles.pageBtn}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BancoQuestoes;
