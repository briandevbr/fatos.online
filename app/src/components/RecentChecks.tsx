import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, ExternalLink, X, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Share2, Globe } from 'lucide-react';
import { FactCheckItem, VerdictType } from '../types';

interface RecentChecksProps {
  checks: FactCheckItem[];
  onSelectClaim: (claim: string) => void;
}

export const RecentChecks: React.FC<RecentChecksProps> = ({ checks, onSelectClaim }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [activeModalItem, setActiveModalItem] = useState<FactCheckItem | null>(null);

  const categories = [
    'Todas',
    'Política',
    'Saúde & Ciência',
    'Tecnologia & IA',
    'Redes Sociais & Golpes'
  ];

  const filteredChecks = useMemo(() => {
    return checks.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Todas' ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.claim.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [checks, selectedCategory, searchQuery]);

  const visibleItems = filteredChecks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChecks.length;

  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'verdadeiro':
        return {
          label: 'VERDADEIRO',
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          classes: 'bg-emerald-600 text-white'
        };
      case 'falso':
        return {
          label: 'FALSO',
          icon: <XCircle className="h-3.5 w-3.5" />,
          classes: 'bg-rose-600 text-white'
        };
      case 'impreciso':
        return {
          label: 'IMPRECISO',
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          classes: 'bg-amber-500 text-white'
        };
      case 'nao_verificavel':
      default:
        return {
          label: 'NÃO VERIFICÁVEL',
          icon: <HelpCircle className="h-3.5 w-3.5" />,
          classes: 'bg-indigo-600 text-white'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Recente';
    }
  };

  return (
    <section id="recentes" className="py-20 bg-white dark:bg-[#060D1A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <span>Catálogo Editorial de Desmentidos</span>
            </div>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Verificações Recentes
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
              Consulte as investigações apuradas com dados oficiais de órgãos públicos e pesquisas checadas.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              placeholder="Buscar por termo ou boato..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(6);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid of Cards */}
        {visibleItems.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleItems.map((item) => {
              const badge = getVerdictBadge(item.verdict);
              const fallbackImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80';

              return (
                <article
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-[#0A1F44] cursor-pointer"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.thumbnailUrl || fallbackImg}
                      alt={item.title || item.claim}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm shadow-black/20"
                         style={{ backgroundColor: badge.classes.includes('rose') ? '#EF4444' : badge.classes.includes('emerald') ? '#10B981' : badge.classes.includes('amber') ? '#F59E0B' : '#6366F1', color: 'white' }}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {item.confidence}% confiança
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Quiet Metadata with Typographic Separator */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <h3 className="mt-2.5 font-serif text-lg font-bold text-slate-900 line-clamp-2 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {item.title || item.claim}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed flex-1">
                      {item.summary}
                    </p>

                    {/* Footer link in card */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>Ler investigação completa</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <ShieldAlert className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
              Nenhuma checagem encontrada
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tente buscar por outros termos ou envie esse conteúdo para que nossa IA apure agora mesmo.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Todas');
                setSearchQuery('');
              }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <span>Carregar mais checagens</span>
              <span className="text-xs text-slate-500">
                ({filteredChecks.length - visibleCount} restantes)
              </span>
            </button>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-[#0A1F44]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              aria-label="Fechar detalhes"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {activeModalItem.category}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDate(activeModalItem.createdAt)}
                </span>
              </div>

              {/* Verdict header */}
              {(() => {
                const b = getVerdictBadge(activeModalItem.verdict);
                return (
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-extrabold ${b.classes}`}>
                      {b.icon}
                      {b.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {activeModalItem.confidence}% de certeza apurada
                    </span>
                  </div>
                );
              })()}

              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                {activeModalItem.title || activeModalItem.claim}
              </h3>

              <div className="rounded-xl bg-slate-100 p-4 text-xs sm:text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <strong>Alegação investigada:</strong> "{activeModalItem.claim}"
              </div>

              <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {activeModalItem.explanation}
              </div>

              {activeModalItem.keyPoints && activeModalItem.keyPoints.length > 0 && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Principais fatos apurados:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {activeModalItem.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Afirmações Auditadas se disponíveis */}
              {activeModalItem.afirmacoes && activeModalItem.afirmacoes.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Afirmações Auditadas Individualmente:
                  </h4>
                  <div className="space-y-2.5">
                    {activeModalItem.afirmacoes.map((item, idx) => {
                      const badge = getVerdictBadge(item.veredito);
                      return (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 text-xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${badge.classes}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Certeza: {item.confianca}%
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            "{item.afirmacao}"
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                            {item.explicacao}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Internet search evidence if available */}
              {activeModalItem.searchQueryPerformed && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs dark:border-blue-900/60 dark:bg-blue-950/40">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Pesquisa Ativa na Internet Realizada</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">
                    Termo investigado: <strong>"{activeModalItem.searchQueryPerformed}"</strong>
                  </p>
                  {activeModalItem.googleSearchUrl && (
                    <a
                      href={activeModalItem.googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <span>Abrir resultados no Google Notícias</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Sources */}
              {activeModalItem.sources && activeModalItem.sources.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Fontes oficiais consultadas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalItem.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelectClaim(activeModalItem.claim);
                    setActiveModalItem(null);
                    const el = document.getElementById('checar-fato');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 cursor-pointer"
                >
                  Checar alegação similar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = `[Fatos.online] Checagem: ${activeModalItem.title || activeModalItem.claim}\nVeredito: ${activeModalItem.verdict.toUpperCase()}\n${activeModalItem.summary}`;
                    if (navigator.share) {
                      navigator.share({ title: activeModalItem.title, text, url: window.location.href }).catch(() => {});
                    } else {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + window.location.href)}`, '_blank');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Compartilhar</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
