'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ResolucaoQuestao.module.css';

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

interface ResolucaoQuestaoProps {
  question: Question;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const ResolucaoQuestao: React.FC<ResolucaoQuestaoProps> = ({
  question,
  onBack,
  onNext,
  onPrevious,
  currentQuestionNumber,
  totalQuestions
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutos
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mapeamento de disciplinas
  const disciplineMap: Record<string, { name: string; subject: string }> = {
    matematica: { name: "Matemática", subject: "Geometria" },
    linguagens: { name: "Linguagens", subject: "Interpretação" },
    humanas: { name: "Ciências Humanas", subject: "História" },
    natureza: { name: "Ciências da Natureza", subject: "Química" },
  };

  // Função para obter dificuldade mock
  const getDifficulty = (index: number): { level: string; class: string } => {
    const mockAccuracy = 45 + (index % 40);
    if (mockAccuracy >= 75) return { level: "Fácil", class: "facil" };
    if (mockAccuracy >= 55) return { level: "Médio", class: "medio" };
    return { level: "Difícil", class: "dificil" };
  };

  // Função para obter estatísticas mock
  const getQuestionStats = (index: number) => {
    const accuracy = 45 + (index % 40);
    const time = 2 + (index % 3);
    const resolutions = 5000 + (index * 123);
    const difficulty = (accuracy / 100) * 5;
    return { accuracy, time, resolutions, difficulty: difficulty.toFixed(1) };
  };

  const difficulty = getDifficulty(question.index);
  const stats = getQuestionStats(question.index);
  const disciplineInfo = disciplineMap[question.discipline];

  // Timer
  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color class
  const getTimerClass = (): string => {
    if (timeRemaining <= 30) return styles.timerDanger;
    if (timeRemaining <= 60) return styles.timerWarning;
    return styles.timer;
  };

  // Handle alternative selection
  const handleAlternativeClick = (letter: string) => {
    if (isAnswered) return;
    setSelectedAnswer(letter);
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswered) return;
    
    setIsAnswered(true);
    setShowExplanation(true);
  };

  // Handle auto submit when time runs out
  const handleAutoSubmit = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      if (selectedAnswer) {
        setShowExplanation(true);
      }
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Handle show hint
  const handleShowHint = () => {
    alert('💡 Dica: Para maximizar a área da piscina circular, considere qual dimensão do terreno limita o tamanho do círculo.');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;

      // A, B, C, D, E keys for alternatives
      if (e.key >= 'A' && e.key <= 'E') {
        handleAlternativeClick(e.key);
      }
      
      // Enter to submit
      if (e.key === 'Enter' && selectedAnswer) {
        handleSubmitAnswer();
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnswer, isAnswered, onNext, onPrevious]);

  // Get explanation content
  const getExplanation = () => {
    const isCorrect = selectedAnswer === question.correctAlternative;
    
    return {
      title: isCorrect ? "Resposta Correta!" : "Resposta Incorreta",
      content: `
        <strong>Resposta Correta: ${question.correctAlternative}) ${question.alternatives.find(alt => alt.letter === question.correctAlternative)?.text}</strong>
        <br><br>
        Para que a piscina circular tenha a maior área possível e esteja completamente contida no terreno retangular, seu diâmetro deve ser igual à menor dimensão do terreno.
        <br><br>
        <strong>Resolução:</strong><br>
        • Dimensões do terreno: 120m × 80m<br>
        • A menor dimensão é 80m<br>
        • O diâmetro máximo da piscina = 80m<br>
        • Portanto, o raio máximo = 80m ÷ 2 = 40m
        <br><br>
        <strong>Conceitos envolvidos:</strong> Geometria plana, otimização, círculo inscrito em retângulo.
      `
    };
  };

  return (
    <div className={styles.resolucaoQuestao}>
      <div className={styles.container}>
        <button 
          className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkActive : ''}`}
          onClick={handleBookmarkToggle}
        >
          <i className={isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
        </button>

        {/* Question Header */}
        <div className={styles.questionHeader}>
          <div className={styles.questionInfo}>
            <div className={styles.questionTitle}>
              <i className="fas fa-edit"></i>
              {question.title}
            </div>
            <div className={styles.questionMeta}>
              <div className={styles.metaItem}>
                📐 {disciplineInfo.name} - {disciplineInfo.subject}
              </div>
              <div className={styles.metaItem}>
                📅 ENEM {question.year}
              </div>
              <div className={styles.metaItem}>
                👥 {stats.accuracy}% acertos
              </div>
              <div className={styles.metaItem}>
                ⏱️ Tempo médio: {stats.time}min
              </div>
            </div>
          </div>
          <div className={styles.timerSection}>
            <div className={getTimerClass()}>
              <i className="fas fa-clock"></i>
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className={`${styles.difficultyBadge} ${styles[`difficulty${difficulty.class.charAt(0).toUpperCase() + difficulty.class.slice(1)}`]}`}>
              {difficulty.level}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className={styles.questionContent}>
          <div className={styles.questionText}>
            {question.context}
            <br /><br />
            {question.alternativesIntroduction}
          </div>
          
          {question.files && question.files.length > 0 && (
            <div className={styles.questionImage}>
              <div className={styles.imagePlaceholder}>
                <i className="fas fa-image"></i>
                <span>Figura: Terreno retangular com piscina circular centralizada</span>
              </div>
            </div>
          )}
        </div>

        {/* Alternatives Section */}
        <div className={styles.alternativesSection}>
          <div className={styles.alternativesTitle}>
            <i className="fas fa-list-ol"></i>
            Alternativas
          </div>
          
          {question.alternatives.map((alternative) => {
            let alternativeClass = styles.alternative;
            
            if (selectedAnswer === alternative.letter) {
              alternativeClass += ` ${styles.selected}`;
            }
            
            if (isAnswered) {
              if (alternative.isCorrect) {
                alternativeClass += ` ${styles.correct}`;
              } else if (selectedAnswer === alternative.letter && !alternative.isCorrect) {
                alternativeClass += ` ${styles.incorrect}`;
              }
            }
            
            return (
              <div 
                key={alternative.letter}
                className={alternativeClass}
                onClick={() => handleAlternativeClick(alternative.letter)}
              >
                <div className={styles.alternativeLetter}>
                  {alternative.letter}
                </div>
                <div className={styles.alternativeText}>
                  {alternative.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation Section */}
        {showExplanation && (
          <div className={styles.explanationSection}>
            <div className={styles.explanationTitle}>
              <i className="fas fa-lightbulb"></i>
              {getExplanation().title}
            </div>
            <div 
              className={styles.explanationContent}
              dangerouslySetInnerHTML={{ __html: getExplanation().content }}
            />
          </div>
        )}

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          <div className={styles.actionCard}>
            <div className={styles.actionButtons}>
              {!isAnswered ? (
                <>
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                  >
                    <i className="fas fa-check"></i>
                    Confirmar Resposta
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleShowHint}
                  >
                    <i className="fas fa-question-circle"></i>
                    Dica
                  </button>
                </>
              ) : (
                <button 
                  className={`${styles.btn} ${selectedAnswer === question.correctAlternative ? styles.btnSuccess : styles.btnDanger}`}
                >
                  <i className={selectedAnswer === question.correctAlternative ? "fas fa-check" : "fas fa-times"}></i>
                  {selectedAnswer === question.correctAlternative ? "Correto!" : "Incorreto"}
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.actionCard}>
            <div className={styles.navigationSection}>
              <div className={styles.navInfo}>
                Questão {currentQuestionNumber} de {totalQuestions}
              </div>
              <div className={styles.navButtons}>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={onPrevious}
                >
                  <i className="fas fa-chevron-left"></i>
                  Anterior
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={onNext}
                >
                  Próxima
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsTitle}>📊 Estatísticas da Questão</div>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.accuracy}%</div>
              <div className={styles.statLabel}>Taxa de Acerto</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.time}:12</div>
              <div className={styles.statLabel}>Tempo Médio</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.resolutions.toLocaleString()}</div>
              <div className={styles.statLabel}>Resoluções</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.difficulty}</div>
              <div className={styles.statLabel}>Dificuldade</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className={styles.backSection}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Banco de Questões
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolucaoQuestao;
