# 🛡️ Fatos.online — Portal Moderno de Checagem de Fatos & Verdade Digital

> Esta é a aplicação full-stack do projeto (pasta `app/` do repositório). A landing page estática fica na raiz — veja o [README principal](../README.md).

Portal completo e responsivo de jornalismo investigativo e checagem de fatos em tempo real, equipado com inteligência artificial multimodal (Google Gemini 2.5/3.8 Flash com busca ativa Google Search Grounding), catálogo de desmentidos com filtros, envio de denúncias multimídia e newsletter semanal em conformidade com a LGPD.

---

## 🎨 Identidade Visual e Paleta de Cores
- **Primária**: Azul-Marinho Profundo (`#0A1F44`)
- **Destaque**: Azul Elétrico (`#2563EB`)
- **Verdadeiro**: Verde-Verdade (`#10B981`)
- **Impreciso**: Amarelo-Alerta (`#F59E0B`)
- **Falso**: Vermelho-Falso (`#EF4444`)
- **Não Verificável**: Roxo-Índigo (`#6366F1`)
- **Tipografia**: Google Fonts *Inter* e *Poppins*
- **Temas**: Modo Claro e Escuro nativo com persistência em `localStorage`

---

## 🚀 Funcionalidades Principais

1. **Motor de Fact-Checking em Tempo Real**:
   - Checagem por **texto livre**, frases ditas em discursos ou transcrições.
   - Verificação de **links de redes sociais** (Instagram, X/Twitter, TikTok, Facebook, YouTube).
   - Upload com **drag-and-drop de imagens e vídeos** (PNG, JPG, WebP, MP4, MOV) para análise de montagens e deepfakes.
   - Integração com **Google Search Grounding** para recuperação de fontes jornalísticas e documentos públicos em tempo real.
   - Veredito detalhado com **porcentagem de confiança (0-100%)**, explicação detalhada, pontos-chave e links de fontes oficiais.
   - Ações imediatas: copiar resultado, compartilhar no WhatsApp e reiniciar.

2. **Catálogo de Verificações Recentes**:
   - Grid moderno com thumbnails e selos de veredito coloridos.
   - Filtro por editorias: *Política*, *Saúde & Ciência*, *Tecnologia & IA*, *Redes Sociais & Golpes*.
   - Busca em tempo real por palavras-chave.
   - Modal com leitura detalhada e fontes de cada fato.
   - Paginação com "Carregar mais".

3. **Newsletter Semanal com Proteção LGPD**:
   - Cadastro seguro com validação de e-mail RFC 5322.
   - Checkbox obrigatório de consentimento da LGPD.
   - Prevenção contra duplicatas no backend.
   - Feedback animado de sucesso.

4. **Metodologia & Transparência**:
   - Alinhado com o Código de Princípios da IFCN (*International Fact-Checking Network*).
   - Apresentação da régua dos 4 vereditos oficiais.

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
- Node.js 18+ ou superior
- NPM ou PNPM

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/briandevbr/fatos.online.git
cd fatos.online/app
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha sua chave do Google AI Studio:
```env
# Obtenha sua chave gratuitamente em: https://aistudio.google.com/
GEMINI_API_KEY="AIzaSy..."
# ou GOOGLE_AI_API_KEY="AIzaSy..."
```

> **Nota:** No ambiente do Google AI Studio Build, a chave `GEMINI_API_KEY` é injetada automaticamente através do painel **Secrets**.

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador. O backend Express roda integrado via Vite middleware.

---

## 🗄️ Schema SQL do Banco de Dados

O schema SQL oficial está disponível em `db/schema.sql`.

```sql
-- 1. Assinantes da Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    lgpd_consent BOOLEAN NOT NULL DEFAULT 1,
    ip_hash VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- 2. Checagens de Fatos
CREATE TABLE IF NOT EXISTS fact_checks (
    id VARCHAR(64) PRIMARY KEY,
    claim TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    verdict VARCHAR(50) NOT NULL CHECK(verdict IN ('verdadeiro', 'falso', 'impreciso', 'nao_verificavel')),
    confidence INTEGER NOT NULL CHECK(confidence BETWEEN 0 AND 100),
    summary TEXT NOT NULL,
    explanation TEXT NOT NULL,
    key_points TEXT,
    sources TEXT NOT NULL,
    media_type VARCHAR(50) DEFAULT 'text',
    original_url TEXT,
    thumbnail_url TEXT,
    is_featured BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚢 Deploy em Produção

### Build da Aplicação
```bash
npm run build
```

### Executar em Produção
```bash
npm start
```
O servidor Express servirá os assets compilados em `dist/` com compressão e segurança nas rotas `/api/*`.

---

## ⚖️ Licença
Distribuído sob licença Apache-2.0.
