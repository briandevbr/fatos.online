export type VerdictType = 'verdadeiro' | 'falso' | 'impreciso' | 'nao_verificavel';

export interface ClaimAuditItem {
  afirmacao: string;
  veredito: VerdictType;
  confianca: number;
  explicacao: string;
  fontes: string[];
}

export interface FactCheckSource {
  title: string;
  url: string;
}

export interface FactCheckItem {
  id: string;
  claim: string;
  category: string;
  verdict: VerdictType;
  confidence: number;
  title?: string;
  summary: string;
  explanation: string;
  keyPoints?: string[];
  sources: FactCheckSource[];
  mediaType: 'text' | 'link' | 'image' | 'video';
  originalUrl?: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
  searchQueryPerformed?: string;
  webSearchQueries?: string[];
  isGroundedWithGoogleSearch?: boolean;
  webArticlesFound?: Array<{ title: string; url: string; pubDate?: string; sourceName?: string }>;
  googleSearchUrl?: string;
  googleLensUrl?: string;
  factCheckAgencyUrl?: string;
  createdAt: string;
  afirmacoes?: ClaimAuditItem[];
  veredito_geral?: VerdictType;
  confianca_geral?: number;
  explicacao_geral?: string;
  fontes_gerais?: string[];
}

export interface RadarTrendItem {
  id: string;
  topic: string;
  claim: string;
  category: string;
  verdict: VerdictType;
  summary: string;
  source: string;
  url: string;
  searchQuery: string;
  updatedAt: string;
}

export interface StatsData {
  totalChecks: number;
  falsitiesDetected: number;
  verifiedAccuracy: number;
  subscribersCount: number;
  categories: Array<{ name: string; count: number }>;
}
