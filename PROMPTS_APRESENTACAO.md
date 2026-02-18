# Prompts para Geração de Conteúdo — Doctor Auto AI

---

## 🎯 PROMPT 1: Apresentação PowerPoint

```
Crie uma apresentação profissional e moderna sobre o sistema "Doctor Auto AI" — um sistema de inteligência artificial para gestão de oficinas mecânicas premium em São Paulo (3 unidades), com visão de se tornar um SaaS para o mercado automotivo.

ESTRUTURA DOS SLIDES:

SLIDE 1 — CAPA
- Título: "Doctor Auto AI — Gestão Inteligente com IA"
- Subtítulo: "Do ERP inteligente ao SaaS que vai revolucionar o mercado automotivo"
- Visual: Dark theme, tons de azul e roxo, futurista

SLIDE 2 — QUEM SOMOS
- Doctor Auto: rede de 3 oficinas mecânicas premium em São Paulo
- Atendemos carros de luxo e alta performance
- Diretor Thales: empreendedor que une gestão e tecnologia
- Missão: usar IA para elevar o padrão da indústria automotiva

SLIDE 3 — O PROBLEMA DO MERCADO
- Brasil tem 130.000+ oficinas mecânicas
- 95% usam gestão manual ou sistemas ultrapassados
- Dados espalhados em planilhas, WhatsApp, cadernos
- Donos gastam 60% do tempo em tarefas administrativas
- Perda de clientes por falta de follow-up
- Sem inteligência para prever demanda, estoque ou inadimplência
- Nenhum sistema do mercado oferece IA real integrada à operação

SLIDE 4 — A SOLUÇÃO
- Sistema de IA hierárquico que gerencia TUDO automaticamente
- IA Rainha (Sophia) como cérebro central que aprende e decide
- 3 Princesas especializadas: Atendimento, Financeiro, Marketing
- ERP completo com 30+ módulos integrados
- Custo zero de IA: usa modelos locais (Ollama) no próprio servidor
- Validado na operação real das 3 oficinas Doctor Auto

SLIDE 5 — ARQUITETURA DO SISTEMA (Diagrama visual)
- 3 camadas:
  1. Site ERP (Vercel) — React 19, Supabase, 30+ páginas — funcionários e clientes
  2. VPS Dedicada (Docker) — Sophia + Princesas + Ollama + Redis + ChromaDB
  3. Command Center — Dashboard exclusivo do gestor para comandar o sistema
- Bots intermediários conectam o ERP à Sophia automaticamente
- Sophia é invisível para usuários comuns — só o gestor dá ordens

SLIDE 6 — SOPHIA (IA Rainha)
- Cérebro central: coordena todas as IAs e decisões
- Roda em LLM local (llama3.1:8b) = custo ZERO de processamento
- Claude API apenas como fallback de emergência
- Auto-aprendizado: observa e aprende com cada ação do gestor (Observer Pattern)
- Decisões semi-automáticas: sugere ação, gestor aprova ou rejeita
- Evolui para auto-decisão com score de confiança
- NINGUÉM acessa ela diretamente exceto o gestor via Command Center

SLIDE 7 — AS PRINCESAS (IAs Especializadas)
- Anna (rosa) — Atendimento:
  • Responde clientes automaticamente (WhatsApp, site, Kommo)
  • Agenda serviços e envia lembretes
  • Follow-up pós-serviço automático
  • Pesquisa de satisfação inteligente
- Simone (ciano) — Financeiro:
  • Análise de faturamento em tempo real
  • Alertas de inadimplência antes de vencer
  • Relatórios automáticos (diário, semanal, mensal)
  • Projeções de receita e despesa
- Thamy (âmbar) — Marketing:
  • Posts automáticos em redes sociais
  • Análise de engajamento e ROI
  • Campanhas segmentadas por perfil de cliente
  • Remarketing automático para clientes inativos
- Escalation: Se não sabem algo, sobem para Sophia decidir

SLIDE 8 — COMMAND CENTER
- Dashboard visual exclusivo do gestor
- Mapa interativo de todas as 30+ rotas do sistema (canvas com zoom, pan, drag)
- Chat direto com Sophia para dar ordens e consultar dados
- Dashboard de decisões pendentes, aprovadas e rejeitadas
- Knowledge base: tudo que Sophia aprendeu, organizável
- Observer: histórico de tudo que o gestor fez (auto-learning)
- Conexões editáveis entre módulos (flow, redirect, API, data)
- Customização de avatares e personalidades das IAs
- Segurança total: ninguém além do gestor tem acesso

SLIDE 9 — O ERP (30+ Módulos)
- Dashboard principal com KPIs em tempo real
- Ordens de Serviço (criar, acompanhar, finalizar)
- Cadastro de clientes com histórico completo
- Gestão de peças e estoque inteligente
- Financeiro: contas a pagar/receber, DRE, fluxo de caixa
- Agenda de serviços com calendário visual
- Kanban de atendimento
- Relatórios customizáveis
- Portal do cliente (acompanhar OS pelo celular)
- Chat integrado com IAs de oficina (Dr. Auto, Anna Laura, Orça Pro)
- Gestão multi-unidade (3 oficinas em um só lugar)
- Controle de garantias
- NPS e pesquisa de satisfação

SLIDE 10 — TECNOLOGIA
- Frontend: React 19, Vite, TailwindCSS, shadcn/ui
- Backend: Supabase (PostgreSQL + Realtime + Auth + Edge Functions + RLS)
- IA: Ollama (llama3.1:8b, mistral:7b) — local, custo zero
- Vetores: ChromaDB para RAG e knowledge base
- Cache/Fila: Redis para performance e task queue
- Infraestrutura: Docker Compose (8 containers), Nginx SSL
- Integrações: Kommo CRM, WhatsApp Business API
- Deploy: Vercel (site) + VPS Hostinger KVM 8 (IA)
- Segurança: RLS por unidade, SSL, rate limiting, auth Supabase

SLIDE 11 — DIFERENCIAIS COMPETITIVOS
- vs Oficina Inteligente, MecWise, AutoGestor:
  • Eles: ERP básico sem IA real
  • Nós: IA que DECIDE e APRENDE, não só organiza dados
- Custo zero de IA: modelos locais no servidor próprio
  • Concorrentes com IA cobram $$$$ por uso de API (OpenAI, etc.)
- Hierarquia inteligente: Rainha + Princesas especializadas
- Auto-aprendizado: sistema melhora sozinho com o tempo
- Dados 100% proprietários: nada em cloud de terceiros
- Multi-unidade nativo: gestão de rede desde o dia 1
- Command Center: visão de "dono de negócio", não de "operador"

SLIDE 12 — ROADMAP TÉCNICO
- v0.1 ✅ Command Center Base (CONCLUÍDO)
- v0.2 Deploy site na Vercel (produção)
- v0.3 Command Center Polish (KPIs, minimap, export)
- v0.4 Supabase Realtime + Schema IA otimizado
- v0.5 Docker deploy VPS com toda a stack de IA
- v0.6 Bot SQL funcional (Sophia consulta banco de dados)
- v0.7 Bots intermediários (site alimenta Sophia automaticamente)
- v0.8 Princesas operacionais (Anna, Simone, Thamy com funções reais)
- v0.9 Integração Kommo CRM
- v1.0 Sophia Auto-Decisão (modo semi-automático completo)

SLIDE 13 — FASE ATUAL: VALIDAÇÃO INTERNA
- Sistema rodando nas 3 oficinas Doctor Auto
- Thales usa diariamente como diretor e beta tester
- Cada feature é validada na operação real antes de avançar
- Métricas sendo coletadas: tempo economizado, erros evitados, clientes recuperados
- Objetivo: ter v1.0 rodando perfeitamente antes de abrir para o mercado

SLIDE 14 — VISÃO SAAS: O PLANO
- FASE 1 (Atual): Produto interno — rodar nas 3 oficinas Doctor Auto
- FASE 2: Beta fechado — 5-10 oficinas parceiras em SP testam o sistema
- FASE 3: Lançamento regional — SaaS para oficinas premium em SP/RJ/MG
- FASE 4: Escala nacional — qualquer oficina do Brasil
- FASE 5: Verticalização — expandir para outros setores (concessionárias, autopeças, funilaria)

SLIDE 15 — MODELO DE NEGÓCIO SAAS
- Plano Essencial (R$297/mês): ERP completo + 1 IA básica
- Plano Profissional (R$597/mês): ERP + Sophia + 2 Princesas + Command Center
- Plano Enterprise (R$997/mês): Tudo + multi-unidade + IA ilimitada + onboarding dedicado
- Add-ons: Integração Kommo (+R$97), WhatsApp API (+R$147), Princesa customizada (+R$197)
- Modelo: Recorrência mensal (MRR), self-service + onboarding
- Meta Ano 1: 100 oficinas = R$59.700/mês MRR
- Meta Ano 2: 500 oficinas = R$298.500/mês MRR
- Meta Ano 3: 2.000 oficinas = R$1.2M/mês MRR

SLIDE 16 — TAM/SAM/SOM
- TAM (Total): 130.000 oficinas no Brasil × R$597 médio = R$930M/ano
- SAM (Acessível): 15.000 oficinas premium/médias em capitais = R$107M/ano
- SOM (Conquistável em 3 anos): 2.000 oficinas = R$14.3M/ano
- O mercado é ENORME e fragmentado — não existe líder claro com IA

SLIDE 17 — POR QUE AGORA?
- IA generativa amadureceu (LLMs locais viáveis e baratos)
- Mercado automotivo ainda não foi disruptado por IA
- Oficinas premium estão buscando diferencial tecnológico
- Geração Z de mecânicos quer ferramentas modernas
- Custo de infra despencou (VPS KVM 8 = R$150/mês roda toda a IA)
- Validação real: já roda em 3 oficinas de verdade, não é PowerPoint

SLIDE 18 — TIME & PRÓXIMOS PASSOS
- Thales: Diretor e Product Owner — visão de negócio + operação real
- Stack técnica: Claude Code (desenvolvimento), Lovable (frontend), Supabase (backend)
- Próximos passos:
  1. Completar v1.0 com Sophia totalmente operacional
  2. Documentar métricas de resultado das 3 oficinas
  3. Abrir beta fechado com 5 oficinas parceiras
  4. Buscar investimento seed para escalar (time técnico + comercial)
  5. Lançamento SaaS regional SP

SLIDE 19 — O QUE BUSCAMOS (se for pitch para investidor)
- Investimento Seed: R$500K - R$1M
- Uso: Time técnico (2 devs + 1 designer), comercial (2 vendedores), infra
- Valuation: R$5M pre-money (baseado em tech + validação real + mercado)
- Timeline: 18 meses para break-even
- Exit possível: Aquisição por player de gestão automotiva ou SaaS vertical

SLIDE 20 — ENCERRAMENTO
- "Doctor Auto AI — Onde tecnologia encontra excelência automotiva"
- "De oficina premium a plataforma SaaS: o futuro da gestão automotiva é inteligente"
- Contato: Thales / Doctor Auto
- Logo Doctor Auto com efeito de glow roxo

ESTILO VISUAL:
- Tema escuro/dark com gradientes azul-roxo
- Fontes modernas e limpas (Inter ou SF Pro Display)
- Ícones minimalistas (estilo Lucide/Feather)
- Sem excesso de texto — frases curtas e impactantes
- Diagramas limpos com setas e conexões
- Cores das IAs: Sophia=roxo/dourado, Anna=rosa, Simone=ciano, Thamy=âmbar
- Gráficos financeiros limpos e otimistas
- Screenshots reais do Command Center quando possível
- Slide de métricas com números grandes e destaque
```

