# Fatos.online — Portal Moderno de Checagem de Fatos e Verdade Digital

Plataforma profissional de jornalismo investigativo e checagem de fatos em tempo real, equipada com inteligência artificial multimodal (Gemini 2.5/3.8 Flash com Google Search Grounding) para verificação de alegações, links de redes sociais, imagens e vídeos virais, além de catálogo editorial e newsletter com conformidade à LGPD.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas pelo usuário:**
> - **Nome da Marca**: `Fatos.online` — identidade de autoridade jornalística, transparência e combate à desinformação.
> - **Motor de IA**: `Gemini Flash` com busca web em tempo real (Google Search Grounding) para recuperar fontes jornalísticas e referências vivas da web.
> - **Catálogo Inicial de Checagens**: Mix equilibrado cobrindo Política, Saúde & Ciência, Tecnologia/IA e Redes Sociais & Golpes virtuais.
> - **Paleta e Identidade**: Azul-marinho profundo (`#0A1F44`), azul elétrico (`#2563EB`), verde-verdade (`#10B981`), amarelo-impreciso (`#F59E0B`), vermelho-falso (`#EF4444`) e cinzas neutros com suporte nativo a temas Claro e Escuro.

---

### 1. Overview & Core Concept

- **O que faz**: O **Fatos.online** oferece aos cidadãos, jornalistas e pesquisadores uma ferramenta ágil e confiável para verificar a autenticidade de notícias, postagens de redes sociais (X/Twitter, Instagram, TikTok, WhatsApp, Facebook, YouTube), imagens e textos virais.
- **Público-alvo**: Leitores de notícias digitais, profissionais da comunicação, educadores e qualquer pessoa que receba alegações suspeitas e queira validar a veracidade antes de compartilhar.
- **Valor Central**: Transparência metodológica, vereditos claros com porcentagem de confiança, fontes com links clicáveis e interface veloz com modo escuro e acessibilidade WCAG AA.

---

### 2. User Experience & Visual Design

#### A. Identidade Visual & Tema
- **Cores Semânticas de Checagem**:
  - `VERDADEIRO`: Verde esmeralda (`#10B981` / `emerald-600`) com fundos sutis de confirmação.
  - `FALSO`: Vermelho escarlate (`#EF4444` / `rose-600`) para desinformações desmentidas.
  - `IMPRECISO`: Âmbar dourado (`#F59E0B` / `amber-500`) para meias-verdades ou conteúdos fora de contexto.
  - `NÃO VERIFICÁVEL`: Roxo ardósia (`#6366F1` / `indigo-500`) para alegações sem dados suficientes.
- **Tipografia**: Família *Inter* com hierarquia editorial refinada, pesos equilibrados (Regular, Medium, SemiBold, Bold) e legibilidade otimizada.
- **Modo Claro & Escuro**:
  - Claro: Fundo neutro limpo (`bg-slate-50`), cartões em branco puro (`bg-white`) com bordas suaves (`border-slate-200`) e sombras sutis.
  - Escuro: Fundo azul-marinho profundo (`#0A1F44` / `bg-slate-950`), cartões em ardósia noturna (`bg-slate-900`) e bordas contrastantes (`border-slate-800`).
- **Disciplina Anti-Slop (Zero-Pill)**: Metadados (datas, autor, tempo de leitura) renderizados em texto tipográfico elegante com separadores (`·`), reservando formatos de cápsula e botões apenas para controles interativos (abas de filtro e botões de ação).

#### B. Fluxo de Usuário & Componentes
1. **Header Fixo**:
   - Logotipo exclusivo com escudo e lupa vetorial estilizada.
   - Navegação: Início, Checar Fato, Verificações Recentes, Metodologia/Sobre.
   - Alternador de tema Claro/Escuro (persistente em `localStorage`).
   - Botão de ação direta "Checar Agora" (rolagem suave até a ferramenta).
