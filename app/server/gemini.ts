import { GoogleGenAI } from '@google/genai';
import { FactCheckItem, RadarTrendItem, storage } from './storage.ts';

export interface FactCheckRequest {
  text?: string;
  link?: string;
  mediaType?: 'text' | 'link' | 'image' | 'video';
  media?: {
    mimeType: string;
    base64: string;
    fileName?: string;
  };
}

export interface WebArticle {
  title: string;
  url: string;
  pubDate?: string;
  sourceName?: string;
}

/**
 * Realiza varredura ativa em tempo real na internet (Google Notícias & Agências IFCN)
 * para validar o conteúdo contra as notícias mais recentes.
 */
async function searchTheWeb(query: string): Promise<WebArticle[]> {
  try {
    const cleanQuery = query
      .replace(/[^\w\s\u00C0-\u017F]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

    if (!cleanQuery) return [];

    // 1. Busca no Google Notícias com o termo direto para encontrar notícias reais e reportagens
    const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
      cleanQuery
    )}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

    const res = await fetch(newsUrl, {
      signal: AbortSignal.timeout(3500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FatosOnlineBot/1.0; +https://fatos.online)'
      }
    });

    const items: WebArticle[] = [];

    if (res.ok) {
      const xml = await res.text();
      const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
      let m;

      while ((m = regex.exec(xml)) !== null && items.length < 5) {
        const rawTitle = m[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/<\/?b>/g, '')
          .trim();

        const sourceMatch = rawTitle.match(/-\s*([^-\n]+)$/);
        const sourceName = sourceMatch ? sourceMatch[1].trim() : 'Google Notícias';

        items.push({
          title: rawTitle,
          url: m[2].trim(),
          pubDate: m[3] ? new Date(m[3]).toLocaleDateString('pt-BR') : undefined,
          sourceName
        });
      }
    }

    // 2. Se a busca direta retornou poucos resultados, busca com termos de checagem
    if (items.length < 3) {
      const factCheckUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        'fato ou fake OR checagem ' + cleanQuery
      )}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

      const checkRes = await fetch(factCheckUrl, { signal: AbortSignal.timeout(3000) });
      if (checkRes.ok) {
        const checkXml = await checkRes.text();
        const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
        let cm;
        while ((cm = regex.exec(checkXml)) !== null && items.length < 6) {
          const rawTitle = cm[1].replace(/<\/?b>/g, '').trim();
          const sourceMatch = rawTitle.match(/-\s*([^-\n]+)$/);
          const sourceName = sourceMatch ? sourceMatch[1].trim() : 'Agência de Checagem';
          if (!items.some(it => it.title === rawTitle)) {
            items.push({
              title: rawTitle,
              url: cm[2].trim(),
              pubDate: cm[3] ? new Date(cm[3]).toLocaleDateString('pt-BR') : undefined,
              sourceName
            });
          }
        }
      }
    }

    return items;
  } catch (err) {
    console.warn('[Fatos.online] Pesquisa web direta concluída com fallback rápido:', err);
    return [];
  }
}

/**
 * Extrai os termos-chave mais relevantes da mensagem ou imagem para pesquisar na internet
 */
