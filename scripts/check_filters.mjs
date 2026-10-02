// Dependency-free DOM-contract checks for the actual portfolio filtering script.
// This does not replace browser layout, accessibility or interaction testing.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const data = JSON.parse(readFileSync(new URL('../assets/data/projects.json', import.meta.url)));
const source = readFileSync(new URL('../assets/js/portfolio.js', import.meta.url), 'utf8');
function createFixture(url = 'https://portfolio.test/') {
  const events = {};
  const buttons = ['featured', 'marketing', 'websites', 'products', 'ai', 'independent', 'all'].map(value => ({
    dataset: {filter: value}, textContent: value, attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(k, fn) { this[k] = fn; }
  }));
  const cards = data.map(p => ({dataset: {category: [...p.categories, ...(p.featured ? ['featured'] : [])].join(' ')}, group: p.group, hidden: false}));
  const independent = {hidden: false, contains: c => c.group === 'independent'};
  const earlier = {hidden: false};
  const status = {textContent: ''};
  const nav = {addEventListener(k, fn) { this[k] = fn; }};
  const filters = {hidden: true, querySelectorAll: () => buttons};
  const location = {href: url, search: new URL(url).search, hash: new URL(url).hash};
  const document = {
    querySelector: s => ({'.work-filters': filters, '#builds': independent, '.earlier-builds': earlier, '#filter-status': status}[s]),
    querySelectorAll: s => s === '[data-project]' ? cards : [nav]
  };
  const history = {replaceState(_a, _b, value) { location.href = value.href; location.search = value.search; location.hash = value.hash; }};
  const window = {location, addEventListener(k, fn) { events[k] = fn; }};
  vm.runInNewContext(source, {document, location, history, window, URL, URLSearchParams});
  return {buttons, cards, filters, independent, earlier, status, nav, events, location};
}
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
const f = createFixture();
check('filters progressively enhanced', () => assert.equal(f.filters.hidden, false));
for (const button of f.buttons) {
  check(`${button.dataset.filter} category and selected state`, () => {
    button.click();
    const expected = data.filter(p => button.dataset.filter === 'all' || p.categories.includes(button.dataset.filter) || button.dataset.filter === 'featured' && p.featured);
    assert.equal(f.cards.filter(c => !c.hidden).length, expected.length);
    assert.equal(button.attrs['aria-pressed'], 'true');
    assert.equal(f.buttons.filter(b => b.attrs['aria-pressed'] === 'true').length, 1);
    assert.equal(new URL(f.location.href).searchParams.get('work'), button.dataset.filter);
    assert.ok(f.status.textContent.startsWith(`${expected.length} projects`));
  });
}
check('repeated website filtering stays stable', () => {
  const b = f.buttons.find(b => b.dataset.filter === 'websites');
  b.click(); b.click();
  assert.equal(f.cards.filter(c => !c.hidden).length, 3);
  assert.equal(f.independent.hidden, true);
});
check('independent navigation reveals freelance and personal projects', () => {
  f.nav.click();
  assert.equal(f.independent.hidden, false);
  assert.equal(f.cards.filter(c => !c.hidden).length, 4);
});
check('direct independent anchor', () => {
  const direct = createFixture('https://portfolio.test/#builds');
  assert.equal(direct.independent.hidden, false);
  assert.equal(direct.cards.filter(c => !c.hidden).length, 4);
});
check('Enersave is available in independent and marketing filters', () => {
  const index = data.findIndex(p => p.id === 'enersave');
  for (const category of ['independent', 'marketing']) {
    f.buttons.find(b => b.dataset.filter === category).click();
    assert.equal(f.cards[index].hidden, false);
  }
});
check('unknown query falls back safely', () => {
  const direct = createFixture('https://portfolio.test/?work=unknown');
  assert.equal(direct.cards.filter(c => !c.hidden).length, data.filter(p => p.featured).length);
});
check('back/forward state synchronisation', () => {
  f.location.search='?work=websites'; f.events.popstate();
  assert.equal(f.cards.filter(c => !c.hidden).length, 3);
});
check('hash navigation reveals independent projects', () => {
  f.location.hash='#builds'; f.events.hashchange();
  assert.equal(f.independent.hidden, false);
});
console.log(`Passed ${checks} DOM-contract checks. Browser QA remains separate.`);
