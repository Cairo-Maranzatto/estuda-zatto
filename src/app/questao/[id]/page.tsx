'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ResolucaoQuestao from '../../../components/ResolucaoQuestao';

// Dados mock das questões (mesmo do BancoQuestoes)
const mockQuestionsData = [
  {
    title: "Questão 127 - ENEM 2023",
    index: 127,
    discipline: "matematica",
    year: 2023,
    context: "Um terreno retangular tem 120 metros de comprimento e 80 metros de largura. O proprietário deseja construir uma piscina circular no centro do terreno, ocupando a maior área possível sem ultrapassar os limites do terreno.",
    correctAlternative: "A",
    alternativesIntroduction: "Qual é o raio máximo da piscina circular?",
    alternatives: [
      { letter: "A", text: "40 metros", isCorrect: true },
      { letter: "B", text: "50 metros", isCorrect: false },
      { letter: "C", text: "60 metros", isCorrect: false },
      { letter: "D", text: "80 metros", isCorrect: false },
      { letter: "E", text: "120 metros", isCorrect: false },
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
];

export default function QuestaoPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const questionId = parseInt(params.id as string);
    
    // Buscar questão por index nos dados mock
    const foundQuestion = mockQuestionsData.find(q => q.index === questionId);
    
    if (foundQuestion) {
      setQuestion(foundQuestion);
    } else {
      // Se não encontrar, usar a primeira questão como fallback
      setQuestion(mockQuestionsData[0]);
    }
    
    setLoading(false);
  }, [params.id]);

  const handleBackToQuestions = () => {
    router.push('/');
  };

  const handleNextQuestion = () => {
    const currentIndex = mockQuestionsData.findIndex(q => q.index === question?.index);
    const nextIndex = (currentIndex + 1) % mockQuestionsData.length;
    const nextQuestion = mockQuestionsData[nextIndex];
    router.push(`/questao/${nextQuestion.index}`);
  };

  const handlePreviousQuestion = () => {
    const currentIndex = mockQuestionsData.findIndex(q => q.index === question?.index);
    const prevIndex = currentIndex === 0 ? mockQuestionsData.length - 1 : currentIndex - 1;
    const prevQuestion = mockQuestionsData[prevIndex];
    router.push(`/questao/${prevQuestion.index}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2em' }}>
          <i className="fas fa-spinner fa-spin"></i> Carregando questão...
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>Questão não encontrada</h1>
        <p>A questão solicitada não foi encontrada.</p>
        <button 
          onClick={handleBackToQuestions}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid white',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Voltar ao Banco de Questões
        </button>
      </div>
    );
  }

  return (
    <ResolucaoQuestao 
      question={question}
      onBack={handleBackToQuestions}
      onNext={handleNextQuestion}
      onPrevious={handlePreviousQuestion}
      currentQuestionNumber={mockQuestionsData.findIndex(q => q.index === question.index) + 1}
      totalQuestions={mockQuestionsData.length}
    />
  );
}
