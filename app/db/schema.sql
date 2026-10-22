-- ====================================================================
-- Fatos.online - Schema do Banco de Dados Relacional (PostgreSQL / SQLite)
-- Tabelas: newsletter_subscribers e fact_checks
-- ====================================================================

-- 1. Tabela de Assinantes da Newsletter com consentimento LGPD
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- SERIAL PRIMARY KEY em PostgreSQL
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    lgpd_consent BOOLEAN NOT NULL DEFAULT 1,
    ip_hash VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para busca rápida e proteção contra duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers(created_at);

-- 2. Tabela de Checagens de Fatos (Histórico e Catálogo Editorial)
CREATE TABLE IF NOT EXISTS fact_checks (
    id VARCHAR(64) PRIMARY KEY,
    claim TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    verdict VARCHAR(50) NOT NULL CHECK(verdict IN ('verdadeiro', 'falso', 'impreciso', 'nao_verificavel')),
    confidence INTEGER NOT NULL CHECK(confidence BETWEEN 0 AND 100),
    summary TEXT NOT NULL,
    explanation TEXT NOT NULL,
    key_points TEXT, -- Armazenado como JSON array
    sources TEXT NOT NULL, -- Armazenado como JSON array [{ "title": "...", "url": "..." }]
    media_type VARCHAR(50) DEFAULT 'text', -- 'text', 'link', 'image', 'video'
    original_url TEXT,
    thumbnail_url TEXT,
    is_featured BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fact_checks_category ON fact_checks(category);
CREATE INDEX IF NOT EXISTS idx_fact_checks_verdict ON fact_checks(verdict);
CREATE INDEX IF NOT EXISTS idx_fact_checks_created_at ON fact_checks(created_at);

-- 3. Inserção de dados iniciais recomendados (Mix: Política, Saúde, Tecnologia, Redes Sociais)
INSERT OR IGNORE INTO fact_checks (id, claim, category, verdict, confidence, summary, explanation, sources, media_type, is_featured)
VALUES 
(
    'chk_001',
    'Vídeo viral afirma que nova lei federal obriga cidadãos a pagarem imposto de 15% sobre transferências Pix acima de R$ 50.',
    'Redes Sociais & Golpes',
    'falso',
    98,
    'Não existe qualquer imposto ou tributação sobre transferências Pix para pessoas físicas.',
    'A alegação de que foi criada uma nova taxa ou imposto sobre o Pix é falsa. O Banco Central do Brasil e o Ministério da Fazenda esclareceram reiteradamente que transações via Pix permanecem totalmente isentas de impostos para pessoas físicas. O boato utiliza capturas descontextualizadas de reportagens antigas sobre regras tributárias normais para contas corporativas.',
    '[{"title": "Banco Central do Brasil - Regras do Pix", "url": "https://www.bcb.gov.br"}, {"title": "Ministério da Fazenda - Esclarecimentos Tributários", "url": "https://www.gov.br/fazenda"}]',
    'link',
    1
),
(
    'chk_002',
    'Chá de folhas de louro com cravo da índia é capaz de curar diabetes tipo 2 em até 30 dias sem necessidade de insulina.',
    'Saúde & Ciência',
    'falso',
    99,
    'Não há comprovação científica de cura do diabetes por infusões caseiras. Suspender medicamentos é perigoso.',
    'Sociedades de Endocrinologia e a Organização Mundial da Saúde (OMS) atestam que o diabetes tipo 2 é uma condição metabólica crônica controlável por medicamentos, hábitos saudáveis e insulina quando indicado, porém sem cura milagrosa através de ervas ou chás. A interrupção de tratamentos médicos recomendados pode acarretar cetoacidose ou coma hiperosmolar.',
    '[{"title": "Sociedade Brasileira de Diabetes (SBD)", "url": "https://www.diabetes.org.br"}, {"title": "Organização Mundial da Saúde - Diabetes Fact Sheet", "url": "https://www.who.int"}]',
    'text',
    1
),
(
    'chk_003',
    'Inteligência Artificial foi flagrada criando clones de voz em tempo real para aplicar golpes do falso sequestro em ligações telefônicas.',
    'Tecnologia & IA',
    'verdadeiro',
    94,
    'Golpistas têm utilizado ferramentas de clonagem de voz por IA com poucos segundos de áudio público.',
    'Relatórios recentes de órgãos de segurança cibernética e da Polícia Civil confirmam ocorrências do golpe onde criminosos usam áudios extraídos de redes sociais (stories, reels) para gerar a voz sintética de familiares e exigir resgate ou transferências de urgência. Especialistas recomendam estabelecer palavras-passe de segurança em família.',
    '[{"title": "CERT.br - Centro de Estudos de Segurança na Internet", "url": "https://www.cert.br"}, {"title": "Febraban - Alerta sobre fraudes com IA", "url": "https://www.febraban.org.br"}]',
    'link',
    1
),
(
    'chk_004',
    'Candidato declarou em comício que a taxa de desemprego atual é a maior dos últimos 30 anos no país.',
    'Política',
    'impreciso',
    92,
    'O dado oficial do IBGE/PNAD Contínua mostra o oposto: a taxa atingiu um dos menores patamares históricos recentes.',
    'A declaração confunde números absolutos de pedidos de seguro com a taxa de desocupação geral apurada pelo IBGE. A série histórica da PNAD Contínua aponta que o desemprego está em níveis significativamente menores do que nos picos de 2016 e 2020.',
    '[{"title": "IBGE - Pesquisa Nacional por Amostra de Domicílios Contínua", "url": "https://www.ibge.gov.br"}]',
    'text',
    0
);
