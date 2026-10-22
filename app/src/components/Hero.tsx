import React from 'react';
import { ShieldCheck, Search, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowDown } from 'lucide-react';
import { StatsData } from '../types';

interface HeroProps {
  stats: StatsData | null;
  onSelectSample: (text: string) => void;
  onScrollToChecker: () => void;
}

export const Hero: React.FC<HeroProps> = ({ stats, onSelectSample, onScrollToChecker }) => {
  const totalChecksFormatted = stats?.totalChecks ? stats.totalChecks.toLocaleString('pt-BR') : '14.820+';
  const falsitiesFormatted = stats?.falsitiesDetected ? stats.falsitiesDetected.toLocaleString('pt-BR') : '9.410+';

  const samples = [
    'Nova lei federal impõe taxa de 15% sobre Pix de pessoas físicas acima de R$ 50',
    'Chá de folha de louro e cravo cura diabetes em 30 dias sem remédios',
    'Criminosos usam clonagem de voz por IA para aplicar golpes do falso sequestro'
  ];

  return (
    <section id="inicio" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Decorative gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl dark:from-blue-600/25 dark:via-blue-900/20"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Mission Kicker */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Jornalismo Investigativo & IA com Busca em Tempo Real</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Combata a desinformação com <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/40 decoration-wavy">fatos verificados</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Nossa redação combina apuração jornalística rigorosa baseada nos princípios da IFCN e tecnologia Gemini de busca ativa para analisar postagens virais, imagens, áudios e declarações públicas em segundos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onScrollToChecker}
                className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/35 active:scale-98 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
              >
                <span>Enviar conteúdo para checagem</span>
                <ArrowDown className="h-4 w-4" />
              </button>

              <a
                href="#recentes"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Explorar últimas checagens
              </a>
            </div>

            {/* Quick Test Samples */}
            <div className="pt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ou teste com alegações em circulação:
              </span>
              <div className="flex flex-wrap gap-2">
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectSample(sample);
                      onScrollToChecker();
                    }}
                    className="text-left text-xs text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="line-clamp-1">{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Shield Visual & Real-time Live Counters */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#0A1F44] dark:shadow-none">
              
              {/* Graphic Shield Emblem Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Central de Monitoramento</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Varredura e auditoria ativa</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Ao Vivo</span>
                </div>
              </div>

              {/* Counter Metrics */}
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verificações</span>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {totalChecksFormatted}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Conteúdos auditados</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span>Falsidades</span>
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                    {falsitiesFormatted}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Boatos desmentidos</p>
                </div>
              </div>

              {/* Methodological Commitments */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span><strong>Fontes Abertas:</strong> Todos os vereditos incluem links públicos para conferência.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span><strong>Código de Princípios IFCN:</strong> Apartidarismo e rigor na apuração.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span><strong>Transparência LGPD:</strong> Segurança e sigilo absoluto no envio de denúncias.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
