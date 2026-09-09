(() => {
  const filters = document.querySelector('.work-filters');
  if (!filters) return;
  const buttons = [...filters.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-project]')];
  const independent = document.querySelector('#builds');
  const earlier = document.querySelector('.earlier-builds');
  const status = document.querySelector('#filter-status');
  const valid = new Set(buttons.map(button => button.dataset.filter));
  function applyFilter(value, persist = true) {
    const filter = valid.has(value) ? value : 'featured';
    let count = 0;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.hidden = !show;
      if (show) count++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    independent.hidden = !cards.some(card => independent.contains(card) && !card.hidden);
    earlier.hidden = !['all', 'independent', 'products'].includes(filter);
    const label = buttons.find(button => button.dataset.filter === filter).textContent;
    status.textContent = `${count} projects · ${label}`;
    if (persist) {
      const url = new URL(window.location.href);
      url.searchParams.set('work', filter);
      history.replaceState(null, '', url);
    }
  }
  filters.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  // A direct Independent anchor must reveal the full independent collection.
  function syncLocation() {
    applyFilter(new URLSearchParams(location.search).get('work') || (location.hash === '#builds' ? 'independent' : 'featured'), false);
  }
  document.querySelectorAll('a[href="#builds"]').forEach(link => link.addEventListener('click', () => applyFilter('independent')));
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', () => { if (location.hash === '#builds') applyFilter('independent', false); });
  syncLocation();
})();
