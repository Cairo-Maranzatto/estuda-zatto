'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'
import BancoQuestoes from './BancoQuestoes'
import ResolucaoQuestao from './ResolucaoQuestao'
import styles from './MainContent.module.css'

type ActiveView = 'dashboard' | 'questoes' | 'simulados' | 'cronograma' | 'revisao' | 'areas' | 'ferramentas' | 'analises' | 'configuracoes';

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
  alternatives: Array<{
    letter: string;
    text: string;
    file?: string;
    isCorrect: boolean;
  }>;
}

// Interface para o estado do BancoQuestoes
interface BancoQuestoesState {
  searchTerm: string;
  selectedArea: string;
  selectedDifficulty: string;
  selectedYear: string;
  currentPage: number;
  activeFilters: string[];
  rawQuestionsData: {
    metadata: { limit: number; offset: number; total: number; hasMore: boolean };
    questions: Question[];
  };
  hasSearched: boolean;
}

interface MainContentProps {
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

export default function MainContent({ activeView = 'dashboard', onViewChange }: MainContentProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isResolvingQuestion, setIsResolvingQuestion] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  
  // Estado persistido do BancoQuestoes
  const [bancoQuestoesState, setBancoQuestoesState] = useState<BancoQuestoesState | null>(null)
  
  const { user, isAuthenticated, logout } = useAuth()

  // Calcular dias para o ENEM (próximo ENEM é em novembro)
  const calculateDaysToEnem = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    let enemDate = new Date(currentYear, 10, 3) // 3 de novembro
    
    // Se já passou o ENEM deste ano, calcular para o próximo
    if (now > enemDate) {
      enemDate = new Date(currentYear + 1, 10, 3)
    }
    
    const diffTime = enemDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysToEnem = calculateDaysToEnem()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const handleResolverQuestao = (question: Question, questionIndex: number, total: number) => {
    setSelectedQuestion(question)
    setCurrentQuestionIndex(questionIndex)
    setTotalQuestions(total)
    setIsResolvingQuestion(true)
  }

  const handleBackToQuestions = () => {
    setIsResolvingQuestion(false)
    setSelectedQuestion(null)
  }

  const handleNextQuestion = () => {
    // Lógica para próxima questão será implementada no BancoQuestoes
  }

  const handlePreviousQuestion = () => {
    // Lógica para questão anterior será implementada no BancoQuestoes
  }

  // Função para salvar estado do BancoQuestoes
  const handleSaveBancoQuestoesState = (state: BancoQuestoesState) => {
    setBancoQuestoesState(state)
  }

