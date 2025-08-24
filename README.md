# Estuda Zatto 3.0

Plataforma educacional moderna desenvolvida com Next.js, TypeScript e seguindo os padrões da identidade visual Estuda Zatto. Esta aplicação implementa um sistema avançado de análise e medição de conhecimento para estudantes do ENEM, utilizando conceitos de ciência de dados, machine learning e psicometria educacional.

## 🎯 Objetivo Principal

Criar um sistema de medição que permita avaliar o nível atual de conhecimento dos estudantes e prever o progresso necessário para atingir resultados satisfatórios no ENEM, oferecendo insights precisos sobre o progresso do aprendizado e recomendações otimizadas para o sucesso.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **CSS Modules** - Estilização componentizada
- **Font Optimization** - Google Fonts (Poppins, Inter)
- **SEO** - Otimização para mecanismos de busca
- **D3.js** - Para visualizações avançadas
- **Chart.js** - Para gráficos interativos
- **Material-UI** - Para componentes de interface

### Backend (Planejado)
- **Python 3.9+** com FastAPI
- **PostgreSQL** para dados estruturados
- **Redis** para cache e sessões
- **Celery** para processamento assíncrono

### Machine Learning
- **TensorFlow 2.x** para modelos de deep learning
- **Scikit-learn** para modelos tradicionais
- **MLflow** para versionamento de modelos
- **Apache Airflow** para pipelines de dados

## 🎨 Identidade Visual

- **Cores Principais:**
  - Azul Royal: `#007BFF`
  - Azul Claro: `#D0EBFF`
  - Branco: `#FFFFFF`

- **Tipografia:**
  - Títulos: Poppins
  - Corpo: Inter

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   └── globals.css     # Estilos globais
├── components/
│   ├── Sidebar.tsx     # Componente sidebar
│   ├── Sidebar.module.css
│   ├── MainContent.tsx # Conteúdo principal
│   └── MainContent.module.css
└── types/
    └── sidebar.ts      # Tipos TypeScript
```

## 🛠️ Instalação e Execução

### 🐳 **Com Docker (Recomendado)**

```bash
# Produção
docker-compose up estuda-zatto

# Desenvolvimento
docker-compose --profile dev up estuda-zatto-dev

# Build e execução em uma linha
docker-compose up --build
```

**URLs de Acesso:**
- **Produção:** http://localhost:3000
- **Desenvolvimento:** http://localhost:3001

### 📦 **Instalação Local**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 📱 Funcionalidades Atuais

- ✅ Sidebar responsivo e interativo
- ✅ Identidade visual Estuda Zatto aplicada
- ✅ Estrutura escalável com TypeScript
- ✅ SEO otimizado para tráfego orgânico
- ✅ Design mobile-first
- ✅ Componentes modulares e reutilizáveis

## 🧠 Sistema de Análise de Conhecimento ENEM

### 1. Fundamentação Teórica

#### 1.1 Teoria de Resposta ao Item (TRI)
- Base matemática utilizada pelo ENEM
- Permite comparação entre diferentes provas
- Considera dificuldade, discriminação e acerto casual

#### 1.2 Knowledge Tracing
- Modelagem do conhecimento como processo dinâmico
- Utilização de Hidden Markov Models
- Predição de performance futura baseada em histórico

### 2. Definição de Grandezas para o Conhecimento

#### 2.1 Índice de Proficiência por Competência (IPC)
**Fórmula:** `IPC = (Σ(wi × pi × di)) / Σ(wi)`

Onde:
- `wi` = peso da questão baseado na matriz de referência do ENEM
- `pi` = probabilidade de acerto (0-1)
- `di` = índice de dificuldade da questão (0-1)

**Escala:** 0-1000 pontos (similar ao ENEM)

#### 2.2 Taxa de Retenção de Conhecimento (TRC)
**Fórmula:** `TRC = e^(-λt)`

Onde:
- `λ` = taxa de esquecimento específica do assunto
- `t` = tempo desde a última revisão

#### 2.3 Velocidade de Aprendizado (VA)
**Fórmula:** `VA = ΔP / Δt`

Onde:
- `ΔP` = variação na proficiência
- `Δt` = tempo de estudo investido

#### 2.4 Índice de Prontidão para o ENEM (IPE)
**Fórmula:** `IPE = Σ(ICi × PCi × wi) / Σ(wi)`

Onde:
- `ICi` = Índice de Conhecimento da competência i
- `PCi` = Peso da competência i no ENEM
- `wi` = peso relativo da área de conhecimento

### 3. Metodologia de Avaliação

#### 3.1 Avaliação Diagnóstica Inicial

##### 3.1.1 Teste Adaptativo Computadorizado (CAT)
```python
# Pseudocódigo para CAT
def avaliacao_adaptativa(estudante):
    theta_inicial = 0  # Habilidade inicial estimada
    questoes_respondidas = []
    
    while criterio_parada_nao_atingido():
        proxima_questao = selecionar_questao_otima(theta_inicial, banco_questoes)
        resposta = aplicar_questao(proxima_questao, estudante)
        theta_inicial = atualizar_estimativa_habilidade(theta_inicial, resposta)
        questoes_respondidas.append((proxima_questao, resposta))
    
    return calcular_proficiencia_final(theta_inicial)