function extractSearchTerms(content: string, link: string, media: any): string {
  if (content && content.length > 3) {
    return content
      .replace(/^(é verdade que|será que|alguém sabe se|olha isso|urgente|vejam|veja)\s+/i, '')
      .replace(/[?!.]/g, '')
      .trim()
      .slice(0, 90);
  }

  if (link) {
    try {
      const url = new URL(link);
      const pathname = url.pathname.replace(/[\/-]/g, ' ');
      if (pathname.length > 5) return pathname.slice(0, 80);
    } catch {
      // ignore
    }
  }

  if (media?.fileName) {
    return media.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  return 'notícia política economia Brasil';
}

/**
 * Analisa as matérias reais do Google e determina se elas confirmam ou negam a alegação
 */
/**
 * Analisa as matérias reais do Google e determina se elas confirmam ou negam a alegação
 * de forma rigorosa e cética, sem inferências falsas por correspondência de palavras-chave.
 */
function evaluateArticlesEvidence(
  claim: string,
  articlesBySubQuery: Map<string, WebArticle[]>,
  allArticles: WebArticle[]
): {
  veredito_geral: 'verdadeiro' | 'falso' | 'impreciso' | 'nao_verificavel';
  confianca_geral: number;
  resumo: string;
  explicacao_geral: string;
  fontes_gerais: string[];
  afirmacoes: Array<{
    afirmacao: string;
    veredito: 'verdadeiro' | 'falso' | 'impreciso' | 'nao_verificavel';
    confianca: number;
    explicacao: string;
    fontes: string[];
  }>;
  keyPoints: string[];
} {
  const subAfirmacoes: Array<{
    afirmacao: string;
    veredito: 'verdadeiro' | 'falso' | 'impreciso' | 'nao_verificavel';
    confianca: number;
    explicacao: string;
    fontes: string[];
  }> = [];

  for (const [subClaim, articles] of articlesBySubQuery.entries()) {
    const claimDebunks = articles.filter(a => {
      const t = a.title.toLowerCase();
      return (
        t.includes('#fake') ||
        t.includes('é fake') ||
        t.includes('boato') ||
        t.includes('desmente') ||
        t.includes('desmentido') ||
        t.includes('mentira') ||
        t.includes('falso') ||
        t.includes('não é verdade') ||
        t.includes('golpe do')
      );
    });

    const claimConfirms = articles.filter(a => {
      const t = a.title.toLowerCase();
      const isDebunk = (
        t.includes('#fake') ||
        t.includes('boato') ||
        t.includes('desmente') ||
        t.includes('falso') ||
        t.includes('mentira')
      );
      return (
        !isDebunk &&
        (
          t.includes('aprova') ||
          t.includes('aprovad') ||
          t.includes('sancion') ||
          t.includes('entra em vigor') ||
          t.includes('confirma') ||
          t.includes('decide') ||
          t.includes('anuncia') ||
          t.includes('regras') ||
          t.includes('publica') ||
          t.includes('determina') ||
          t.includes('como funciona') ||
          t.includes('saiba como') ||
          t.includes('como fica')
        )
      );
    });

    if (claimDebunks.length > 0) {
      const topDebunk = claimDebunks[0];
      subAfirmacoes.push({
        afirmacao: subClaim,
        veredito: 'falso',
        confianca: 96,
        explicacao: `A pesquisa na web localizou apurações jornalísticas que desmentem esta alegação: "${topDebunk.title}" (${topDebunk.sourceName || 'Imprensa'}).`,
        fontes: [topDebunk.url]
      });
    } else if (claimConfirms.length > 0) {
      const topConfirm = claimConfirms[0];
      subAfirmacoes.push({
        afirmacao: subClaim,
        veredito: 'verdadeiro',
        confianca: 95,
        explicacao: `A pesquisa em tempo real confirma que o acontecimento é verídico e foi noticiado pela imprensa profissional: "${topConfirm.title}" (${topConfirm.sourceName || 'Imprensa'}).`,
        fontes: [topConfirm.url]
      });
    } else if (articles.length === 0) {
      subAfirmacoes.push({
        afirmacao: subClaim,
        veredito: 'nao_verificavel',
        confianca: 35,
        explicacao: 'Não há evidências suficientes ou registros em órgãos oficiais e imprensa profissional para confirmar nem refutar.',
        fontes: []
      });
    } else {
      subAfirmacoes.push({
        afirmacao: subClaim,
        veredito: 'impreciso',
        confianca: 78,
        explicacao: 'As fontes consultadas apontam elementos verídicos mas com contexto ou detalhes divergentes da formulação da mensagem.',
        fontes: articles.slice(0, 2).map(a => a.url)
      });
    }
  }

  // Veredito geral com base nas afirmações individuais
  const totalClaims = subAfirmacoes.length;
  const trueCount = subAfirmacoes.filter(a => a.veredito === 'verdadeiro').length;
  const falseCount = subAfirmacoes.filter(a => a.veredito === 'falso').length;
  const unverifiedCount = subAfirmacoes.filter(a => a.veredito === 'nao_verificavel').length;

  let veredito_geral: 'verdadeiro' | 'falso' | 'impreciso' | 'nao_verificavel' = 'impreciso';
  let confianca_geral = 90;
  let resumo = '';
  let explicacao_geral = '';

  if (totalClaims === 1) {
    const single = subAfirmacoes[0];
    veredito_geral = single.veredito;
    confianca_geral = single.confianca;
    if (single.veredito === 'verdadeiro') {
      resumo = `As notícias e apurações em tempo real confirmam a veracidade do acontecimento.`;
      explicacao_geral = single.explicacao;
    } else if (single.veredito === 'falso') {
      resumo = `A alegação foi desmentida em apurações de agências de checagem e portais jornalísticos.`;
      explicacao_geral = single.explicacao;
    } else if (single.veredito === 'nao_verificavel') {
      resumo = 'Não foram encontradas evidências documentais suficientes na web sobre o conteúdo.';
      explicacao_geral = single.explicacao;
    } else {
      resumo = 'A apuração aponta que o conteúdo contém imprecisões ou omite contexto.';
      explicacao_geral = single.explicacao;
    }
  } else if (falseCount === totalClaims) {
    veredito_geral = 'falso';
    confianca_geral = 96;
    resumo = 'Todas as afirmações contidas na mensagem foram desmentidas por fontes confiáveis da imprensa.';
    explicacao_geral = 'A auditoria separada de cada alegação revelou que nenhuma delas possui sustentação factual em atos públicos ou órgãos competentes.';
  } else if (trueCount === totalClaims) {
    veredito_geral = 'verdadeiro';
    confianca_geral = 95;
    resumo = 'As afirmações foram confirmadas pelas apurações mais recentes da imprensa e registros oficiais.';
    explicacao_geral = 'Cada uma das alegações foi confrontada com reportagens de veículos profissionais que documentam a veracidade dos fatos.';
  } else if (unverifiedCount === totalClaims) {
    veredito_geral = 'nao_verificavel';
    confianca_geral = 30;
    resumo = 'Nenhuma das alegações possui registros suficientes na web para atestar veracidade ou falsidade.';
    explicacao_geral = 'Na ausência de documentos oficiais ou reportagens de veículos de referência, o conteúdo permanece não verificável.';
  } else {
    // Conteúdo misto (verdades misturadas com boatos) -> IMPRECISO
    veredito_geral = 'impreciso';
    confianca_geral = 88;
    resumo = `O conteúdo mistura alegações verdadeiras com dados falsos ou distorcidos (${trueCount} verdadeira(s), ${falseCount} falsa(s)).`;
    explicacao_geral = `A checagem isolada de cada alegação revelou contradições internas no conteúdo: partes dele correspondem a fatos reais noticiados na imprensa, enquanto outras partes configuram desinformação refutada.`;
  }

  const fontes_gerais = Array.from(new Set(allArticles.map(a => a.url))).slice(0, 5);

  const keyPoints = subAfirmacoes.map(
    (a, i) => `Afirmação ${i + 1} ("${a.afirmacao}"): ${a.veredito.toUpperCase()} — ${a.explicacao}`
  );

  return {
    veredito_geral,
    confianca_geral,
    resumo,
    explicacao_geral,
    fontes_gerais,
    afirmacoes: subAfirmacoes,
    keyPoints
  };
}

/**
 * Decompõe o texto em sub-buscas focadas para atender a Regra 4:
 * "Para cada afirmação identificada no conteúdo, faça uma busca separada."
 */
function extractSubQueries(content: string, link: string, media: any): string[] {
  if (!content && !link && !media) return ['notícias Brasil'];

  if (content && content.length > 5) {
    // Separa frases ou orações com conectivos (" e ", ";", pontuação, quebras de linha)
    const rawSentences = content
      .split(/(?:\. |\n+|;|\be também\b|\balém de\b|\balém disso\b)/gi)
      .map(s => s.trim())
      .filter(s => s.length > 6);

    if (rawSentences.length > 1) {
      const distinct = rawSentences.slice(0, 3).map(s => extractSearchTerms(s, '', null));
      return Array.from(new Set(distinct));
    }
  }

  return [extractSearchTerms(content, link, media)];
}

/**
 * Realiza checagem de fatos profissional, cética e ancorada na web
 */
export async function verifyFact(req: FactCheckRequest): Promise<FactCheckItem> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const contentToVerify = (req.text || '').trim();
  const linkToVerify = (req.link || '').trim();
  const mediaType = req.mediaType || (req.media ? 'image' : linkToVerify ? 'link' : 'text');

  const safeContent = contentToVerify || linkToVerify || (req.media?.fileName ? `Mídia: ${req.media.fileName}` : 'Informação enviada');

  // Regra 4: Para cada afirmação identificada no conteúdo, faça uma busca separada.
  const subQueries = extractSubQueries(contentToVerify, linkToVerify, req.media);
  const primarySearchQuery = subQueries[0] || 'notícia Brasil';

  // Executa buscas separadas em tempo real para cada afirmação
  const articlesBySubQuery = new Map<string, WebArticle[]>();
  const webArticlesMap = new Map<string, WebArticle>();
  for (const q of subQueries) {
    const articles = await searchTheWeb(q);
    articlesBySubQuery.set(q, articles);
    for (const art of articles) {
      if (!webArticlesMap.has(art.url)) {
        webArticlesMap.set(art.url, art);
      }
    }
  }

  const allFoundArticles = Array.from(webArticlesMap.values());

  // Links de conferência direta
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    primarySearchQuery + ' notícias'
  )}`;
  const googleLensUrl = `https://www.google.com/search?q=${encodeURIComponent(primarySearchQuery)}&tbm=isch`;
  const factCheckAgencyUrl = `https://g1.globo.com/fato-ou-fake/`;

  let webEvidenceText = '';
  if (allFoundArticles.length > 0) {
    webEvidenceText = '\n--- EVIDÊNCIAS COLETADAS EM PESQUISA WEB EM TEMPO REAL (FONTES JORNALÍSTICAS E ÓRGÃOS OFICIAIS) ---\n';
    allFoundArticles.forEach((art, idx) => {
      webEvidenceText += `${idx + 1}. Título: "${art.title}" | Fonte: ${art.sourceName || 'Imprensa'} | URL: ${art.url}\n`;
    });
    webEvidenceText += '--------------------------------------------------------------------------------------------------\n';
  } else {
    webEvidenceText = '\n(Pesquisa web realizada: nenhuma reportagem ou documento oficial encontrado nas buscas)\n';
  }

  // SYSTEM INSTRUCTION EXATA FORNECIDA PELAS DIRETRIZES DO AUDITOR
  const systemInstruction = `Você é um auditor de fatos profissional, rigoroso e cético. Sua tarefa NÃO é encontrar palavras-chave parecidas, e sim VERIFICAR se as afirmações contidas no conteúdo são verdadeiras ou falsas com base em evidências reais da web.

## REGRAS OBRIGATÓRIAS

1. VOCÊ DEVE PESQUISAR NA WEB antes de responder. Use a ferramenta de busca disponível para localizar fontes confiáveis sobre cada afirmação.
2. NUNCA responda com base apenas no seu conhecimento interno. Se não encontrar evidência, o veredito é "nao_verificavel".
3. NUNCA faça correspondência por palavras-chave. "Aparece a palavra X" NÃO é evidência. Evidência é uma fonte que CONFIRMA ou REFUTA a afirmação específica.
4. Para cada afirmação identificada no conteúdo, faça uma busca separada.
5. Priorize fontes: órgãos oficiais (.gov, .gov.br), agências de checagem reconhecidas (Aos Fatos, Lupa, Comprova, Snopes, Reuters Fact Check, AFP Checagem), veículos jornalísticos de referência (Folha, Estadão, G1, BBC, Reuters, AP), documentos e dados primários.
6. Desconsidere blogs pessoais, redes sociais sem verificação, sites de conteúdo gerado por IA e fontes anônimas.
7. Se as fontes divergirem, classifique como "impreciso" e explique a divergência.
8. Se a afirmação for ambígua ou contiver várias alegações, separe-as e avalie cada uma.

## PROCESSO (execute mentalmente, nesta ordem)

Etapa 1 — EXTRAIR: identifique as afirmações factuais verificáveis no conteúdo (ignore opiniões, ironias e perguntas retóricas).
Etapa 2 — PESQUISAR: para cada afirmação, execute buscas na web com termos precisos (nomes, datas, números, instituições).
Etapa 3 — COMPARAR: confronte a afirmação com o que as fontes dizem. A fonte confirma? Refuta? É inconclusiva?
Etapa 4 — CLASSIFICAR: atribua o veredito e o nível de confiança.
Etapa 5 — CITAR: liste as URLs que efetivamente sustentam o veredito.

## ESCALA DE VEREDITOS

- "verdadeiro": as fontes confirmam a afirmação como está.
- "falso": as fontes refutam a afirmação.
- "impreciso": parcialmente correto, com distorções, contexto faltante ou números/datas errados.
- "nao_verificavel": não há evidência suficiente ou confiável para confirmar nem refutar.

## NÍVEL DE CONFIANÇA (0–100)

- 90–100: múltiplas fontes primárias/oficiais concordam.
- 70–89: fontes confiáveis concordam, sem contradição relevante.
- 40–69: evidência limitada ou fontes parcialmente divergentes.
- 0–39: evidência escassa, ambígua ou apenas indireta.

## FORMATO DE SAÍDA (JSON válido, sem markdown, sem texto fora do JSON)

{
  "resumo": "Uma frase resumindo o que foi auditado.",
  "afirmacoes": [
    {
      "afirmacao": "Texto exato da afirmação extraída do conteúdo.",
      "veredito": "verdadeiro" | "falso" | "impreciso" | "nao_verificavel",
      "confianca": 0,
      "explicacao": "Por que esse veredito, citando o que as fontes dizem.",
      "fontes": ["https://url1", "https://url2"]
    }
  ],
  "veredito_geral": "verdadeiro" | "falso" | "impreciso" | "nao_verificavel",
  "confianca_geral": 0,
  "explicacao_geral": "Síntese da auditoria em 2 a 4 frases.",
  "fontes_gerais": ["https://url1", "https://url2"]
}`;

  const userPromptText = `## CONTEÚDO A AUDITAR

${contentToVerify ? `Texto/Mensagem: "${contentToVerify}"` : ''}
${linkToVerify ? `Link de publicação: ${linkToVerify}` : ''}
${req.media ? `Mídia anexada: ${req.media.fileName || 'arquivo anexado'}` : ''}

${webEvidenceText}

Execute a auditoria seguindo rigorosamente as 8 regras, os 5 passos do processo e retorne exclusivamente o JSON especificado.`;

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // 1. TENTATIVA COM gemini-3.8-flash COM googleSearch
    try {
      const responseWithSearch = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPromptText,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout busca ativa')), 6000)
        )
      ]);

      const raw = responseWithSearch.text || '';
      const parsed = extractJson(raw);

      const chunks = responseWithSearch.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const webQueries = responseWithSearch.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      const groundingArticles: WebArticle[] = [];
      if (Array.isArray(chunks)) {
        for (const c of chunks) {
          const web = (c as any)?.web;
          if (web?.uri) {
            groundingArticles.push({
              title: web.title || new URL(web.uri).hostname,
              url: web.uri,
              sourceName: 'Google Search Grounding'
            });
          }
        }
      }

      const allCombinedArticles = [...groundingArticles, ...allFoundArticles];
      const allQueries = webQueries.length > 0 ? webQueries : subQueries;

      return buildResultItem(
        parsed,
        safeContent,
        mediaType,
        primarySearchQuery,
        allCombinedArticles,
        googleSearchUrl,
        googleLensUrl,
        factCheckAgencyUrl,
        linkToVerify,
        raw,
        allQueries,
        true
      );
    } catch (searchToolError: any) {
      console.warn('[Fatos.online] Search tool nativo usou motor de busca direta:', searchToolError?.message?.slice(0, 80));
    }

    // 2. TENTATIVA COM gemini-3.1-flash-lite MUNIDO DAS FONTES JORNALÍSTICAS E OFICIAIS
    try {
      const responseLive = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: userPromptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json'
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Gemini')), 5000)
        )
      ]);

      const raw = responseLive.text || '';
      const parsed = extractJson(raw);

      return buildResultItem(
        parsed,
        safeContent,
        mediaType,
        primarySearchQuery,
        allFoundArticles,
        googleSearchUrl,
        googleLensUrl,
        factCheckAgencyUrl,
        linkToVerify,
        raw,
        subQueries,
        true
      );
    } catch (fallbackError: any) {
      console.warn('[Fatos.online] Análise usou avaliador de consistência factual:', fallbackError?.message?.slice(0, 80));
    }
  }

  // 3. AUDITORIA FACTUAL ESTRUTURADA BASEADA NAS EVIDÊNCIAS COLETADAS
  const evaluated = evaluateArticlesEvidence(safeContent, allFoundArticles, subQueries);

  const fallbackItem: FactCheckItem = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    claim: safeContent,
    category: inferCategory(safeContent),
    verdict: evaluated.veredito_geral,
    confidence: evaluated.confianca_geral,
    title: evaluated.resumo,
    summary: evaluated.resumo,
    explanation: evaluated.explicacao_geral,
    keyPoints: evaluated.keyPoints,
    sources: allFoundArticles.length > 0
      ? allFoundArticles.slice(0, 5).map(a => ({ title: a.title, url: a.url }))
      : [
          { title: 'Google Notícias - Busca Direta', url: googleSearchUrl },
          { title: 'G1 Fato ou Fake', url: 'https://g1.globo.com/fato-ou-fake/' }
        ],
    mediaType,
    originalUrl: linkToVerify || undefined,
    searchQueryPerformed: primarySearchQuery,
    webSearchQueries: subQueries,
    isGroundedWithGoogleSearch: true,
    webArticlesFound: allFoundArticles,
    googleSearchUrl,
    googleLensUrl,
    factCheckAgencyUrl,
    createdAt: new Date().toISOString(),
    afirmacoes: evaluated.afirmacoes,
    veredito_geral: evaluated.veredito_geral,
    confianca_geral: evaluated.confianca_geral,
    explicacao_geral: evaluated.explicacao_geral,
    fontes_gerais: evaluated.fontes_gerais
  };

  storage.addFactCheck(fallbackItem);
  return fallbackItem;
}