  // Renderizar conteúdo baseado na view ativa
  const renderContent = () => {
    // Se estiver resolvendo uma questão, mostrar ResolucaoQuestao
    if (isResolvingQuestion && selectedQuestion) {
      return (
        <ResolucaoQuestao 
          question={selectedQuestion}
          onBack={handleBackToQuestions}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          currentQuestionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
      )
    }

    switch (activeView) {
      case 'questoes':
        return (
          <BancoQuestoes 
            onResolverQuestao={handleResolverQuestao}
            onStateChange={handleSaveBancoQuestoesState}
            initialState={bancoQuestoesState}
          />
        )
      
      case 'simulados':
        return (
          <div className={styles.comingSoon}>
            <h2>🧪 Simulados</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'cronograma':
        return (
          <div className={styles.comingSoon}>
            <h2>📅 Cronograma IA</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'revisao':
        return (
          <div className={styles.comingSoon}>
            <h2>🔄 Sistema de Revisão</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'areas':
        return (
          <div className={styles.comingSoon}>
            <h2>📚 Áreas de Conhecimento</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'ferramentas':
        return (
          <div className={styles.comingSoon}>
            <h2>🛠️ Ferramentas</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'analises':
        return (
          <div className={styles.comingSoon}>
            <h2>📊 Análises</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      case 'configuracoes':
        return (
          <div className={styles.comingSoon}>
            <h2>⚙️ Configurações</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )
      
      default: // dashboard
        return (
          <>
            <div className={styles.header}>
              <h1>🎯 Dashboard de Análise de Conhecimento - ENEM</h1>
              <p>Sistema Inteligente de Medição e Otimização do Aprendizado</p>
            </div>

            <div className={styles.studentInfo}>
              {isAuthenticated && user ? (
                <div>
                  <div className={styles.studentName}>
                    👨‍🎓 {user.displayName || user.email}
                    <button 
                      className={styles.logoutButton}
                      onClick={handleLogout}
                      title="Sair"
                    >
                      🚪
                    </button>
                  </div>
                  <div>Meta: {user.targetScore || 650} pontos | Curso: {user.course || 'Medicina'}</div>
                </div>
              ) : (
                <div>
                  <div className={styles.studentName}>
                    👋 Visitante
                    <button 
                      className={styles.loginButton}
                      onClick={() => setShowAuthModal(true)}
                    >
                      Entrar
                    </button>
                  </div>
                  <div>Faça login para personalizar sua experiência</div>
                </div>
              )}
              <div className={styles.studyDays}>
                <div style={{ fontSize: '2em' }}>{daysToEnem}</div>
                <div>dias para o ENEM</div>
              </div>
            </div>

            {/* Métricas só são exibidas para usuários autenticados */}
            {isAuthenticated && user && (
              <div className={styles.metricsGrid}>
                <div className={`${styles.metricCard} ${styles.excellent}`}>
                  <div className={styles.metricTitle}>Índice de Prontidão (IPE)</div>
                  <div className={styles.metricValue}>73%</div>
                  <div className={styles.metricSubtitle}>Boa preparação geral</div>
                </div>

                <div className={`${styles.metricCard} ${styles.good}`}>
                  <div className={styles.metricTitle}>Pontuação Estimada</div>
                  <div className={styles.metricValue}>612</div>
                  <div className={styles.metricSubtitle}>+38 pontos para meta</div>
                </div>

                <div className={`${styles.metricCard} ${styles.needsImprovement}`}>
                  <div className={styles.metricTitle}>Velocidade de Aprendizado</div>
                  <div className={styles.metricValue}>2.3</div>
                  <div className={styles.metricSubtitle}>pontos/hora de estudo</div>
                </div>

                <div className={`${styles.metricCard} ${styles.excellent}`}>
                  <div className={styles.metricTitle}>Taxa de Retenção</div>
                  <div className={styles.metricValue}>87%</div>
                  <div className={styles.metricSubtitle}>Excelente memória</div>
                </div>
              </div>
            )}

            {/* Mensagem para usuários não autenticados */}
            {!isAuthenticated && (
              <div className={styles.loginPrompt}>
                <div className={styles.loginPromptCard}>
                  <h2>🔐 Acesse sua conta para ver suas métricas</h2>
                  <p>
                    Faça login para visualizar seu progresso personalizado, métricas de desempenho 
                    e análises detalhadas do seu preparo para o ENEM.
                  </p>
                  <button 
                    className={styles.loginPromptButton}
                    onClick={() => setShowAuthModal(true)}
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    Fazer Login
                  </button>
                </div>
              </div>
            )}

            <div className={styles.welcomeMessage}>
              <h2>🚀 Bem-vindo à Estuda Zatto!</h2>
              <p>
                Sua plataforma educacional moderna está pronta! Este é um exemplo de dashboard 
                baseado no design original, agora implementado com Next.js, TypeScript e 
                seguindo os padrões da identidade visual Estuda Zatto.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <i className="fas fa-check-circle"></i>
                  <span>Sidebar responsivo e interativo</span>
                </div>
                <div className={styles.feature}>
                  <i className="fas fa-check-circle"></i>
                  <span>Identidade visual Estuda Zatto aplicada</span>
                </div>
                <div className={styles.feature}>
                  <i className="fas fa-check-circle"></i>
                  <span>Estrutura escalável com TypeScript</span>
                </div>
                <div className={styles.feature}>
                  <i className="fas fa-check-circle"></i>
                  <span>SEO otimizado para tráfego orgânico</span>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <main className={`${styles.mainContent} ${sidebarCollapsed ? styles.expanded : ''}`}>
      <div className={styles.container}>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        
        {renderContent()}
      </div>
    </main>
  )
}
