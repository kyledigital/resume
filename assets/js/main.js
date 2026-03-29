  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = reducedMotionQuery.matches;

  document.querySelectorAll('.section-title, .section-intro').forEach((el) => {
    el.classList.add('reveal-item');
  });

  const animatedEls = document.querySelectorAll(
    '.reveal-item, .stat-card, .summary-card, .exp-card, .role-chip, .skill-pill, .cert-card, .contact-card, .edu-card, .case-card, .what-card, .how-card'
  );

  function revealAll() {
    animatedEls.forEach((el) => el.classList.add('visible'));
  }

  function animateCounter(el) {
    if (!el || el.dataset.counted === 'true') return;

    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.target.includes('.') ? el.dataset.target.split('.')[1].length : 0;

    el.dataset.counted = 'true';

    if (prefersReducedMotion) {
      el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * target;
      const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
      el.textContent = prefix + display + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function revealElement(el) {
    el.classList.add('visible');

    if (el.classList.contains('stat-card')) {
      animateCounter(el.querySelector('.stat-num[data-target]'));
    }
  }

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    let revealIndex = 0;
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = el.classList.contains('reveal-item') ? 0 : (revealIndex % 6) * 50;

        window.setTimeout(() => revealElement(el), delay);
        revealIndex += 1;
        observer.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    animatedEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealAll();
    document.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
  }

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      document.querySelectorAll('.stat-card:not(.visible)').forEach((el) => revealElement(el));
    }, prefersReducedMotion ? 0 : 400);
  });

  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        setActiveNav(visibleEntries[0].target.id);
      }
    }, {
      threshold: [0.2, 0.35, 0.55, 0.75],
      rootMargin: '-35% 0px -45% 0px'
    });

    sections.forEach((section) => navObserver.observe(section));
  } else if (sections[0]) {
    setActiveNav(sections[0].id);
  }

  const expCards = Array.from(document.querySelectorAll('[data-exp-card]'));

  function setExpState(card, expand) {
    const toggle = card.querySelector('.exp-toggle');
    const header = card.querySelector('.exp-header');
    const details = card.querySelector('.exp-details');
    const label = card.querySelector('.exp-toggle-label');

    if (!toggle || !details || !label) return;

    card.classList.toggle('is-open', expand);
    toggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
    label.textContent = expand ? 'Collapse details' : 'Expand details';
    if (header) {
      header.setAttribute('aria-expanded', expand ? 'true' : 'false');
    }

    if (expand) {
      details.hidden = false;
      details.style.maxHeight = `${details.scrollHeight}px`;
    } else {
      details.style.maxHeight = `${details.scrollHeight}px`;
      requestAnimationFrame(() => {
        details.style.maxHeight = '0px';
      });
      window.setTimeout(() => {
        if (!card.classList.contains('is-open')) {
          details.hidden = true;
        }
      }, prefersReducedMotion ? 0 : 280);
    }
  }

  expCards.forEach((card) => {
    const toggle = card.querySelector('.exp-toggle');
    const header = card.querySelector('.exp-header');
    const details = card.querySelector('.exp-details');

    if (!toggle || !details) return;

    if (card.classList.contains('is-open')) {
      details.hidden = false;
      details.style.maxHeight = 'none';
      toggle.querySelector('.exp-toggle-label').textContent = 'Collapse details';
    } else {
      details.hidden = true;
      details.style.maxHeight = '0px';
      toggle.querySelector('.exp-toggle-label').textContent = 'Expand details';
    }

    toggle.addEventListener('click', () => {
      const shouldExpand = toggle.getAttribute('aria-expanded') !== 'true';
      setExpState(card, shouldExpand);
    });

    if (header) {
      header.addEventListener('click', (event) => {
        if (event.target.closest('.exp-toggle')) return;
        const shouldExpand = toggle.getAttribute('aria-expanded') !== 'true';
        setExpState(card, shouldExpand);
      });
    }
  });

  window.addEventListener('resize', () => {
    expCards.forEach((card) => {
      if (!card.classList.contains('is-open')) return;
      const details = card.querySelector('.exp-details');
      if (!details) return;
      details.style.maxHeight = `${details.scrollHeight}px`;
    });
  });