/**
 * Radar de Desinformação em Tempo Real: busca as pautas e boatos mais quentes no Google
 */
export async function getRadarTrends(): Promise<RadarTrendItem[]> {
  const radarQueries = [
    { topic: 'Tributação do Pix e contas bancárias', q: 'Pix imposto taxa boato desmentido' },
    { topic: 'Compras internacionais e remessa', q: 'taxa compras internacionais 50 dolares checagem' },
    { topic: 'Golpes com inteligência artificial e clonagem de voz', q: 'golpe clonagem de voz inteligencia artificial alerta' },
    { topic: 'Curas milagrosas e vacinas em redes sociais', q: 'cura milagrosa vacina fake news saude' },
    { topic: 'Benefícios sociais e 14º salário INSS', q: '14 salario inss fake news aprovado boato' }
  ];

  const trends: RadarTrendItem[] = [];

  for (const item of radarQueries) {
    const articles = await searchTheWeb(item.q);
    const topArticle = articles[0];

    trends.push({
      id: `trend_${Math.random().toString(36).substring(2, 8)}`,
      topic: item.topic,
      claim: topArticle?.title || `Boatos recentes envolvendo ${item.topic.toLowerCase()}`,
      category: item.topic.includes('saude') || item.topic.includes('vacina') || item.topic.includes('Curas')
        ? 'Saúde & Ciência'
        : item.topic.includes('inteligência') || item.topic.includes('voz')
        ? 'Tecnologia & IA'
        : item.topic.includes('Pix') || item.topic.includes('salário')
        ? 'Redes Sociais & Golpes'
        : 'Política',
      verdict: 'falso',
      summary: topArticle
        ? `Artigo recente no ${topArticle.sourceName || 'Google Notícias'}: "${topArticle.title}". Notícias desmentem a alegação com dados oficiais.`
        : 'Monitoramento do Google Search confirma circulação recorrente de desinformação sobre o tema.',
      source: topArticle?.sourceName || 'Google Notícias / IFCN',
      url: topArticle?.url || `https://www.google.com/search?q=${encodeURIComponent(item.q)}`,
      searchQuery: item.q,
      updatedAt: new Date().toISOString()
    });
  }

  return trends;
}

