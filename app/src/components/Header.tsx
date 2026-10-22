import React, { useState } from 'react';
import { ShieldCheck, Search, Moon, Sun, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80 dark:bg-[#0A1F44]/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('inicio');
          }}
          className="group flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-[#0A1F44] text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            {/* Custom Shield + Magnifier Emblem */}
            <ShieldCheck className="h-6 w-6 text-white stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0A1F44]">
              <Search className="h-2.5 w-2.5 text-white stroke-[2.5]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                Fatos<span className="text-blue-600 dark:text-blue-400">.online</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Checagem & Verdade Digital
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => scrollTo('inicio')}
            className="transition-colors hover:text-blue-600 dark:hover:text-white cursor-pointer"
          >
            Início
          </button>
          <button
            onClick={() => scrollTo('checar-fato')}
            className="transition-colors hover:text-blue-600 dark:hover:text-white cursor-pointer"
          >
            Checar Fato
          </button>
          <button
            onClick={() => scrollTo('recentes')}
            className="transition-colors hover:text-blue-600 dark:hover:text-white cursor-pointer"
          >
            Verificações Recentes
          </button>
          <button
            onClick={() => scrollTo('sobre')}
            className="transition-colors hover:text-blue-600 dark:hover:text-white cursor-pointer"
          >
            Metodologia & Sobre
          </button>
        </nav>

        {/* Actions (Theme Toggle + CTA) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-amber-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={() => scrollTo('checar-fato')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-700 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
          >
            Checar Agora
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-5 shadow-lg dark:border-slate-800 dark:bg-[#0A1F44] md:hidden">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => scrollTo('inicio')}
              className="text-left text-base font-medium text-slate-800 dark:text-slate-200 py-1.5"
            >
              Início
            </button>
            <button
              onClick={() => scrollTo('checar-fato')}
              className="text-left text-base font-medium text-slate-800 dark:text-slate-200 py-1.5"
            >
              Checar Fato
            </button>
            <button
              onClick={() => scrollTo('recentes')}
              className="text-left text-base font-medium text-slate-800 dark:text-slate-200 py-1.5"
            >
              Verificações Recentes
            </button>
            <button
              onClick={() => scrollTo('sobre')}
              className="text-left text-base font-medium text-slate-800 dark:text-slate-200 py-1.5"
            >
              Metodologia & Sobre
            </button>
            <button
              onClick={() => scrollTo('checar-fato')}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center font-semibold text-white shadow"
            >
              Checar Agora
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