```

##### 3.1.2 Mapeamento de Conhecimento Prévio
- **Linguagens e Códigos:** 30 questões adaptativas
- **Ciências Humanas:** 30 questões adaptativas  
- **Ciências da Natureza:** 30 questões adaptativas
- **Matemática:** 30 questões adaptativas
- **Redação:** Análise de texto produzido

#### 3.2 Monitoramento Contínuo

##### 3.2.1 Micro-avaliações Semanais
- 5-10 questões por área de conhecimento
- Foco em competências com menor IPC
- Ajuste automático de dificuldade

##### 3.2.2 Simulados Mensais
- Formato completo do ENEM
- Análise comparativa com desempenho anterior
- Identificação de padrões de erro

### 4. Modelo de Machine Learning

#### 4.1 Arquitetura do Sistema

```python
# Modelo de Deep Knowledge Tracing (DKT)
import tensorflow as tf

class DKTModel:
    def __init__(self, num_skills, hidden_size=200):
        self.num_skills = num_skills
        self.hidden_size = hidden_size
        
        # LSTM para capturar dependências temporais
        self.lstm = tf.keras.layers.LSTM(hidden_size, return_sequences=True)
        
        # Camada densa para predição
        self.dense = tf.keras.layers.Dense(num_skills, activation='sigmoid')
    
    def call(self, inputs):
        # inputs: [batch_size, sequence_length, num_skills*2]
        lstm_out = self.lstm(inputs)
        predictions = self.dense(lstm_out)
        return predictions
```

#### 4.2 Features do Modelo

##### 4.2.1 Features Estáticas
- Dados demográficos
- Histórico educacional
- Preferências de aprendizado
- Tempo disponível para estudo

##### 4.2.2 Features Dinâmicas
- Sequência de respostas (corretas/incorretas)
- Tempo gasto por questão
- Padrões de estudo (horários, frequência)
- Dificuldade das questões respondidas

#### 4.3 Métricas de Avaliação do Modelo
- **AUC-ROC:** Capacidade de discriminação
- **RMSE:** Erro quadrático médio na predição de notas
- **Acurácia:** Predição correta de aprovação/reprovação

### 5. Sistema de Recomendação Personalizado

#### 5.1 Algoritmo de Recomendação

```python
def recomendar_conteudo(estudante_id, meta_pontuacao=600):
    # Obter estado atual do conhecimento
    estado_atual = obter_proficiencia_atual(estudante_id)
    
    # Calcular gap de conhecimento
    gap_conhecimento = meta_pontuacao - estado_atual
    
    # Identificar competências prioritárias
    competencias_prioritarias = identificar_gaps_criticos(estado_atual)
    
    # Estimar tempo necessário
    tempo_necessario = estimar_tempo_estudo(gap_conhecimento, 
                                          velocidade_aprendizado[estudante_id])
    
    # Gerar plano de estudos otimizado
    plano_estudos = otimizar_cronograma(competencias_prioritarias, 
                                       tempo_necessario,
                                       restricoes_tempo[estudante_id])
    
    return plano_estudos
