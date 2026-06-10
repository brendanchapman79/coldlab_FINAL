// ── DARK MODE ────────────────────────────────────────────────────────────────
const THEME_KEY = 'cl-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀ light' : '☾ dark';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Run immediately to prevent flash of wrong theme
initTheme();


// ── PARTIALS ─────────────────────────────────────────────────────────────────
async function injectPartial(id, path) {
  try {
    const el = document.getElementById(id);
    if (!el) return;
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Failed to load partial: ${path}`);
    el.innerHTML = await r.text();
    // Wire up theme toggle after nav is injected
    const btn = document.getElementById('theme-btn');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      btn.textContent = theme === 'dark' ? '☀ light' : '☾ dark';
    }
  } catch(e) { console.error(e); }
}


// ── MARKDOWN ──────────────────────────────────────────────────────────────────
async function renderMarkdownFile(targetId, path) {
  const el = document.getElementById(targetId);
  if (!el) return;
  try {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Failed to load markdown: ${path}`);
    const text = await r.text();
    el.innerHTML = (typeof marked !== 'undefined') ? marked.parse(text) : text;
  } catch(e) { console.error(e); }
  // Returns after innerHTML is set so callers can .then() chain
}


// ── TEAM PHOTO INJECTION ──────────────────────────────────────────────────────
// Scans rendered markdown for matching h3 names and wraps them with a headshot.
// Image files must live at: assets/img/{firstname-lastname}.jpg
// Add names here as the team changes — .md file needs no modification.

const PHOTO_MEMBERS = [
  'Dr Brendan Chapman',
  'Sara Natale',
  'Ruby Dixon',
  'Aaron Hamilton',
  'Heather McKenna',
];

function injectTeamPhotos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('h3').forEach(h3 => {
    const nameRaw = h3.textContent.trim();
    const match = PHOTO_MEMBERS.find(m =>
      nameRaw.includes(m) || m.includes(nameRaw.split(',')[0].trim())
    );
    if (!match) return;

    // Build image slug: "Dr Brendan Chapman" → "brendan-chapman"
    const slug = match
      .replace(/^Dr\s+/i, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Collect h3 + following content siblings until next heading
    const toMove = [];
    let next = h3.nextElementSibling;
    while (next && !['H2','H3','H4'].includes(next.tagName)) {
      toMove.push(next);
      next = next.nextElementSibling;
    }

    // Build layout
    const wrapper = document.createElement('div');
    wrapper.className = 'team-member';

    const photoWrap = document.createElement('div');
    photoWrap.className = 'team-photo-wrap';

    const img = document.createElement('img');
    img.src = `assets/img/${slug}.jpg`;
    img.alt = match;
    img.className = 'team-photo';
    img.onerror = function() { this.closest('.team-photo-wrap').style.display = 'none'; };

    photoWrap.appendChild(img);

    const textWrap = document.createElement('div');
    textWrap.className = 'team-text';
    textWrap.appendChild(h3.cloneNode(true));
    toMove.forEach(el => textWrap.appendChild(el.cloneNode(true)));

    wrapper.appendChild(photoWrap);
    wrapper.appendChild(textWrap);

    // Swap in wrapper, remove originals
    h3.replaceWith(wrapper);
    toMove.forEach(el => el.remove());
  });
}


// ── ORCID PUBLICATIONS ────────────────────────────────────────────────────────
const ORCID_ID = '0000-0001-7518-6645';

async function loadPublications(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="pub-status"><span class="pub-spinner"></span> Loading publications from ORCID…</div>`;

  try {
    const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`ORCID API returned ${res.status}`);
    const data = await res.json();
    const groups = data.group || [];

    if (!groups.length) {
      container.innerHTML = `<div class="pub-status">No public publications found on ORCID.</div>`;
      return;
    }

    // Extract and sort publications newest first
    const pubs = groups.map(g => {
      const s = g['work-summary'][0];
      const title   = s?.title?.title?.value || 'Untitled';
      const year    = s?.['publication-date']?.year?.value || '';
      const type    = (s?.type || '').replace(/-/g, ' ');
      const journal = s?.['journal-title']?.value || '';
      const doi     = (s?.['external-ids']?.['external-id'] || [])
                        .find(e => e['external-id-type'] === 'doi');
      const url     = doi ? `https://doi.org/${doi['external-id-value']}` : null;
      return { title, year, type, journal, url };
    }).sort((a, b) => (b.year || 0) - (a.year || 0));

    // Year filter buttons
    const years = [...new Set(pubs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    const filterHtml = `
      <div class="pub-filters">
        <button class="filter-btn active" data-year="all">All (${pubs.length})</button>
        ${years.map(y => `<button class="filter-btn" data-year="${y}">${y}</button>`).join('')}
      </div>`;

    const listHtml = `<div class="pub-list">${pubs.map(pubCard).join('')}</div>`;
    container.innerHTML = filterHtml + listHtml;

    // Wire year filters
    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const year = btn.dataset.year;
        container.querySelectorAll('.pub-item').forEach(item => {
          item.style.display = (year === 'all' || item.dataset.year === year) ? '' : 'none';
        });
      });
    });

  } catch(e) {
    console.error(e);
    container.innerHTML = `
      <div class="pub-status" style="color:#e06060">
        Could not load publications from ORCID.
        <a href="https://orcid.org/${ORCID_ID}" target="_blank" rel="noopener"
           class="text-link" style="margin-left:8px">View on ORCID →</a>
      </div>`;
  }
}

function pubCard(p) {
  const titleHtml = p.url
    ? `<a href="${p.url}" target="_blank" rel="noopener">${escHtml(p.title)}</a>`
    : escHtml(p.title);
  return `
    <div class="pub-item" data-year="${p.year}">
      <div class="pub-title">${titleHtml}</div>
      <div class="pub-meta">
        ${p.year    ? `<span class="pub-year">${p.year}</span>` : ''}
        ${p.journal ? `<span class="pub-journal">${escHtml(p.journal)}</span>` : ''}
        ${p.type    ? `<span class="pub-type">${p.type}</span>` : ''}
        ${p.url     ? `<a href="${p.url}" target="_blank" rel="noopener"
                          style="color:var(--blue);font-size:0.72rem">DOI →</a>` : ''}
      </div>
    </div>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
