const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = reducedMotionQuery.matches;

document.querySelectorAll('.section-title, .section-intro').forEach((el) => {
  el.classList.add('reveal-item');
});

const animatedEls = document.querySelectorAll(
  '.reveal-item, .about-photo-card, .stat-card, .summary-card, .exp-card, .role-chip, .skill-pill, .cert-card, .contact-card, .edu-card, .case-card, .what-card, .how-card'
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

  el.querySelectorAll('[data-target]').forEach(animateCounter);
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
  document.querySelectorAll('[data-target]').forEach(animateCounter);
}

window.addEventListener('load', () => {
  window.setTimeout(() => {
    document.querySelectorAll('.stat-card:not(.visible)').forEach((el) => revealElement(el));
  }, prefersReducedMotion ? 0 : 400);
});

const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const siteNav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setMobileNavState(expand) {
  if (!siteNav || !navToggle) return;

  siteNav.classList.toggle('is-open', expand);
  navToggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
  navToggle.setAttribute('aria-label', expand ? 'Close navigation menu' : 'Open navigation menu');
}

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

if (siteNav && navToggle) {
  navToggle.addEventListener('click', () => {
    const shouldExpand = navToggle.getAttribute('aria-expanded') !== 'true';
    setMobileNavState(shouldExpand);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setMobileNavState(false);
    });
  });
}

const expCards = Array.from(document.querySelectorAll('[data-exp-card]'));
const experienceHint = document.querySelector('#experience .section-intro');

if (experienceHint) {
  experienceHint.textContent = 'Tap a role to view impact and responsibilities.';
}

function setExpState(card, expand) {
  const toggle = card.querySelector('.exp-toggle');
  const header = card.querySelector('.exp-header');
  const details = card.querySelector('.exp-details');
  const label = card.querySelector('.exp-toggle-label');
  const title = card.querySelector('.exp-title');
  const roleName = title ? title.textContent.trim() : 'this role';

  if (!toggle || !details || !label) return;

  card.classList.toggle('is-open', expand);
  toggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
  toggle.setAttribute('aria-label', expand ? `Hide impact for ${roleName}` : `View impact for ${roleName}`);
  label.textContent = expand ? 'Hide impact' : 'View impact';
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
    toggle.setAttribute('aria-label', `Hide impact for ${card.querySelector('.exp-title')?.textContent.trim() || 'this role'}`);
    toggle.querySelector('.exp-toggle-label').textContent = 'Hide impact';
  } else {
    details.hidden = true;
    details.style.maxHeight = '0px';
    toggle.setAttribute('aria-label', `View impact for ${card.querySelector('.exp-title')?.textContent.trim() || 'this role'}`);
    toggle.querySelector('.exp-toggle-label').textContent = 'View impact';
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

const aboutCard = document.querySelector('[data-about-card]');
const aboutToggle = aboutCard?.querySelector('.about-toggle');
const aboutDetails = aboutCard?.querySelector('.about-details');
const aboutToggleLabel = aboutToggle?.querySelector('.exp-toggle-label');

function setAboutState(expand) {
  if (!aboutCard || !aboutToggle || !aboutDetails || !aboutToggleLabel) return;

  aboutCard.classList.toggle('is-open', expand);
  aboutToggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
  aboutToggle.setAttribute('aria-label', expand ? 'Hide more about Kyle Hector' : 'Read more about Kyle Hector');
  aboutToggleLabel.textContent = expand ? 'Show less' : 'Read more';

  if (expand) {
    aboutDetails.hidden = false;
    aboutDetails.style.maxHeight = `${aboutDetails.scrollHeight}px`;
  } else {
    aboutDetails.style.maxHeight = `${aboutDetails.scrollHeight}px`;
    requestAnimationFrame(() => {
      aboutDetails.style.maxHeight = '0px';
    });
    window.setTimeout(() => {
      if (!aboutCard.classList.contains('is-open')) {
        aboutDetails.hidden = true;
      }
    }, prefersReducedMotion ? 0 : 280);
  }
}

if (aboutToggle && aboutDetails) {
  aboutDetails.hidden = true;
  aboutDetails.style.maxHeight = '0px';

  aboutToggle.addEventListener('click', () => {
    const shouldExpand = aboutToggle.getAttribute('aria-expanded') !== 'true';
    setAboutState(shouldExpand);
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    setMobileNavState(false);
  }

  expCards.forEach((card) => {
    if (!card.classList.contains('is-open')) return;
    const details = card.querySelector('.exp-details');
    if (!details) return;
    details.style.maxHeight = `${details.scrollHeight}px`;
  });

  if (aboutCard?.classList.contains('is-open') && aboutDetails) {
    aboutDetails.style.maxHeight = `${aboutDetails.scrollHeight}px`;
  }
});

// Drives the fixed top progress bar as the user scrolls.
const scrollProgressBar = document.querySelector('.scroll-progress');
const backToTopButton = document.querySelector('.back-to-top');

if (scrollProgressBar) {
  function updateScrollProgress() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgressBar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
}

if (backToTopButton) {
  function toggleBackToTop() {
    backToTopButton.classList.toggle('is-visible', window.scrollY > 520);
  }

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}

// Animates the hero metrics on page load.
document.querySelectorAll('.hero-metric-num[data-target]').forEach(animateCounter);

// Copies the email address to clipboard and falls back when needed.
document.querySelectorAll('[data-copy-email]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const email = btn.dataset.copyEmail;
    const reset = () => {
      window.setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('is-copied');
      }, 2000);
    };
    const showCopiedState = () => {
      btn.textContent = 'Copied \u2713';
      btn.classList.add('is-copied');
      reset();
    };
    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopiedState();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showCopiedState();
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  });
});