2. **Hero Section**:
   - Título marcante: *"Combata a desinformação com fatos verificados"*.
   - Subtítulo focado na missão democrática de checagem.
   - Contadores interativos animados com métricas em tempo real (ex.: `14.820+` checagens realizadas, `9.410+` falsidades neutralizadas).
   - Exemplos rápidos de 1 clique para testar alegações comuns.
3. **Módulo Principal de Checagem (Fact-Checker Engine)**:
   - Abas intuitivas de entrada:
     - 📝 **Texto / Transcrição**: Cole uma notícia, mensagem de WhatsApp ou frase dita por figura pública.
     - 🔗 **Link de Post**: Suporte a URLs de redes sociais (X, Instagram, TikTok, Facebook, YouTube, portais).
     - 🖼️ **Upload Multimídia**: Drag-and-drop para imagens (JPG, PNG, WebP) e simulação/leitura de transcrição para vídeos.
   - Botão de envio "Verificar Agora" com estados táteis e animação de progresso por etapas (*"Consultando fontes jornalísticas..."*, *"Verificando bases de dados..."*, *"Calculando nível de confiança..."*).
   - Card de Veredito Completo:
     - Badge do Veredito com animação e cores oficiais.
     - Barra de Nível de Confiança (0 a 100%).
     - Análise contextual detalhada em linguagem jornalística clara.
     - Lista de fontes consultadas com links e títulos verificáveis.
     - Ferramentas de ação: Copiar texto da checagem, Baixar/Compartilhar card, Nova Checagem.
4. **Catálogo de Verificações Recentes**:
   - Barra de busca textual por palavras-chave.
   - Filtros por categoria: Todas, Política, Saúde & Ciência, Tecnologia & IA, Redes Sociais.
   - Grid responsivo de cards com thumbnails, selos de veredito, resumo e data.
   - Modal detalhado de leitura completa ao clicar no card.
   - Botão "Carregar Mais" para paginação progressiva.
5. **Seção de Newsletter com LGPD**:
   - Formulário com campos de Nome e E-mail.
   - Validação em tempo real (RFC 5322 e feedback visual).
   - Checkbox explícito de consentimento e termos de privacidade LGPD.
   - Confirmação animada com sucesso após inscrição.
6. **Seção Sobre & Metodologia**:
   - Apresentação da equipe, código de princípios (baseado no IFCN) e critérios para classificação dos vereditos.
7. **Footer Institucional**:
   - Links úteis, canais de contato, aviso legal de privacidade e direitos autorais.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Arquitetura Full-Stack com API Express no Backend**:
  - *Abordagem*: Criar endpoints de API `/api/fact-check`, `/api/newsletter` e `/api/recent` servidos via Express/Vite middleware.
  - *Por que*: Mantém a chave `GEMINI_API_KEY` estritamente no servidor, garantindo segurança contra vazamento no navegador, e viabiliza a persistência de inscritos na newsletter.
- **Decisão 2: Uso do Gemini 2.5/3.8 Flash com Google Search Grounding**:
  - *Abordagem*: Inicializar o `@google/genai` no servidor e configurar a ferramenta `{ googleSearch: {} }` para que o modelo consulte a internet viva e retorne fontes confiáveis (`groundingMetadata.groundingChunks`).
  - *Por que*: Fact-checking exige dados factuais atualizados (notícias recentes, eleições, declarações atuais) que um modelo puramente pré-treinado sem busca não teria.
- **Decisão 3: Armazenamento Local e Persistência Leve**:
  - *Abordagem*: Banco de dados leve persistente em arquivo JSON/SQLite para armazenar inscrições da newsletter e histórico de checagens da comunidade, além de catálogo inicial curado com 10 checagens emblemáticas.
  - *Por que*: Funciona imediatamente sem depender de provisionamento de banco de dados externo ou credenciais complexas, enquanto permite a consulta e a prevenção de e-mails duplicados.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (REACT 19 + VITE)                     │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Header / Nav │  │ Hero + Stats │  │ Fact-Checker │  │ Newsletter │  │
