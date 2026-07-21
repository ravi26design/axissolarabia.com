// ===== Axis — shared scripts =====
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // TEMP: disable navigation to other pages (home + about enabled; keep #anchors, mailto, tel)
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isHtml = /\.html(\?|#|$)/i.test(href);
    const isEnabled = /(^|\/)(index|about|products|process-analytics)\.html(\?|#|$)/i.test(href);
    if (isHtml && !isEnabled) {
      a.addEventListener('click', e => e.preventDefault());
      a.style.cursor = 'default';
    }
  });

  // Preloader — hide once the page has loaded
  const preloader = document.getElementById('preloader');
  if (preloader) {
    let hidden = false;
    const hide = () => { if (hidden) return; hidden = true; preloader.classList.add('hidden'); setTimeout(() => preloader.remove(), 700); };
    if (document.readyState === 'complete') setTimeout(hide, 500);
    else window.addEventListener('load', () => setTimeout(hide, 400));
    setTimeout(hide, 3500); // safety fallback
  }

  // Header background on scroll + scroll progress
  const header = document.getElementById('header');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Film grain overlay
  const grain = document.createElement('div');
  grain.className = 'grain';
  document.body.appendChild(grain);

  // Mobile menu
  const openBtn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = menu && menu.querySelector('.close');
  if (openBtn && menu) {
    openBtn.addEventListener('click', () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; });
    const close = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  // Reveal on scroll (staggered per container)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const idx = sibs.indexOf(el);
    el.style.transitionDelay = Math.min(idx, 6) * 0.07 + 's';
    io.observe(el);
  });

  // Project region filter
  const tabs = document.querySelectorAll('.tab');
  const projs = document.querySelectorAll('.project');
  if (tabs.length && projs.length) {
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const r = tab.dataset.region;
      projs.forEach(p => { p.style.display = (r === 'all' || p.dataset.region === r) ? '' : 'none'; });
    }));
  }

  // Interactive process showcase (manufacturing)
  document.querySelectorAll('.proc').forEach(proc => {
    const steps = Array.from(proc.querySelectorAll('.proc-step'));
    const panels = Array.from(proc.querySelectorAll('.proc-panel'));
    if (!steps.length) return;
    let idx = 0, timer = null;
    const show = i => {
      idx = i;
      steps.forEach((s, j) => s.classList.toggle('active', j === i));
      panels.forEach((p, j) => p.classList.toggle('active', j === i));
    };
    const advance = () => show((idx + 1) % steps.length);
    const start = () => { if (!reduceMotion) { clearInterval(timer); timer = setInterval(advance, 3600); } };
    const stop = () => clearInterval(timer);
    steps.forEach((s, i) => {
      s.addEventListener('click', () => { show(i); start(); });
      s.addEventListener('mouseenter', () => show(i));
    });
    proc.addEventListener('mouseenter', stop);
    proc.addEventListener('mouseleave', start);
    start();
  });

  // Header search
  const searchToggle = document.querySelector('.search-toggle');
  if (searchToggle) {
    const INDEX = [
      { t: 'Home', d: 'Engineering solutions for Saudi Arabia’s sustainable future', u: 'index.html' },
      { t: 'About Axis', d: 'Company, milestones, manufacturing area, global presence', u: 'about.html' },
      { t: 'Engineering Solutions', d: 'Analyzer shelters, CEMS, AAQMS, SWAS, EQMS, HVAC, chlorine dosing', u: 'solutions.html' },
      { t: 'Products', d: 'Process analytics, industrial HVAC, enclosures, automation, water monitoring', u: 'products.html' },
      { t: 'Industries', d: 'Oil & gas, power, water, cement, pharma, marine, data centers and more', u: 'industries.html' },
      { t: 'Projects & Case Studies', d: 'Proven delivery across critical industries', u: 'projects.html' },
      { t: 'Manufacturing', d: 'Precision manufacturing process from engineering to commissioning', u: 'manufacturing.html' },
      { t: 'Resources', d: 'Brochures, catalogues, datasheets, case studies', u: 'resources.html' },
      { t: 'Certifications', d: 'IECEx, ATEX, ISO, RoHS, ECAS, TUV India and more', u: 'about.html' },
      { t: 'Contact / RFQ', d: 'Request a proposal or technical consultation', u: 'contact.html' }
    ];
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = '<button class="search-close" aria-label="Close search"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + '<div class="search-box"><div class="search-field"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>'
      + '<input type="text" placeholder="Search products, solutions, industries…" aria-label="Search"></div><div class="search-results"></div></div>';
    document.body.appendChild(modal);
    const input = modal.querySelector('input');
    const results = modal.querySelector('.search-results');
    const render = (q) => {
      const query = q.trim().toLowerCase();
      const list = !query ? INDEX : INDEX.filter(x => (x.t + ' ' + x.d).toLowerCase().includes(query));
      results.innerHTML = list.length
        ? list.map(x => `<a class="sr-item" href="${x.u}"><b>${x.t}</b><span>${x.d}</span></a>`).join('')
        : '<div class="search-empty">No results found.</div>';
    };
    const open = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; render(''); setTimeout(() => input.focus(), 50); };
    const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; input.value = ''; };
    searchToggle.addEventListener('click', open);
    modal.querySelector('.search-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    input.addEventListener('input', () => render(input.value));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Language switch (EN / AR) via Google website translator
  const langButtons = document.querySelectorAll('.lang-switch button');
  if (langButtons.length) {
    // Inject the translate element (off-screen, NOT display:none) + script once
    if (!document.getElementById('google_translate_element')) {
      const gd = document.createElement('div');
      gd.id = 'google_translate_element';
      gd.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(gd);
      window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,ar', autoDisplay: false }, 'google_translate_element');
      };
      const gs = document.createElement('script');
      gs.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(gs);
    }
    const setCookie = (val, remove) => {
      const attr = remove ? '; max-age=0' : '; max-age=' + (365 * 86400);
      document.cookie = 'googtrans=' + val + '; path=/' + attr;
      document.cookie = 'googtrans=' + val + '; path=/; domain=' + location.hostname + attr;
    };
    const currentLang = () => {
      const m = document.cookie.match(/googtrans=\/en\/(\w+)/);
      return m ? m[1] : 'en';
    };
    // Poll for Google's hidden <select>, then set it and fire change (translates in place)
    const drive = (lang, tries) => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = lang === 'en' ? '' : lang;
        combo.dispatchEvent(new Event('change'));
        return;
      }
      if (tries > 0) setTimeout(() => drive(lang, tries - 1), 250);
    };
    const setLang = (lang, reloadForEn) => {
      if (lang === 'ar') setCookie('/en/ar', false); else setCookie('', true);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      langButtons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      if (lang === 'en' && reloadForEn) { location.reload(); return; }
      drive(lang, 40);
    };
    langButtons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));
    // Re-apply saved language on new page loads
    if (currentLang() === 'ar') setLang('ar', false);
  }

  // Product grid pagination (20 per page)
  document.querySelectorAll('.pd-grid').forEach(grid => {
    const cards = Array.from(grid.children).filter(c => c.classList.contains('pd-card'));
    const SIZE = 20;
    if (cards.length <= SIZE) return;
    const pages = Math.ceil(cards.length / SIZE);
    let cur = 1;
    const pager = document.createElement('div');
    pager.className = 'pd-pager';
    grid.after(pager);
    const scrollUp = () => window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    const render = () => {
      cards.forEach((c, i) => { c.style.display = (i >= (cur - 1) * SIZE && i < cur * SIZE) ? '' : 'none'; });
      let h = `<button class="pg-nav" data-nav="prev"${cur === 1 ? ' disabled' : ''} aria-label="Previous">‹</button>`;
      for (let p = 1; p <= pages; p++) h += `<button data-p="${p}"${p === cur ? ' class="active"' : ''}>${p}</button>`;
      h += `<button class="pg-nav" data-nav="next"${cur === pages ? ' disabled' : ''} aria-label="Next">›</button>`;
      pager.innerHTML = h;
      pager.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { cur = +b.dataset.p; render(); scrollUp(); }));
      pager.querySelector('[data-nav="prev"]').addEventListener('click', () => { if (cur > 1) { cur--; render(); scrollUp(); } });
      pager.querySelector('[data-nav="next"]').addEventListener('click', () => { if (cur < pages) { cur++; render(); scrollUp(); } });
    };
    render();
  });

  // Skeleton loading overlays for content images
  document.querySelectorAll('.pd-img, .icard-img, .project .thumb, .ma-visual').forEach(el => {
    const img = el.querySelector('img');
    if (!img) return;
    const sk = document.createElement('span');
    sk.className = 'skeleton-ov';
    el.appendChild(sk);
    const done = () => { sk.classList.add('gone'); setTimeout(() => sk.remove(), 500); };
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  // Testimonial avatars — initials fallback when there's no photo
  document.querySelectorAll('.quote .who').forEach(who => {
    const av = who.querySelector('.av');
    const name = who.querySelector('b');
    if (av && name && !av.querySelector('img') && !av.textContent.trim()) {
      const words = name.textContent.trim().split(/\s+/).filter(Boolean);
      if (words.length) {
        const first = words[0][0] || '';
        const last = words.length > 1 ? words[words.length - 1][0] : (words[0][1] || '');
        av.textContent = (first + last).toUpperCase();
      }
    }
  });

  // Contact form (demo — no backend)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.getElementById('formNote');
      if (note) note.style.display = 'block';
      form.reset();
    });
  }

  // Infinite marquee for the client-logo row
  const row = document.querySelector('.trust-row');
  if (row && !reduceMotion) {
    row.innerHTML += row.innerHTML; // duplicate for seamless loop
    row.classList.add('marquee');
  }

  // Auto marquee for certification logos
  document.querySelectorAll('.cert-row').forEach(cr => {
    if (reduceMotion) return;
    const wrap = document.createElement('div');
    wrap.className = 'cert-marquee';
    cr.parentNode.insertBefore(wrap, cr);
    wrap.appendChild(cr);
    cr.innerHTML += cr.innerHTML; // duplicate for seamless loop
    cr.classList.add('marquee');
  });

  // Card spotlight — track cursor position as CSS vars
  document.querySelectorAll('.scard, .pcat, .project, .why-item, .fstep').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  // Auto-scroll marquee for industry cards (duplicate for seamless loop)
  document.querySelectorAll('[data-marquee] .hscroll-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  // Horizontal scroll arrows (case studies etc.)
  document.querySelectorAll('[data-hscroll]').forEach(scroller => {
    const prev = scroller.previousElementSibling;
    const buttons = prev ? prev.querySelectorAll('[data-scroll]') : [];
    const card = scroller.querySelector('.project, .icard');
    const step = card ? card.offsetWidth + 22 : 340;
    buttons.forEach(btn => btn.addEventListener('click', () => {
      scroller.scrollBy({ left: btn.dataset.scroll === 'next' ? step : -step, behavior: 'smooth' });
    }));

    // Drag / swipe to scroll
    let down = false, startX = 0, startL = 0, moved = false;
    scroller.addEventListener('pointerdown', e => { down = true; moved = false; startX = e.clientX; startL = scroller.scrollLeft; scroller.setPointerCapture(e.pointerId); });
    scroller.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; scroller.scrollLeft = startL - dx; });
    const end = () => { down = false; };
    scroller.addEventListener('pointerup', end);
    scroller.addEventListener('pointercancel', end);
    scroller.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  // Magnetic effect on primary buttons (desktop only)
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
})();
