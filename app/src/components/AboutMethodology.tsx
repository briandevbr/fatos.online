import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, HelpCircle, BookOpen, Scale, Users, Award } from 'lucide-react';

export const AboutMethodology: React.FC = () => {
  const verdicts = [
    {
      title: 'VERDADEIRO',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      desc: 'A alegação é comprovada por dados oficiais, pesquisas científicas revisadas por pares ou documentação primária indiscutível.'
    },
    {
      title: 'FALSO',
      color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      icon: <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      desc: 'O conteúdo é forjado, inventado, adulterado por montagens/deepfakes ou contraria frontalmente a realidade dos fatos.'
    },
    {
      title: 'IMPRECISO',
      color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
      desc: 'Contém elementos verídicos mas com dados distorcidos, números exagerados ou omissão deliberada de contexto crucial.'
    },
    {
      title: 'NÃO VERIFICÁVEL',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      icon: <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      desc: 'Alegações genéricas, suposições sem evidências tangíveis ou boatos sem qualquer registro passível de checagem documental.'
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-slate-50 dark:bg-[#071329] border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Transparência & Rigor</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nossa Metodologia de Checagem
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Seguimos rigorosamente os padrões globais de checagem da <em>International Fact-Checking Network</em> (IFCN), priorizando dados abertos e imparcialidade.
          </p>
        </div>

        {/* 4 Verdicts Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {verdicts.map((v, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${v.color}`}
            >
              <div className="flex items-center gap-2.5">
                {v.icon}
                <span className="font-extrabold tracking-wide text-sm">{v.title}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 3 Pillars of Journalism */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0A1F44]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 dark:text-white">
              Apartidarismo e Equidade
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Auditamos todas as alegações com o mesmo padrão de exigência, independentemente do espectro político ou da notoriedade de quem as declarou.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0A1F44]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 dark:text-white">
              Transparência de Fontes
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sempre incluímos links diretos para diários oficiais, estudos científicos e repositórios públicos para que qualquer cidadão replique a checagem.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0A1F44]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/60 dark:text-purple-300">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 dark:text-white">
              Tecnologia & IA Responsável
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Utilizamos modelos multimodais de ponta com busca Google Search Grounding integrada, sem treinar em dados privados de usuários e respeitando a LGPD.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
