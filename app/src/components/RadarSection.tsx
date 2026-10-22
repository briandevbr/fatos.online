import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, ExternalLink, Search, Sparkles, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RadarTrendItem } from '../types';

interface RadarSectionProps {
  onSelectClaim: (claim: string) => void;
}

export const RadarSection: React.FC<RadarSectionProps> = ({ onSelectClaim }) => {
  const [trends, setTrends] = useState<RadarTrendItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTrends = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/radar-trends');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setTrends(json.data);
          setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar radar:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <section className="py-12 bg-white dark:bg-[#071329] border-y border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Google Search Grounding badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Radar de Boatos no Google Search
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Google Search Grounding
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Varredura contínua de desinformações e tópicos com pico de buscas no Google
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Atualizado às {lastUpdated}
              </span>
            )}
            <button
              type="button"
              onClick={fetchTrends}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Atualizar via Google Search</span>
            </button>
          </div>
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.length > 0 ? (
            trends.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-700 dark:hover:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="h-3 w-3" />
                      Desmentido
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                    {item.topic}
                  </h4>

                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Search className="h-3 w-3 text-blue-500" />
                    <span className="truncate">Busca Google: <strong>"{item.searchQuery}"</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <span>{item.source}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectClaim(item.topic)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
                  >
                    <span>Auditar</span>
                    <Search className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              {isRefreshing ? 'Consultando o Google Search em tempo real...' : 'Nenhum alerta recente no radar.'}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
