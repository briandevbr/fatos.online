import React, { useState } from 'react';
import {
  FileText,
  Link2,
  Image as ImageIcon,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  Globe,
  Search,
  Camera,
  Newspaper
} from 'lucide-react';
import { FactCheckItem, VerdictType } from '../types';
import { MediaUploader, UploadedMedia } from './MediaUploader';

interface FactCheckerProps {
  initialClaimText?: string;
  onCheckCompleted: (newItem: FactCheckItem) => void;
}

export const FactChecker: React.FC<FactCheckerProps> = ({
  initialClaimText = '',
  onCheckCompleted
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'link' | 'media'>('text');
  const [textContent, setTextContent] = useState(initialClaimText);
  const [linkContent, setLinkContent] = useState('');
  const [mediaFile, setMediaFile] = useState<UploadedMedia | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<FactCheckItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial claim if passed from hero samples
  React.useEffect(() => {
    if (initialClaimText) {
      setTextContent(initialClaimText);
      setActiveTab('text');
    }
  }, [initialClaimText]);

  const loadingSteps = [
    '🌐 Pesquisando a mensagem ou imagem na internet...',
    '📰 Buscando correspondências no Google Notícias, G1 Fato ou Fake e agências...',
    '🖼️ Consultando repositórios de imagem reversa e redes sociais...',
    '⚖️ Sintetizando os fatos encontrados na web e calculando o veredito...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const hasText = textContent.trim().length > 0;
    const hasLink = linkContent.trim().length > 0;
    const hasMedia = mediaFile !== null;

    if (!hasText && !hasLink && !hasMedia) {
      setErrorMessage('Por favor, informe um texto, um link de rede social ou anexe uma imagem/vídeo para checagem.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const payload: any = {
        mediaType: activeTab,
        text: textContent.trim(),
        link: linkContent.trim()
      };

      if (mediaFile) {
        payload.media = {
          mimeType: mediaFile.mimeType,
          base64: mediaFile.base64,
          fileName: mediaFile.fileName
        };
      }

      const res = await fetch('/api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Falha ao processar verificação.');
      }

      if (json.data) {
        // Preserva a preview de mídia se o usuário tiver enviado imagem
        if (mediaFile && !json.data.thumbnailUrl) {
          json.data.thumbnailUrl = mediaFile.previewUrl;
        }
        setResult(json.data);
        onCheckCompleted(json.data);
      } else {
        throw new Error('Resposta sem dados de veredito.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado na análise. Tente novamente.');
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTextContent('');
    setLinkContent('');
    setMediaFile(null);
    setErrorMessage(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `[Fatos.online - Checagem]\nVeredito: ${result.verdict.toUpperCase()}\nConfiança: ${result.confidence}%\n\nAlegação: ${result.claim}\n\nResumo: ${result.summary}\n\nFontes e checagem completa: https://fatos.online`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (!result) return;
    const shareTitle = `Checagem: ${result.title || result.claim}`;
    const shareText = `[Fatos.online] Veredito: ${result.verdict.toUpperCase()} (${result.confidence}% confiança).\n${result.summary}`;
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const getVerdictStyle = (verdict: VerdictType) => {
    switch (verdict) {
      case 'verdadeiro':
        return {
          label: 'VERDADEIRO',
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
          badgeBg: 'bg-emerald-600 text-white',
          text: 'text-emerald-800 dark:text-emerald-200',
          barColor: 'bg-emerald-500'
        };
      case 'falso':
        return {
          label: 'FALSO',
          icon: <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          badgeBg: 'bg-rose-600 text-white',
          text: 'text-rose-800 dark:text-rose-200',
          barColor: 'bg-rose-500'
        };
      case 'impreciso':
        return {
          label: 'IMPRECISO',
          icon: <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          badgeBg: 'bg-amber-500 text-white',
          text: 'text-amber-800 dark:text-amber-200',
          barColor: 'bg-amber-500'
        };
      case 'nao_verificavel':
      default:
        return {
          label: 'NÃO VERIFICÁVEL',
          icon: <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
          bg: 'bg-indigo-50 dark:bg-indigo-950/40',
          border: 'border-indigo-200 dark:border-indigo-800',
          badgeBg: 'bg-indigo-600 text-white',
          text: 'text-indigo-800 dark:text-indigo-200',
          barColor: 'bg-indigo-500'
        };
    }
  };

  return (
    <section id="checar-fato" className="scroll-mt-24 py-16 bg-slate-100/60 dark:bg-[#071329]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Globe className="h-3.5 w-3.5" />
            <span>Busca Ativa na Internet & Inteligência Artificial</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Checagem com Pesquisa na Internet
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
            Envie uma mensagem de texto, link ou imagem: o sistema pesquisa a internet em tempo real por desmentidos no Google Notícias e bases de checagem.
          </p>
        </div>

        {/* Checker Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#0A1F44] dark:shadow-none">
          
          {/* Tabs Navigation */}
          {!result && (
            <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Mensagem / Texto</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'link'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Link2 className="h-4 w-4" />
                <span>Link de Rede Social</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Imagem / Print / Vídeo</span>
              </button>
            </div>
          )}

          {/* Form Content */}
          {!result ? (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {activeTab === 'text' && (
                <div className="flex flex-col gap-3">
                  <label htmlFor="fact-text-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Cole a mensagem, boato ou alegação que você quer pesquisar na internet:
                  </label>
                  <textarea
                    id="fact-text-input"
                    rows={4}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Ex: 'Governo anunciou taxa de 15% sobre o Pix' ou 'Receita caseira com limão cura qualquer câncer'..."
                    className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
              )}

              {activeTab === 'link' && (
                <div className="flex flex-col gap-3">
                  <label htmlFor="fact-link-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Cole o link da publicação (Instagram, X/Twitter, TikTok, Facebook, YouTube ou notícia):
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <input
                      id="fact-link-input"
                      type="url"
                      value={linkContent}
                      onChange={(e) => setLinkContent(e.target.value)}
                      placeholder="https://instagram.com/p/... ou https://x.com/status/..."
                      className="w-full rounded-2xl border border-slate-300 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Envie a imagem, captura de tela ou vídeo para pesquisar na internet:
                  </label>
                  <MediaUploader
                    selectedMedia={mediaFile}
                    onMediaSelected={(media) => setMediaFile(media)}
                  />
                  {mediaFile && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="media-caption" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Contexto ou legenda que acompanha a imagem (opcional):
                      </label>
                      <input
                        id="media-caption"
                        type="text"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Ex: 'Imagem compartilhada no WhatsApp dizendo que foi tirada hoje cedo'..."
                        className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error feedback */}
              {errorMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  <span>Busca ativa em bancos jornalísticos e órgãos oficiais</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Pesquisando na Internet...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Pesquisar e Verificar Fato</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step indicator while loading */}
              {isLoading && (
                <div className="mt-6 rounded-2xl bg-blue-50/80 p-5 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        {loadingSteps[loadingStep]}
                      </p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-500"
                          style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Result Card View */
            <div className="p-6 sm:p-8">
              {(() => {
                const style = getVerdictStyle(result.verdict);

                return (
                  <div className="flex flex-col gap-6">
                    {/* Verdict Banner Header */}
                    <div className={`rounded-2xl border p-5 sm:p-6 ${style.bg} ${style.border}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-900">
                            {style.icon}
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Resultado da Auditoria
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-block rounded-lg px-3 py-1 text-sm font-extrabold tracking-wide ${style.badgeBg}`}>
                                {style.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Categoria: {result.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Gauge */}
                        <div className="flex flex-col sm:items-end">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Grau de Certeza Metodológica
                          </span>
                          <div className="mt-1 flex items-center gap-3">
                            <div className="h-3 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className={`h-full ${style.barColor} transition-all duration-1000`}
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">
                              {result.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE GOOGLE SEARCH GROUNDING EVIDENCE CARD */}
                    <div className="rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/90 p-5 dark:border-blue-800/80 dark:from-blue-950/50 dark:via-slate-900/50 dark:to-blue-950/50 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-200/80 dark:border-blue-900/60">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm">
                            G
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950 dark:text-blue-200">
                              Validação com Google Search Data
                            </h4>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/90 px-3 py-1 text-[11px] font-bold text-blue-800 dark:bg-blue-900/80 dark:text-blue-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Google Search Grounding Ativo</span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex flex-col gap-2.5">
                        {/* Queries performed on Google Search */}
                        {result.webSearchQueries && result.webSearchQueries.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Consultas executadas no Google Search:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.webSearchQueries.map((q, qIdx) => (
                                <span
                                  key={qIdx}
                                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200/90 bg-white/90 px-2.5 py-1 text-xs font-mono font-medium text-blue-900 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-blue-300"
                                >
                                  <Search className="h-3 w-3 text-blue-500" />
                                  <span>{q}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          <strong>Termo apurado:</strong>{' '}
                          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-blue-700 dark:bg-slate-900 dark:text-blue-300">
                            "{result.searchQueryPerformed || result.claim}"
                          </code>
                        </p>

                        {/* Live web articles list if found */}
                        {result.webArticlesFound && result.webArticlesFound.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Notícias e desmentidos encontrados no Google Notícias:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.webArticlesFound.map((art, i) => (
                                <a
                                  key={i}
                                  href={art.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex flex-col justify-between rounded-xl border border-blue-200/80 bg-white p-3 text-xs shadow-sm hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-200 line-clamp-2">
                                      {art.title}
                                    </span>
                                    <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-blue-600" />
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                    <span>{art.sourceName || 'Veículo de Notícia'}</span>
                                    {art.pubDate && <span>{art.pubDate}</span>}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            A pesquisa na internet confirmou que esta alegação não possui comunicados em diários oficiais ou registros jornalísticos legítimos.
                          </p>
                        )}

                        {/* Direct verification action buttons */}
                        <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 flex flex-wrap gap-2">
                          {result.googleSearchUrl && (
                            <a
                              href={result.googleSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm border border-blue-200 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              <Search className="h-3.5 w-3.5" />
                              <span>Ver no Google Notícias</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          {result.googleLensUrl && (
                            <a
                              href={result.googleLensUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm border border-purple-200 hover:bg-purple-50 dark:bg-slate-900 dark:text-purple-300 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              <span>Pesquisa de Imagem no Google</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          <a
                            href="https://g1.globo.com/fato-ou-fake/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm border border-rose-200 hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-300 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            <Newspaper className="h-3.5 w-3.5" />
                            <span>G1 Fato ou Fake</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Investigated Claim & Summary */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Mensagem ou Mídia Analisada:
                        </span>
                        <blockquote className="mt-1 border-l-4 border-slate-300 pl-4 text-sm italic text-slate-700 dark:border-slate-700 dark:text-slate-300">
                          "{result.claim}"
                        </blockquote>
                      </div>

                      {result.title && (
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {result.title}
                        </h3>
                      )}

                      <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-800 dark:bg-slate-900/60 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800">
                        <strong>Resumo do Veredito:</strong> {result.summary}
                      </div>

                      {/* Detailed Journalism Explanation */}
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Análise Factual & Cruzamento na Internet:
                        </h4>
                        <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {result.explanation}
                        </div>
                      </div>

                      {/* Granular Audited Claims Block */}
                      {result.afirmacoes && result.afirmacoes.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Afirmações Auditadas Individualmente</span>
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Cada alegação extraída foi confrontada isoladamente contra fontes oficiais e evidências da web.
                              </p>
                            </div>
                            <span className="self-start sm:self-auto rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/80 dark:text-blue-300">
                              {result.afirmacoes.length} {result.afirmacoes.length === 1 ? 'afirmação analisada' : 'afirmações analisadas'}
                            </span>
                          </div>

                          <div className="space-y-3.5">
                            {result.afirmacoes.map((item, idx) => {
                              const subStyle = getVerdictStyle(item.veredito);
                              return (
                                <div
                                  key={idx}
                                  className={`rounded-xl border p-4 bg-white shadow-2xs dark:bg-slate-900 ${subStyle.border}`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${subStyle.badgeBg}`}>
                                        {subStyle.label}
                                      </span>
                                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Afirmação #{idx + 1}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Certeza:
                                      </span>
                                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                        {item.confianca}%
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    "{item.afirmacao}"
                                  </p>

                                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                    {item.explicacao}
                                  </p>

                                  {item.fontes && item.fontes.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Fontes que sustentam:
                                      </span>
                                      {item.fontes.map((fUrl, fIdx) => {
                                        let host = fUrl;
                                        try {
                                          host = new URL(fUrl).hostname.replace(/^www\./, '');
                                        } catch {}
                                        return (
                                          <a
                                            key={fIdx}
                                            href={fUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400"
                                          >
                                            <span>{host}</span>
                                            <ExternalLink className="h-2.5 w-2.5" />
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Key Points */}
                      {result.keyPoints && result.keyPoints.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Pontos-Chave da Verificação:
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            {result.keyPoints.map((pt, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Consulted Sources */}
                      {result.sources && result.sources.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Fontes e Links Consultados:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400 dark:hover:border-blue-800"
                              >
                                <span>{src.title}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Result Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Nova Checagem</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copiar Resultado</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Compartilhar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