---

## 🎬 PROMPT 2: Geração de Vídeo

```
Crie um vídeo explicativo/institucional de 3-4 minutos sobre o sistema "Doctor Auto AI" — um sistema de inteligência artificial para gestão de oficinas mecânicas premium, com visão de se tornar um SaaS para o mercado automotivo brasileiro.

ROTEIRO:

[0:00-0:15] ABERTURA CINEMATOGRÁFICA
Visual: Plano aéreo de São Paulo ao amanhecer. Transição para oficina mecânica premium — ambiente limpo, iluminado, carros de luxo nos elevadores. Mecânicos com uniforme impecável.
Narração: "São Paulo. A maior cidade da América Latina. E dentro dela, uma revolução silenciosa está acontecendo no mercado automotivo."

[0:15-0:35] O PROBLEMA
Visual: Gestor em escritório cercado de papéis, planilhas no computador, WhatsApp lotado, telefone tocando. Split screen mostrando 3 oficinas simultaneamente — caos organizado.
Narração: "Gerenciar uma rede de oficinas mecânicas premium gera milhares de dados por dia. Ordens de serviço, clientes, peças, financeiro, marketing. Tudo espalhado. Tudo manual. E o dono? Preso apagando incêndio ao invés de crescer o negócio."

[0:35-0:50] O MERCADO
Visual: Mapa do Brasil com pontos pulsando — 130 mil oficinas. Zoom em gráficos mostrando o mercado. Números aparecendo na tela.
Narração: "O Brasil tem mais de 130 mil oficinas mecânicas. Um mercado de quase 1 bilhão de reais por ano em gestão. E 95% delas ainda usam planilha, caderno ou sistemas dos anos 2000. Nenhuma usa inteligência artificial de verdade."

[0:50-1:15] A SOLUÇÃO — DOCTOR AUTO AI
Visual: Transição dramática — tela escura, partículas digitais formando uma coroa roxa brilhante. Interface futurista surge. Linhas de dados fluindo como um organismo vivo.
Narração: "Até agora. Apresentamos o Doctor Auto AI. Um sistema completo de inteligência artificial que não só organiza dados — ele PENSA, APRENDE e DECIDE. No centro de tudo está Sophia — a Rainha. Uma IA que funciona como o cérebro do negócio. E o melhor: roda em servidores próprios, com custo zero de processamento. Sem APIs caras. Sem dependência de ninguém."

[1:15-1:45] SOPHIA E AS PRINCESAS
Visual: Avatar de Sophia (coroa roxa, elegante) surge no centro. Três linhas de luz saem dela para três avatares menores. Cada princesa aparece com sua cor e ícones de função.
Narração: "Sophia coordena um time de IAs especializadas — as Princesas. Anna, de rosa, cuida do atendimento. Responde clientes, agenda serviços, faz follow-up automático, 24 horas por dia. Simone, de ciano, gerencia o financeiro. Analisa faturamento, detecta inadimplência antes de virar problema, gera relatórios sozinha. E Thamy, de âmbar, cuida do marketing. Cria campanhas, analisa engajamento, recupera clientes inativos. Cada uma com personalidade própria. E quando não sabem algo? Escalam para Sophia decidir."

[1:45-2:10] COMMAND CENTER
Visual: Tela do Command Center — mapa visual com nodes conectados, zoom in no chat com Sophia, dashboard de decisões, observer mostrando métricas em tempo real.
Narração: "O gestor controla tudo de um único lugar: o Command Center. Um dashboard visual onde ele vê cada módulo do sistema como um mapa interativo. Conversa diretamente com Sophia. Monitora decisões. E a Sophia aprende — cada ação do gestor alimenta a inteligência do sistema. Com o tempo, ela começa a antecipar decisões e sugerir ações antes de você pedir."

[2:10-2:30] DIFERENCIAL E VALIDAÇÃO
Visual: Split screen — lado esquerdo: sistemas antigos (planilhas, ERPs básicos). Lado direito: Doctor Auto AI (moderno, inteligente). Depois, footage das 3 oficinas reais Doctor Auto.
Narração: "Enquanto outros oferecem ERP básico disfarçado de inovação, nós entregamos IA que realmente decide. E não é teoria — o sistema já roda nas 3 oficinas Doctor Auto em São Paulo. Validado na operação real. Cada feature testada no dia a dia de uma rede premium de verdade."

[2:30-3:00] VISÃO SAAS
Visual: Animação do sistema se expandindo — de 3 oficinas para dezenas, centenas. Mapa do Brasil se iluminando. Gráficos de crescimento.
Narração: "Mas a visão vai além. O Doctor Auto AI está se tornando um SaaS — uma plataforma que qualquer oficina mecânica do Brasil pode usar. Começamos com beta fechado para oficinas parceiras em São Paulo. Depois expandimos para capitais. E então, para todo o país. O mercado é de 130 mil oficinas. Não existe líder com IA. A oportunidade é agora."

[3:00-3:20] MODELO DE NEGÓCIO
Visual: Cards com os 3 planos surgindo (Essencial, Profissional, Enterprise). Números de MRR crescendo. Gráfico de projeção.
Narração: "Com planos a partir de 297 reais por mês, o modelo é recorrência pura. Nossa meta: 100 oficinas no primeiro ano. 500 no segundo. 2 mil no terceiro. Isso representa mais de 1 milhão de reais em receita mensal recorrente. Num mercado que ninguém está atendendo com inteligência artificial."

[3:20-3:40] TECNOLOGIA POR TRÁS
Visual: Diagrama animado mostrando Docker, Ollama, Supabase, Redis, ChromaDB. Containers se conectando. Dados fluindo.
Narração: "A tecnologia é robusta e escalável. Modelos de IA rodando localmente via Ollama — custo zero por cliente. Docker orquestando a infraestrutura. Supabase para dados em tempo real. Redis para velocidade. ChromaDB para memória inteligente. Tudo projetado para escalar de 3 oficinas para 3 mil."

[3:40-3:55] CALL TO ACTION
Visual: Logo Doctor Auto com efeito de glow roxo. Sophia ao fundo, sutil. Tagline surge.
Narração: "Doctor Auto AI. De oficina premium a plataforma SaaS. O futuro da gestão automotiva é inteligente. E começa agora."
Texto na tela: "Doctor Auto AI — Onde tecnologia encontra excelência automotiva"

[3:55-4:00] ENCERRAMENTO
Visual: Fade para preto com logo e contato.
Texto: "Quer saber mais? Entre em contato." + dados de contato

ESTILO DO VÍDEO:
- Tom: Profissional, confiante, visionário mas com pé no chão (produto real, não promessa)
- Cores: Dark theme dominante, azul e roxo como cores principais, destaques dourados
- Cores das IAs: Sophia=roxo/dourado, Anna=rosa, Simone=ciano, Thamy=âmbar
- Música: Eletrônica suave/corporate tech crescendo — começa calma, cresce na parte do SaaS
- Transições: Suaves com motion graphics modernos, estilo tech startup
- Tipografia: Clean, moderna (Inter, Montserrat ou SF Pro)
- Visual: Mix de footage real de oficina mecânica premium + motion graphics + UI mockups do sistema
- Ritmo: Começa contemplativo, acelera na solução, pico no SaaS, fecha inspiracional
- Referência de estilo: Vídeos institucionais de Stripe, Linear, Notion
```

---

## 📋 ONDE USAR CADA PROMPT

### Apresentação PowerPoint:
- **Gamma.app** (melhor resultado com prompts longos)
- **Tome.app** (bom para storytelling)
- **Beautiful.ai** (templates profissionais)
- **SlidesAI** (plugin do Google Slides)
- **Canva AI** (mais customizável)

### Vídeo:
- **Synthesia** (melhor para narração com avatar)
- **HeyGen** (avatares realistas)
- **InVideo AI** (melhor para vídeo completo com footage)
- **Runway Gen-3** (melhor para visuais cinematográficos)
- **Pika** (motion graphics rápidos)
- **Descript** (se quiser gravar narração própria e editar)

### Dica:
- Para pitch de investidor → Use a apresentação com slides 1-20
- Para clientes/oficinas → Use slides 1-13 (corte a parte de investimento)
- Para redes sociais → Use o vídeo cortado em versão 60s (abertura + solução + CTA)