```

#### 5.2 Otimização do Cronograma de Estudos

##### 5.2.1 Função Objetivo
Maximizar: `Σ(Ganho_Esperado_i × Peso_ENEM_i) - Custo_Tempo_i`

##### 5.2.2 Restrições
- Tempo total disponível
- Curva de esquecimento
- Dificuldade cognitiva
- Preferências do estudante

### 6. Dashboard de Acompanhamento

#### 6.1 Métricas Principais

##### 6.1.1 Visão Geral
- **Índice de Prontidão Geral:** 0-100%
- **Pontuação Estimada:** Baseada no modelo preditivo
- **Tempo Restante Otimizado:** Para atingir meta
- **Progresso Semanal:** Variação no IPC

##### 6.1.2 Análise por Área
```
Linguagens e Códigos:     [████████░░] 80% (IPC: 720)
Ciências Humanas:         [██████░░░░] 60% (IPC: 580)
Ciências da Natureza:     [█████░░░░░] 50% (IPC: 520)
Matemática:               [███░░░░░░░] 30% (IPC: 450)
```

##### 6.1.3 Heatmap de Competências
- Visualização matricial das 30 competências do ENEM
- Cores indicando nível de domínio
- Identificação rápida de pontos fracos

#### 6.2 Alertas Inteligentes

##### 6.2.1 Alertas de Risco
- Queda na performance
- Tempo insuficiente para meta
- Padrões de esquecimento detectados

##### 6.2.2 Oportunidades de Melhoria
- Competências com alto potencial de ganho
- Momentos ótimos para revisão
- Sugestões de mudança de estratégia

### 7. Validação e Calibração do Sistema

#### 7.1 Validação Cruzada
- Divisão temporal dos dados (80% treino, 20% teste)
- Validação com resultados reais do ENEM
- Ajuste de hiperparâmetros via grid search

#### 7.2 Métricas de Validação
- **Correlação com ENEM Real:** r > 0.85
- **Erro Médio Absoluto:** < 50 pontos na escala TRI
- **Precisão na Classificação:** > 90% para aprovação/reprovação

#### 7.3 Calibração Contínua
- Atualização mensal dos modelos
- Incorporação de novos dados
- Ajuste de parâmetros sazonais

### 8. Arquitetura do Sistema Completo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   ML Pipeline   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (TensorFlow)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
```

### 9. Considerações Éticas e Limitações

#### 9.1 Aspectos Éticos
- **Privacidade:** Criptografia de dados pessoais
- **Transparência:** Explicabilidade dos algoritmos
- **Equidade:** Evitar vieses algorítmicos
- **Consentimento:** Opt-in explícito para coleta de dados

#### 9.2 Limitações do Sistema
- Dependência da qualidade dos dados de entrada
- Necessidade de calibração contínua
- Variabilidade individual não capturada completamente
- Fatores externos não modelados (stress, saúde, etc.)

### 10. Métricas de Sucesso

#### 10.1 KPIs Técnicos
- **Acurácia do Modelo:** > 85%
- **Tempo de Resposta:** < 200ms para predições
- **Disponibilidade:** > 99.5%
- **Satisfação do Usuário:** > 4.5/5

#### 10.2 KPIs Educacionais
- **Melhoria na Performance:** +15% em média
- **Redução do Tempo de Estudo:** -20% para mesmos resultados
- **Taxa de Aprovação:** +25% dos usuários do sistema
- **Engajamento:** > 80% de uso regular

## 📅 Cronograma de Desenvolvimento

### Fase 1: MVP (8 semanas)
- **Semanas 1-2:** Coleta e preparação de dados
- **Semanas 3-4:** Desenvolvimento do modelo base
- **Semanas 5-6:** Interface básica e integração
- **Semanas 7-8:** Testes e validação inicial

### Fase 2: Versão Completa (12 semanas)
- **Semanas 9-12:** Implementação do sistema de recomendação
- **Semanas 13-16:** Dashboard avançado e alertas
- **Semanas 17-20:** Otimização e calibração

### Fase 3: Produção (4 semanas)
- **Semanas 21-22:** Testes de carga e segurança
- **Semanas 23-24:** Deploy e monitoramento

## 🎯 Próximos Passos

1. ✅ Estrutura base da aplicação Next.js
2. 🔄 Implementar sistema de autenticação e perfis de usuário
3. 🔄 Desenvolver módulo de avaliação diagnóstica inicial
4. 📋 Implementar banco de questões adaptativas
5. 📋 Criar modelos de machine learning para Knowledge Tracing
6. 📋 Desenvolver sistema de recomendação personalizado
7. 📋 Implementar dashboard de acompanhamento
8. 📋 Integrar sistema de alertas inteligentes
9. 📋 Adicionar visualizações avançadas (D3.js)
10. 📋 Implementar sistema de simulados
11. 📋 Adicionar analytics e métricas de performance
12. 📋 Implementar sistema de monetização

## 🏆 Conclusão

Este sistema representa um avanço significativo na educação personalizada, oferecendo uma abordagem científica e tecnologicamente avançada para quantificar e otimizar o aprendizado para o ENEM. A combinação de técnicas de machine learning, psicometria e ciência de dados permite criar um sistema personalizado e eficaz para maximizar o potencial de cada estudante.

---

Desenvolvido seguindo os padrões estabelecidos no [README da Plataforma Estuda Zatto](../Prompts/README-PLATAFORMA-ESTUDA-ZATTO.md).

**Sistema de Análise de Conhecimento ENEM**  
**Data:** 22 de Agosto de 2025  
**Versão:** 1.0
