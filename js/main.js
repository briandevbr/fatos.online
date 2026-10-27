/*!
 * Fatos.online · main.js
 * Interações da landing page: tema, menu, destaque da seção ativa, Central de Monitoramento,
 * análise de sinais (Checar Fato), cópia de referências e QR Code de acesso rápido.
 *
 * Autoria: equipe acadêmica Fatos.online — https://github.com/briandevbr/fatos.online
 * Licença: Apache-2.0
 */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formatNumber = new Intl.NumberFormat('pt-BR');
  const formatPercent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Endereço público usado no QR Code quando a página é aberta localmente (file:// ou localhost).
  const PUBLIC_URL = 'https://briandevbr.github.io/fatos.online/';

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* armazenamento indisponível (modo privado, bloqueio de cookies) */
      }
    },
  };

  const srStatus = $('[data-sr-status]');

  function announce(message) {
    if (!srStatus) return;
    srStatus.textContent = '';
    window.setTimeout(() => {
      srStatus.textContent = message;
    }, 50);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  function flashLabel(element, message, duration = 2000) {
    if (!element) return;
    const original = element.dataset.original || element.textContent;
    element.dataset.original = original;
    element.textContent = message;
    window.clearTimeout(Number(element.dataset.timer));
    element.dataset.timer = String(
      window.setTimeout(() => {
        element.textContent = original;
      }, duration)
    );
  }

  /* ---------------------------------------------------------
     Tema claro/escuro
     --------------------------------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const button = $('[data-theme-toggle]');
    const meta = $('meta[name="theme-color"]');

    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#131313');
      if (button) {
        button.setAttribute('aria-pressed', String(theme === 'light'));
        button.setAttribute('aria-label', theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
      }
    };

    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    button?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      storage.set('fatos-theme', next);
    });
  }

  /* ---------------------------------------------------------
     Menu móvel
     --------------------------------------------------------- */
  function initMenu() {
    const header = $('.site-header');
    const toggle = $('[data-menu-toggle]');
    const nav = $('#menu-principal');
    if (!header || !toggle || !nav) return;

    const isOpen = () => header.classList.contains('menu-open');
    const setOpen = (open) => {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 1181px)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------
     Cabeçalho, seção ativa e animações de entrada
     --------------------------------------------------------- */
  function initHeaderShadow() {
    const header = $('.site-header');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initScrollSpy() {
    const links = $$('[data-spy-link]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const setActive = (key) => {
      links.forEach((link) => {
        const active = link.dataset.spyLink === key;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    // Uma faixa estreita no meio da tela define qual seção está "em leitura".
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.spy || '');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    $$('main > section').forEach((section) => observer.observe(section));
  }

  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ---------------------------------------------------------
     Central de Monitoramento (painel demonstrativo)
     --------------------------------------------------------- */
  function initMonitor() {
    const card = $('#monitor');
    if (!card) return;

    const checksEl = $('[data-counter="verificacoes"]', card);
    const falsesEl = $('[data-counter="falsidades"]', card);
    const rateEl = $('[data-rate]', card);
    const rateFill = $('[data-rate-fill]', card);
    const updatedEl = $('[data-updated]', card);
    const toggle = $('[data-monitor-toggle]', card);
    const toggleLabel = $('[data-monitor-toggle-label]', card);
    const livePill = $('[data-live-pill]', card);
    const liveLabel = $('[data-live-label]', card);
    const sparkLine = $('[data-spark-line]', card);
    const sparkArea = $('[data-spark-area]', card);
    const channels = $$('.channel-list li', card);

    const state = {
      checks: Number(checksEl.dataset.target) || 0,
      falses: Number(falsesEl.dataset.target) || 0,
      paused: false,
      lastUpdate: Date.now(),
      channel: 0,
      // Série inicial fixa; os próximos pontos chegam a cada nova "varredura".
      series: Array.from({ length: 28 }, (_, i) => 48 + 16 * Math.sin(i / 2.3) + 9 * Math.sin(i / 0.9)),
    };

    const renderNumbers = () => {
      checksEl.textContent = formatNumber.format(state.checks);
      falsesEl.textContent = formatNumber.format(state.falses);
      const rate = state.checks ? (state.falses / state.checks) * 100 : 0;
      rateEl.textContent = formatPercent.format(rate) + '%';
      rateFill.style.setProperty('--rate', rate.toFixed(2) + '%');
    };

    const renderSpark = () => {
      const width = 300;
      const height = 64;
      const step = width / (state.series.length - 1);
      const line = state.series
        .map((value, i) => {
          const y = height - (Math.min(Math.max(value, 4), 96) / 100) * height;
          return (i ? 'L' : 'M') + (i * step).toFixed(1) + ' ' + y.toFixed(1);
        })
        .join(' ');
      sparkLine.setAttribute('d', line);
      sparkArea.setAttribute('d', line + ' L' + width + ' ' + height + ' L0 ' + height + ' Z');
    };

    const renderUpdated = () => {
      if (state.paused) {
        updatedEl.textContent = 'pausado';
        return;
      }
      const seconds = Math.round((Date.now() - state.lastUpdate) / 1000);
      updatedEl.textContent = seconds < 5 ? 'atualizado agora' : 'há ' + seconds + ' s';
    };

    const renderChannel = () => {
      channels.forEach((item, i) => item.classList.toggle('is-scanning', i === state.channel));
    };

    const bump = (element) => {
      if (reducedMotion.matches) return;
      element.classList.remove('is-bumped');
      void element.offsetWidth; // reinicia a animação
      element.classList.add('is-bumped');
    };

    const countUp = () => {
      const duration = 1600;
      const start = performance.now();
      const target = { checks: state.checks, falses: state.falses };
      const frame = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        checksEl.textContent = formatNumber.format(Math.round(target.checks * eased));
        falsesEl.textContent = formatNumber.format(Math.round(target.falses * eased));
        if (progress < 1) window.requestAnimationFrame(frame);
        else renderNumbers();
      };
      window.requestAnimationFrame(frame);
    };

    let timer = 0;
    const scheduleTick = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 3200 + Math.random() * 3800);
    };

    function tick() {
      if (!state.paused && !document.hidden) {
        const audited = 1 + Math.floor(Math.random() * 3);
        let debunked = 0;
        for (let i = 0; i < audited; i++) if (Math.random() < 0.63) debunked++;

        state.checks += audited;
        state.falses += debunked;
        state.series.push(30 + Math.random() * 55);
        state.series.shift();
        state.channel = (state.channel + 1) % channels.length;
        state.lastUpdate = Date.now();

        renderNumbers();
        renderSpark();
        renderChannel();
        renderUpdated();
        bump(checksEl);
        if (debunked) bump(falsesEl);
      }
      scheduleTick();
    }

    toggle?.addEventListener('click', () => {
      state.paused = !state.paused;
      toggle.dataset.paused = String(state.paused);
      toggleLabel.textContent = state.paused ? 'Retomar' : 'Pausar';
      livePill.classList.toggle('is-paused', state.paused);
      liveLabel.textContent = state.paused ? 'Pausado' : 'Ao Vivo';
      if (!state.paused) state.lastUpdate = Date.now();
      renderUpdated();
      announce(state.paused ? 'Monitoramento pausado.' : 'Monitoramento retomado.');
    });

    renderNumbers();
    renderSpark();
    renderChannel();
    renderUpdated();
    if (!reducedMotion.matches) countUp();
    scheduleTick();
    window.setInterval(renderUpdated, 1000);
  }

  /* ---------------------------------------------------------
     Checar Fato: sinais de alerta (análise local, sem servidor)
     --------------------------------------------------------- */
  const SIGNALS = [
    {
      title: 'Pede urgência ou compartilhamento',
      detail: '“Compartilhe antes que apaguem” e “repasse para todos” são marcas de correntes enganosas: a pressa impede a checagem.',
      weight: 2,
      test: (text) =>
        /\b(compartilhe|compartilhem|repasse|repassem|divulgue|divulguem|espalhe|espalhem|encaminhe|encaminhem|mande para todos|envie para todos)\b|antes que (apaguem|tirem do ar|censurem|deletem|removam)/i.test(text),
    },
    {
      title: 'Linguagem alarmista ou sensacionalista',
      detail: 'Termos como “urgente”, “bomba” ou “chocante” apelam à emoção, não às evidências.',
      weight: 2,
      test: (text) =>
        /\b(urgente|bomba|chocante|absurdo|esc[âa]ndalo|inacredit[áa]vel|grav[íi]ssimo|alerta m[áa]ximo|exclusivo|vazou|vazado)\b/i.test(text),
    },
    {
      title: 'Texto em caixa alta',
      detail: 'Trechos inteiros em MAIÚSCULAS simulam urgência e são comuns em mensagens fabricadas.',
      weight: 1,
      test: (text) => {
        const letters = text.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, '');
        if (letters.length < 20) return false;
        const upper = letters.replace(/[^A-ZÀ-ÖØ-Þ]/g, '').length;
        const shoutedWords = text.split(/\s+/).filter((word) => /^[A-ZÀ-ÖØ-Þ]{3,}[!?.,:;]*$/.test(word)).length;
        return upper / letters.length > 0.3 || shoutedWords >= 3;
      },
    },
    {
      title: 'Pontuação exagerada',
      detail: 'Sequências como “!!!” ou “?!?!” reforçam o apelo emocional.',
      weight: 1,
      test: (text) => /[!?]{3,}/.test(text),
    },
    {
      title: 'Autoridade vaga ou anônima',
      detail: '“Médicos afirmam”, “um amigo que trabalha no hospital”: sem nome, instituição ou estudo identificável, não há como conferir.',
      weight: 2,
      test: (text) =>
        /\b(m[ée]dicos|cientistas|especialistas|pesquisadores|estudos?|pesquisas?)\s+(dizem|disseram|afirmam|afirmaram|comprovam|comprovaram|revelam|revelaram|garantem|confirmam|confirmaram|descobriram)\b/i.test(text) ||
        /\b(um|uma|meu|minha)\s+(amig[oa]|conhecid[oa]|prim[oa]|vizinh[oa]|parente|cunhad[oa])\b[^.!?]{0,60}\s(trabalha|é\s+(m[ée]dic|enfermeir|policial|militar))/i.test(text),
    },
    {
      title: 'Promessa absoluta ou milagrosa',
      detail: 'Curas garantidas, “100% comprovado” e resultados instantâneos raramente se sustentam diante das evidências.',
      weight: 2,
      test: (text) =>
        /\bcura(m|r)?\b[^.!?]{0,50}(definitiv|garantid|milagr|em \d+ (dias?|horas?|semanas?)|em uma semana|para sempre)|100\s?%\s*(comprovad|garantid|eficaz|natural|segur)|\bmilagr|\bcomprovad[oa]s? cientificamente|\bcientificamente comprovad|\bresultado imediato/i.test(text),
    },
    {
      title: 'Narrativa conspiratória',
      detail: 'Alegações de que “eles escondem a verdade” dispensam provas e transformam qualquer desmentido em “parte do plano”.',
      weight: 2,
      test: (text) =>
        /(a m[íi]dia (n[ãa]o (mostra|fala|conta)|esconde)|n[ãa]o querem que voc[êe] saiba|querem esconder|est[ãa]o escondendo|escondem (isso|a verdade)|a verdade (oculta|escondida|que ningu[ée]m (conta|mostra))|ningu[ée]m (est[áa] falando|fala) (disso|nisso|sobre)|acord(a|em),? (brasil|povo|gente)|nova ordem mundial|plano secreto|ind[úu]stria farmac[êe]utica n[ãa]o (deixa|quer))/i.test(text),
    },
    {
      title: 'Nenhuma fonte verificável',
      detail: 'Não há link, veículo, instituição ou data identificáveis. Informação confiável mostra de onde veio.',
      weight: 1,
      test: (text) => !/(https?:\/\/|www\.|\b(segundo|conforme|fonte|publicad[oa]|divulgad[oa])\b|de acordo com)/i.test(text),
    },
  ];

  const SOURCE_SIGNAL = {
    title: 'Menciona fonte ou instituição',
    detail: 'Bom sinal, mas confira se a fonte original diz exatamente isso — e se a informação é recente.',
    test: (text) =>
      /(https?:\/\/|www\.|\.gov\.br|\.edu\.br|\bfiocruz\b|\bibge\b|\banvisa\b|\bOMS\b|\bOPAS\b|\bminist[ée]rio\b|\bscielo\b|\bdoi\.org\b|\bpubmed\b|\buniversidade\b|\bsegundo\b|\bde acordo com\b)/i.test(text),
  };

  // Palavras que só "poluem" a busca por checagens já publicadas.
  const SEARCH_NOISE = /^(urgente|compartilhe|compartilhem|repasse|repassem|divulgue|divulguem|espalhe|espalhem|encaminhe|bomba|chocante|absurdo|aten[çc][ãa]o|alerta|gente|pessoal|vejam|veja|olha|antes|que|apaguem|todos|com)$/i;

  function levelFor(score) {
    if (score >= 7) return { key: 'critico', label: 'Muito alto' };
    if (score >= 4) return { key: 'alto', label: 'Alto' };
    if (score >= 1) return { key: 'moderado', label: 'Moderado' };
    return { key: 'baixo', label: 'Baixo' };
  }

  function analyzeClaim(raw) {
    const text = raw.trim();
    if (/^https?:\/\/\S+$/i.test(text)) {
      let host = '';
      let slug = '';
      try {
        const url = new URL(text);
        host = url.hostname.replace(/^www\./, '');
        slug = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
          .replace(/\.[a-z0-9]+$/i, '')
          .replace(/[-_+]+/g, ' ');
      } catch {
        host = '';
      }
      return { isLink: true, host, query: slug.trim() || host };
    }

    const signals = SIGNALS.filter((signal) => signal.test(text));
    const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
    const query = text
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[!?.,;:"“”'‘’()[\]{}*_#@…]+/g, ' ')
      .split(/\s+/)
      .filter((word) => word && !SEARCH_NOISE.test(word))
      .slice(0, 14)
      .join(' ');

    return { isLink: false, signals, score, query, hasSource: SOURCE_SIGNAL.test(text) };
  }

  function searchLinks(query, host) {
    const agencies =
      '(site:lupa.uol.com.br OR site:aosfatos.org OR site:projetocomprova.com.br OR site:g1.globo.com/fato-ou-fake OR site:estadao.com.br/estadao-verifica OR site:checamos.afp.com OR site:boatos.org)';
    const q = encodeURIComponent(query);
    const links = [
      { label: 'Google Fact Check Explorer', href: 'https://toolbox.google.com/factcheck/explorer/search/' + q + ';hl=pt' },
      { label: 'Agências brasileiras de checagem', href: 'https://www.google.com/search?q=' + encodeURIComponent(query + ' ' + agencies) },
      { label: 'Google Notícias', href: 'https://news.google.com/search?q=' + q + '&hl=pt-BR&gl=BR&ceid=BR:pt-419' },
    ];
    if (host) {
      links.push({ label: 'O que se sabe sobre ' + host, href: 'https://www.google.com/search?q=' + encodeURIComponent('"' + host + '"') });
    }
    return links;
  }

  function signalItem(iconId, variant, title, detail) {
    const item = document.createElement('li');
    item.className = 'signal signal-' + variant;
    item.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + iconId + '"/></svg><div><strong></strong><p></p></div>';
    $('strong', item).textContent = title;
    $('p', item).textContent = detail;
    return item;
  }

  function linkItem(link) {
    const anchor = document.createElement('a');
    anchor.className = 'search-link';
    anchor.href = link.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.label;
    anchor.insertAdjacentHTML(
      'beforeend',
      '<span class="sr-only"> (abre em nova aba)</span><svg class="icon" aria-hidden="true"><use href="#i-external-link"/></svg>'
    );
    return anchor;
  }

  function initChecker() {
    const form = $('#checker-form');
    const input = $('#claim-input');
    const error = $('#claim-error');
    const result = $('#checker-result');
    if (!form || !input || !result) return;

    const levelEl = $('[data-result-level]', result);
    const textEl = $('[data-result-text]', result);
    const listEl = $('[data-signal-list]', result);
    const linksEl = $('[data-search-links]', result);
    const meterFill = $('[data-meter-fill]', result);

    const EXAMPLE =
      'URGENTE!!! Médicos confirmam que beber água morna com limão em jejum CURA A COVID EM 3 DIAS. A mídia não mostra porque a indústria farmacêutica não deixa. Compartilhe com todos antes que apaguem!!!';

    const render = (analysis) => {
      listEl.replaceChildren();
      linksEl.replaceChildren();
      let level;

      if (analysis.isLink) {
        level = { key: 'moderado', label: 'Confira a origem' };
        textEl.textContent =
          'O conteúdo de links não é lido daqui. Verifique o domínio, a data de publicação e se veículos confiáveis noticiaram o mesmo.';
        listEl.append(
          signalItem(
            'i-info',
            'neutral',
            analysis.host ? 'Domínio: ' + analysis.host : 'Endereço não reconhecido',
            'Desconfie de nomes que imitam veículos conhecidos, de páginas sem expediente ou contato e de textos sem data.'
          )
        );
        meterFill.style.width = '35%';
      } else {
        level = levelFor(analysis.score);
        const count = analysis.signals.length;
        textEl.textContent = count
          ? count + (count === 1 ? ' sinal de alerta encontrado' : ' sinais de alerta encontrados') +
          '. Antes de compartilhar, procure a mesma informação em fontes confiáveis.'
          : 'Nenhum sinal clássico de boato foi encontrado — o que não garante que o conteúdo seja verdadeiro. Confira nas bases abaixo.';
        analysis.signals.forEach((signal) => listEl.append(signalItem('i-triangle-alert', 'alert', signal.title, signal.detail)));
        if (analysis.hasSource) listEl.append(signalItem('i-circle-check', 'positive', SOURCE_SIGNAL.title, SOURCE_SIGNAL.detail));
        meterFill.style.width = Math.min(100, Math.max(6, (analysis.score / 10) * 100)) + '%';
      }

      result.dataset.level = level.key;
      levelEl.textContent = level.label;
      searchLinks(analysis.query || 'checagem de fatos', analysis.host).forEach((link) => linksEl.append(linkItem(link)));
      result.hidden = false;

      if (result.getBoundingClientRect().top > window.innerHeight * 0.8) {
        result.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      error.hidden = true;
      input.removeAttribute('aria-invalid');
      render(analyzeClaim(value));
    });

    input.addEventListener('input', () => {
      if (input.value.trim()) {
        error.hidden = true;
        input.removeAttribute('aria-invalid');
      }
    });

    $('[data-checker-example]')?.addEventListener('click', () => {
      input.value = EXAMPLE;
      input.focus();
      form.requestSubmit();
    });
  }

  /* ---------------------------------------------------------
     Referências ABNT
     --------------------------------------------------------- */
  function initReferences() {
    const items = $$('[data-ref]');
    const count = $('[data-ref-count]');
    if (count) count.textContent = String(items.length);

    const plain = (item) => $('[data-ref-text]', item).textContent.replace(/\s+/g, ' ').trim();

    items.forEach((item) => {
      const button = $('[data-copy-ref]', item);
      if (!button) return;
      button.addEventListener('click', async () => {
        const ok = await copyText(plain(item));
        const use = $('use', button);
        button.classList.toggle('is-done', ok);
        use?.setAttribute('href', ok ? '#i-check' : '#i-copy');
        window.setTimeout(() => {
          button.classList.remove('is-done');
          use?.setAttribute('href', '#i-copy');
        }, 1800);
        announce(ok ? 'Referência copiada.' : 'Não foi possível copiar a referência.');
      });
    });

    const copyAll = $('[data-copy-all-refs]');
    copyAll?.addEventListener('click', async () => {
      const ok = await copyText(items.map(plain).join('\n\n'));
      flashLabel($('span', copyAll), ok ? 'Copiadas!' : 'Falha ao copiar');
      announce(ok ? 'Todas as referências foram copiadas.' : 'Não foi possível copiar as referências.');
    });
  }

  /* ---------------------------------------------------------
     QR Code de acesso rápido
     --------------------------------------------------------- */
  function publicBaseUrl() {
    const { protocol, hostname, origin, pathname } = window.location;
    const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1'].includes(hostname);
    if ((protocol === 'http:' || protocol === 'https:') && !isLocal) {
      return origin + pathname.replace(/index\.html?$/i, '');
    }
    return PUBLIC_URL;
  }

  function isWebAddress(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function initQr() {
    const output = $('[data-qr-output]');
    if (!output) return;
    if (!window.FatosQR) {
      output.textContent = 'Não foi possível carregar o gerador de QR Code.';
      return;
    }

    const input = $('#qr-input');
    const error = $('#qr-error');
    const caption = $('[data-qr-caption]');
    const meta = $('[data-qr-meta]');
    const targets = $$('[data-qr-target]');
    const downloadBtn = $('[data-qr-download]');
    const copyBtn = $('[data-qr-copy]');
    const shareBtn = $('[data-qr-share]');
    const base = publicBaseUrl();
    let current = null;

    const setChecked = (selected) => {
      targets.forEach((radio) => {
        radio.checked = radio === selected;
      });
    };

    const showError = (message) => {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    };

    const clearError = () => {
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    };

    const render = (url) => {
      let qr;
      try {
        qr = window.FatosQR.encode(url, { ecl: 'M' });
      } catch {
        showError('Endereço longo demais para gerar um QR Code legível.');
        return;
      }
      output.innerHTML = window.FatosQR.toSvgString(qr, {
        border: 2,
        dark: '#0b1226',
        light: '#ffffff',
        title: 'QR Code que abre ' + url,
      });
      caption.textContent = url.replace(/^https?:\/\//, '');
      meta.textContent = 'Versão ' + qr.version + ' · correção ' + qr.ecl + ' · ' + qr.size + '×' + qr.size + ' módulos';
      current = { url, qr };
    };

    const selectTarget = (radio) => {
      const url = base + radio.value;
      setChecked(radio);
      input.value = url;
      clearError();
      render(url);
    };

    targets.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (radio.checked) selectTarget(radio);
      });
    });

    let debounce = 0;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        const value = input.value.trim();
        setChecked(targets.find((radio) => base + radio.value === value) || null);
        if (!value) return showError('Informe um endereço para gerar o QR Code.');
        if (!isWebAddress(value)) return showError('Informe um endereço que comece com http:// ou https://.');
        clearError();
        render(value);
      }, 250);
    });

    downloadBtn?.addEventListener('click', () => {
      if (!current) return;
      const canvas = document.createElement('canvas');
      window.FatosQR.drawToCanvas(current.qr, canvas, { scale: 12, border: 4, dark: '#0b1226', light: '#ffffff' });
      const link = document.createElement('a');
      link.download = 'fatos-online-qrcode.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      announce('Download do QR Code iniciado.');
    });

    copyBtn?.addEventListener('click', async () => {
      if (!current) return;
      const ok = await copyText(current.url);
      flashLabel($('span', copyBtn), ok ? 'Link copiado!' : 'Falha ao copiar');
      announce(ok ? 'Link copiado.' : 'Não foi possível copiar o link.');
    });

    if (shareBtn && typeof navigator.share === 'function') {
      shareBtn.hidden = false;
      shareBtn.addEventListener('click', async () => {
        if (!current) return;
        try {
          await navigator.share({ title: 'Fatos.online', text: 'Checagem de fatos e verdade digital', url: current.url });
        } catch {
          /* compartilhamento cancelado pela pessoa usuária */
        }
      });
    }

    selectTarget(targets.find((radio) => radio.checked) || targets[0]);
  }

  function initDateline() {
    const element = $('[data-dateline]');
    if (!element) return;
    const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    element.textContent = date;
  }

  function initYear() {
    $$('[data-year]').forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  [initTheme, initMenu, initHeaderShadow, initScrollSpy, initReveal, initMonitor, initChecker, initReferences, initQr, initDateline, initYear].forEach(
    (init) => {
      try {
        init();
      } catch (error) {
        console.error('[Fatos.online]', init.name, error);
      }
    }
  );
})();
