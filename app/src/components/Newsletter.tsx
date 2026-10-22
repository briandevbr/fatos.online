import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email validation helper
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (!isEmailValid(email)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!lgpdConsent) {
      setErrorMessage('É necessário aceitar os termos da LGPD para assinar a newsletter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          lgpdConsent
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível concluir a inscrição.');
      }

      setSuccessMessage(data.message || 'Inscrição confirmada com sucesso! Você receberá nosso resumo semanal toda sexta-feira.');
      setName('');
      setEmail('');
      setLgpdConsent(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar ao servidor de newsletter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-br from-[#0A1F44] via-[#0E2A5E] to-[#0A1F44] text-white">
      {/* Decorative background circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-blue-400/20 bg-white/5 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Copy Side */}
            <div className="lg:col-span-6 flex flex-col gap-4 text-left">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
                <Mail className="h-3.5 w-3.5" />
                <span>Resumo Semanal Fatos.online</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Receba checagens no seu e-mail
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Toda sexta-feira pela manhã, nossa redação compila as principais desinformações desmentidas da semana, alertas de novos golpes digitais e análises de tendências em redes sociais.
              </p>

              <div className="flex items-center gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Sem spam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Cancele a qualquer momento</span>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-6">
              {successMessage ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-6 text-center text-emerald-200">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="mt-3 text-lg font-bold text-white">Inscrição Confirmada!</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-200">
                    {successMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    Cadastrar outro e-mail
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="newsletter-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1">
                      Nome completo
                    </label>
                    <input
                      id="newsletter-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="newsletter-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1">
                      Seu melhor e-mail
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com.br"
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none ${
                        email && !isEmailValid(email)
                          ? 'border-rose-500 bg-rose-950/30 focus:border-rose-400'
                          : 'border-slate-700 bg-slate-900/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
                      }`}
                    />
                    {email && !isEmailValid(email) && (
                      <span className="mt-1 block text-[11px] text-rose-300">
                        Formato de e-mail inválido.
                      </span>
                    )}
                  </div>

                  {/* LGPD Consent Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="newsletter-lgpd"
                      type="checkbox"
                      checked={lgpdConsent}
                      onChange={(e) => setLgpdConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="newsletter-lgpd" className="text-xs text-slate-300 cursor-pointer">
                      Concordo em receber comunicações semanais do Fatos.online conforme a{' '}
                      <span className="underline text-blue-300 hover:text-white">Lei Geral de Proteção de Dados (LGPD)</span>. Seus dados nunca serão compartilhados com terceiros.
                    </label>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !lgpdConsent}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processando inscrição...</span>
                      </>
                    ) : (
                      <>
                        <span>Inscrever-se na Newsletter</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