│  │ (Dark/Light) │  │  (Counters)  │  │ (Tabs/Upload)│  │   (LGPD)   │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  └─────┬──────┘  │
│                                             │                │         │
└─────────────────────────────────────────────┼────────────────┼─────────┘
                                              │                │
                                  POST /api/fact-check   POST /api/newsletter
                                              │                │
┌─────────────────────────────────────────────▼────────────────▼─────────┐
│                          BACKEND (EXPRESS SERVER)                      │
│                                                                        │
│  ┌────────────────────────┐                  ┌──────────────────────┐  │
│  │    Gemini Service      │                  │  Newsletter / Data   │  │
│  │  (@google/genai SDK)   │                  │   Storage Manager    │  │
│  │  - Prompt jornalístico │                  │  - Validação e-mail  │  │
│  │  - Search Grounding    │                  │  - Bloqueio duplicata│  │
│  │  - JSON estruturado    │                  │  - Schema SQLite/JSON│  │
│  └──────────┬─────────────┘                  └──────────────────────┘  │
└─────────────┼──────────────────────────────────────────────────────────┘
              │
              ▼
    Google Gemini 2.5/3.8 Flash
    + Google Search Grounding (Web Sources)
```

#### Schema do Banco de Dados (Entregável SQL)
- `newsletter_subscribers`:
  - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
  - `name`: TEXT NOT NULL
  - `email`: TEXT NOT NULL UNIQUE
  - `lgpd_consent`: BOOLEAN NOT NULL DEFAULT 1
  - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fact_checks`:
  - `id`: TEXT PRIMARY KEY
  - `claim`: TEXT NOT NULL
  - `category`: TEXT NOT NULL
  - `verdict`: TEXT NOT NULL CHECK(verdict IN ('verdadeiro', 'falso', 'impreciso', 'nao_verificavel'))
  - `confidence`: INTEGER NOT NULL CHECK(confidence BETWEEN 0 AND 100)
  - `explanation`: TEXT NOT NULL
  - `sources`: TEXT NOT NULL (JSON array de links)
  - `media_type`: TEXT ('text', 'link', 'image', 'video')
  - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

### 5. Plano de Entrega e Verificação

1. **Configuração e Metadados**:
   - Atualizar `metadata.json` com nome `Fatos.online` e descrição da plataforma.
   - Atualizar `index.html` com títulos, meta-tags SEO e fontes Inter/Poppins.
2. **Servidor Backend e Integração Gemini**:
   - Criar `server/gemini.ts` com chamada segura à API Gemini usando `@google/genai` e busca Google Search.
   - Criar `server/storage.ts` com tabelas de newsletter e checagens com validação.
   - Configurar rotas `/api/fact-check`, `/api/newsletter`, `/api/recent` no servidor Express / middleware Vite.
3. **Componentes Frontend**:
   - `Header`: Logotipo vetorial personalizado, navegação com âncoras, alternador de tema.
   - `Hero`: Título, subtítulo, contadores estatísticos animados e botões de teste rápido.
   - `FactChecker`: Abas de texto, link e multimídia; dropzone de upload; indicador de progresso; card de veredito detalhado com cores oficiais, fontes clicáveis e ações (copiar, compartilhar, limpar).
   - `RecentChecks`: Grid filtrável com busca, badges de categoria e veredito, e modal de detalhes.
   - `Newsletter`: Formulário com validação em tempo real e consentimento LGPD.
   - `Methodology`: Painel sobre os critérios jornalísticos e código de conduta IFCN.
   - `Footer`: Links institucionais, LGPD e créditos.
4. **Documentação & Entregáveis**:
   - Arquivo `.env.example` atualizado com documentação clara.
   - `README.md` completo com instruções de instalação, configuração da chave no Google AI Studio, comandos e deploy.
   - Script SQL com os schemas das tabelas.
5. **Verificação**:
   - Compilação do TypeScript e validação de linting sem erros.
   - Teste de fluxo completo de verificação e inscrição de newsletter.
