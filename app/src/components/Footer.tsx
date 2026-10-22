import React from 'react';
import { ShieldCheck, Search, Heart, Shield, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = 2026;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 transition-colors dark:border-slate-800 dark:bg-[#071329] dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#071329]">
                  <Search className="h-2 w-2 text-white stroke-[2.5]" />
                </div>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Fatos<span className="text-blue-600 dark:text-blue-400">.online</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Plataforma independente de jornalismo digital e checagem de fatos. Nosso compromisso é com a verdade factual, a promoção da cidadania informada e o combate irrestrito à desinformação.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 text-blue-500" />
              <span>Conformidade com a Lei Geral de Proteção de Dados (LGPD)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('inicio')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('checar-fato')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Checar Conteúdo
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('recentes')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Verificações Recentes
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('sobre')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Metodologia & Critérios
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Editorias
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('recentes')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Política & Eleições
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('recentes')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Saúde, Ciência & Vacinas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('recentes')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Tecnologia, IA & Deepfakes
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('recentes')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Golpes Virtuais & WhatsApp
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="cursor-default">Código de Ética IFCN</span>
              </li>
              <li>
                <span className="cursor-default">Política de Correções</span>
              </li>
              <li>
                <span className="cursor-default">Aviso de Privacidade LGPD</span>
              </li>
              <li>
                <span className="cursor-default">Transparência de Financiamento</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {currentYear} Equipe acadêmica Fatos.online · Código sob licença Apache-2.0. Feito com rigor investigativo e tecnologia.
          </p>

          <div className="flex items-center gap-4">
            <span>Privacidade garantida</span>
            <span>·</span>
            <span>Versão 2.4</span>
            <span>·</span>
            <span>Base IFCN</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
