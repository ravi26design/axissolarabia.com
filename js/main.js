// ===== Axis — shared scripts =====
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // TEMP: disable navigation to other pages (keep in-page #anchors, mailto, tel)
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (/\.html(\?|#|$)/i.test(href)) {
      a.addEventListener('click', e => e.preventDefault());
      a.style.cursor = 'default';
    }
  });

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

  // Card spotlight — track cursor position as CSS vars
  document.querySelectorAll('.scard, .pcat, .project, .why-item').forEach(card => {
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

  // Horizontal scroll arrows
  document.querySelectorAll('[data-hscroll]').forEach(scroller => {
    const head = scroller.previousElementSibling;
    const nav = head && head.querySelector('.hscroll-nav');
    if (!nav) return;
    const card = scroller.querySelector('.icard');
    const step = card ? card.offsetWidth + 20 : 320;
    nav.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        scroller.scrollBy({ left: btn.dataset.scroll === 'next' ? step : -step, behavior: 'smooth' });
      });
    });
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