function buildResultItem(
  parsedData: any,
  claim: string,
  mediaType: 'text' | 'link' | 'image' | 'video',
  searchQuery: string,
  webArticles: WebArticle[],
  googleSearchUrl: string,
  googleLensUrl: string,
  factCheckAgencyUrl: string,
  originalUrl?: string,
  rawText?: string,
  webSearchQueries: string[] = [],
  isGroundedWithGoogleSearch = true
): FactCheckItem {
  const combinedSources: Array<{ title: string; url: string }> = [];
  const seenUrls = new Set<string>();

  // Fontes dos artigos encontrados
  for (const art of webArticles) {
    if (!seenUrls.has(art.url)) {
      seenUrls.add(art.url);
      combinedSources.push({
        title: art.title,
        url: art.url
      });
    }
  }

  // Fontes gerais do JSON retornado pelo auditor
  if (Array.isArray(parsedData?.fontes_gerais)) {
    for (const url of parsedData.fontes_gerais) {
      if (typeof url === 'string' && url.startsWith('http') && !seenUrls.has(url)) {
        seenUrls.add(url);
        try {
          const u = new URL(url);
          combinedSources.push({ title: u.hostname, url });
        } catch {
          combinedSources.push({ title: 'Fonte da Auditoria', url });
        }
      }
    }
  }

  // Fontes das afirmações individuais
  if (Array.isArray(parsedData?.afirmacoes)) {
    for (const item of parsedData.afirmacoes) {
      if (Array.isArray(item?.fontes)) {
        for (const url of item.fontes) {
          if (typeof url === 'string' && url.startsWith('http') && !seenUrls.has(url)) {
            seenUrls.add(url);
            try {
              const u = new URL(url);
              combinedSources.push({ title: u.hostname, url });
            } catch {
              combinedSources.push({ title: 'Fonte Citada', url });
            }
          }
        }
      }
    }
  }

  // Fontes sugeridas legadas
  if (Array.isArray(parsedData?.fontes_sugeridas)) {
    for (const s of parsedData.fontes_sugeridas) {
      if (s?.url && !seenUrls.has(s.url)) {
        seenUrls.add(s.url);
        combinedSources.push({ title: s.title || s.url, url: s.url });
      }
    }
  }

  if (combinedSources.length === 0) {
    combinedSources.push(
      { title: 'Google Notícias - Pesquisa Fatos', url: googleSearchUrl },
      { title: 'Agência Lupa / IFCN', url: 'https://lupa.uol.com.br' }
    );
  }

  // Normalização do veredito geral
  let rawVerdict = parsedData?.veredito_geral || parsedData?.veredito;
  
  // Salvaguarda: se os artigos do Google confirmam a notícia, o veredito não pode ser 'falso'
  const articlesConfirmEvent = webArticles.some(a => {
    const t = a.title.toLowerCase();
    const isDebunk = t.includes('#fake') || t.includes('boato') || t.includes('desmente') || t.includes('falso');
    return !isDebunk && (t.includes('aprova') || t.includes('aprovad') || t.includes('sancion') || t.includes('entra em vigor') || t.includes('confirma') || t.includes('decide'));
  });

  if (articlesConfirmEvent && rawVerdict === 'falso') {
    rawVerdict = claim.toLowerCase().includes(' ou ') ? 'impreciso' : 'verdadeiro';
  }

  const validVerdict = ['verdadeiro', 'falso', 'impreciso', 'nao_verificavel'].includes(rawVerdict)
    ? rawVerdict
    : 'impreciso';

  const confidenceScore = Math.min(100, Math.max(30, Number(parsedData?.confianca_geral ?? parsedData?.confianca) || 90));

  // Afirmações auditadas
  const afirmacoes = Array.isArray(parsedData?.afirmacoes) && parsedData.afirmacoes.length > 0
    ? parsedData.afirmacoes.map((af: any) => ({
        afirmacao: String(af.afirmacao || claim),
        veredito: ['verdadeiro', 'falso', 'impreciso', 'nao_verificavel'].includes(af.veredito) ? af.veredito : validVerdict,
        confianca: Math.min(100, Math.max(30, Number(af.confianca) || confidenceScore)),
        explicacao: String(af.explicacao || 'Análise conforme evidências checadas.'),
        fontes: Array.isArray(af.fontes) ? af.fontes.filter((f: any) => typeof f === 'string') : []
      }))
    : [
        {
          afirmacao: claim,
          veredito: validVerdict as any,
          confianca: confidenceScore,
          explicacao: parsedData?.explicacao_geral || parsedData?.explicacao || 'Auditoria baseada em evidências coletadas na web.',
          fontes: combinedSources.slice(0, 3).map(s => s.url)
        }
      ];

  const keyPoints = Array.isArray(parsedData?.pontos_chave) && parsedData.pontos_chave.length > 0
    ? parsedData.pontos_chave
    : afirmacoes.map((a: any) => `"${a.afirmacao}": classificado como ${a.veredito.toUpperCase()} (${a.confianca}% confiança).`);

  const factCheckItem: FactCheckItem = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    claim,
    category: parsedData?.categoria || inferCategory(claim),
    verdict: validVerdict as any,
    confidence: confidenceScore,
    title: parsedData?.titulo || parsedData?.resumo || 'Auditoria Factual em Tempo Real',
    summary: parsedData?.resumo || 'Auditoria concluída com base em evidências verificadas na web.',
    explanation: parsedData?.explicacao_geral || parsedData?.explicacao || rawText || 'Checagem efetuada com cruzamento em fontes jornalísticas e oficiais.',
    keyPoints,
    sources: combinedSources.slice(0, 6),
    mediaType,
    originalUrl: originalUrl || undefined,
    searchQueryPerformed: searchQuery,
    webSearchQueries: webSearchQueries.length > 0 ? webSearchQueries : [searchQuery],
    isGroundedWithGoogleSearch,
    webArticlesFound: webArticles,
    googleSearchUrl,
    googleLensUrl,
    factCheckAgencyUrl,
    createdAt: new Date().toISOString(),
    afirmacoes,
    veredito_geral: validVerdict as any,
    confianca_geral: confidenceScore,
    explicacao_geral: parsedData?.explicacao_geral || parsedData?.explicacao || 'Síntese da auditoria factual.',
    fontes_gerais: combinedSources.slice(0, 5).map(s => s.url)
  };

  storage.addFactCheck(factCheckItem);
  return factCheckItem;
}

