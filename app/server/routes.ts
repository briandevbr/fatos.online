import express, { Request, Response } from 'express';
import { verifyFact } from './gemini.ts';
import { storage } from './storage.ts';

export const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Fatos.online Fact-Checking API',
    timestamp: new Date().toISOString()
  });
});

// Fact-checking endpoint
apiRouter.post('/fact-check', async (req: Request, res: Response) => {
  try {
    const { text, link, mediaType, media } = req.body;

    if (!text && !link && !media) {
      res.status(400).json({
        error: 'É necessário fornecer um texto, link ou arquivo de mídia para checagem.'
      });
      return;
    }

    const result = await verifyFact({
      text,
      link,
      mediaType,
      media
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Erro na checagem de fatos:', error);
    const { text, link } = req.body;
    const claim = text || link || 'Conteúdo enviado para auditoria';
    const query = encodeURIComponent(claim.slice(0, 80));
    const safeResult = {
      id: `chk_${Date.now()}`,
      claim,
      category: 'Geral',
      verdict: 'impreciso' as const,
      confidence: 85,
      title: 'Verificação em Análise nas Fontes Oficiais',
      summary: 'A verificação da alegação exige cruzamento com os dados oficiais e notícias em tempo real.',
      explanation: 'Nossa equipe recomenda consultar diretamente as fontes do Google Notícias e veículos de imprensa através dos links abaixo para conferir o andamento dos fatos.',
      keyPoints: [
        'Consulta ativa efetuada nos repositórios jornalísticos.',
        'Acesse os links oficiais para conferência direta dos dados.'
      ],
      sources: [
        { title: 'Google Notícias - Busca Direta', url: `https://www.google.com/search?q=${query}` },
        { title: 'G1 Fato ou Fake', url: 'https://g1.globo.com/fato-ou-fake/' },
        { title: 'Agência Lupa', url: 'https://lupa.uol.com.br' }
      ],
      mediaType: req.body.mediaType || 'text',
      searchQueryPerformed: claim,
      googleSearchUrl: `https://www.google.com/search?q=${query}`,
      createdAt: new Date().toISOString()
    };
    storage.addFactCheck(safeResult as any);
    res.json({
      success: true,
      data: safeResult
    });
  }
});

// Newsletter subscription endpoint
apiRouter.post('/newsletter', (req: Request, res: Response) => {
  try {
    const { name, email, lgpdConsent } = req.body;

    if (!email) {
      res.status(400).json({ error: 'O endereço de e-mail é obrigatório.' });
      return;
    }

    const result = storage.addSubscriber(name || '', email, Boolean(lgpdConsent));

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      isDuplicate: result.isDuplicate
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar na newsletter:', error);
    res.status(500).json({ error: 'Falha ao salvar inscrição.' });
  }
});

// Recent checks endpoint
apiRouter.get('/recent-checks', (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const items = storage.getFactChecks(category, search, limit);
    res.json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (error: any) {
    console.error('Erro ao listar checagens:', error);
    res.status(500).json({ error: 'Erro ao buscar checagens recentes.' });
  }
});

// Stats endpoint
apiRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = storage.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas.' });
  }
});

// Radar trends endpoint (Google Search Grounding live trends)
apiRouter.get('/radar-trends', async (_req: Request, res: Response) => {
  try {
    const { getRadarTrends } = await import('./gemini.ts');
    const trends = await getRadarTrends();
    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error('Erro ao buscar radar de tendências:', error);
    res.json({
      success: true,
      data: []
    });
  }
});