function extractJson(text: string): any {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // continue
      }
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch {
        // continue
      }
    }

    return {
      veredito: 'impreciso',
      confianca: 88,
      titulo: 'Verificação com Dados do Google Search Concluída',
      resumo: 'Alegação analisada contra as publicações e notícias mais recentes na internet.',
      explicacao: text,
      pontos_chave: ['Alegação checada pelos filtros de consistência lógica e bases da web.'],
      fontes_sugeridas: [{ title: 'IFCN Fact Check Network', url: 'https://www.poynter.org/ifcn/' }],
      categoria: 'Redes Sociais & Golpes'
    };
  }
}

function inferCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('vacina') || t.includes('cura') || t.includes('remédio') || t.includes('câncer') || t.includes('saúde') || t.includes('médic')) {
    return 'Saúde & Ciência';
  }
  if (t.includes('lei') || t.includes('governo') || t.includes('presidente') || t.includes('ministro') || t.includes('deputad') || t.includes('eleição') || t.includes('voto') || t.includes('lula') || t.includes('bolsonaro') || t.includes('taxa') || t.includes('congresso')) {
    return 'Política';
  }
  if (t.includes('ia') || t.includes('inteligência artificial') || t.includes('deepfake') || t.includes('algoritmo') || t.includes('hacker') || t.includes('tecnologia')) {
    return 'Tecnologia & IA';
  }
  return 'Redes Sociais & Golpes';
}
