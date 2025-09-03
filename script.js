// ===== Utilities =====
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Persisted state helpers
const storage = {
  get: (k, d=null) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  push: (k, v) => { const arr = storage.get(k, []); arr.push(v); storage.set(k, arr); return arr; }
};

// ===== Theme Toggle (light/dark) =====
(() => {
  const root = document.documentElement;
  const current = storage.get('theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  root.setAttribute('data-theme', current);
  const btn = $('#themeToggle');
  const icon = btn?.querySelector('img');
  if (icon) icon.src = current === 'dark' ? 'assets/icon-sun.svg' : 'assets/icon-moon.svg';
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    if (icon) icon.src = next === 'dark' ? 'assets/icon-sun.svg' : 'assets/icon-moon.svg';
    storage.set('theme', next);
  });
})();

// ===== Mobile Nav =====
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Mock API Layer =====
// This simulates a networked API without needing a server.
// Replace endpoints here with real fetch() calls later.
const api = {
  postWaitlist: async (email) => {
    await new Promise(r => setTimeout(r, 400)); // simulate latency
    const entry = { email, joinedAt: new Date().toISOString() };
    storage.push('waitlist', entry);
    return { ok: true, entry };
  },
  generatePlaybook: async ({ role, junior=false }) => {
    await new Promise(r => setTimeout(r, 350));
    // simple deterministic "AI" template
    const level = junior ? 'Junior' : 'Senior';
    const keywords = role.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0,5);
    return {
      role,
      level,
      sourcing_queries: [
        `("${role}" OR ${keywords.map(k=>'"'+k+'"').join(' OR ')}) AND ("remote" OR "hybrid")`,
        `site:linkedin.com/in "${role}" ${keywords.map(k=>'+"'+k+'"').join(' ')}`,
        `site:github.com stars:>50 ${keywords[0] ? 'topic:'+keywords[0] : ''}`
      ],
      outreach_snippet: `Hi—noticed your experience with ${keywords.slice(0,3).join(', ')}. We're scaling a ${level.toLowerCase()} ${role} role with clear impact and fast feedback loops. Open to a 15-min chat?`,
      screening_rubric: [
        `Systems thinking (${level} depth): architecture trade-offs, latency/error budgets`,
        `Code fluency: ${keywords.slice(0,2).join(' & ')}; testing discipline`,
        `Product sense: user impact, iteration speed, learnings`,
        `Communication: concise written + async updates`
      ]
    };
  },
  semanticSearch: async (q) => {
    await new Promise(r => setTimeout(r, 200));
    const corpus = [
      { title: 'Revenue Sharing', text: 'Aligned incentives across brokers and partners with transparent splits.' },
      { title: 'Marketing Engine', text: 'Always-on campaigns that compound reach without adding headcount.' },
      { title: 'Broker Community', text: 'A curated, competitive network that rewards quality and speed.' },
      { title: 'AI Learning Platform', text: 'Onboarding, playbooks, and search augmented by AI for faster placements.' },
      { title: 'Community Hub', text: 'Profiles, referrals, leaderboards with invite-only reputation.' },
      { title: 'AI Playbooks', text: 'Guided flows for sourcing, outreach, screening from a job description.' }
    ];
    const norm = q.toLowerCase();
    const results = corpus
      .map(item => ({ ...item, score: (item.title + ' ' + item.text).toLowerCase().split(norm).length - 1 }))
      .filter(x => x.score > 0)
      .sort((a,b)=>b.score-a.score)
      .slice(0,5);
    return results;
  }
};

// ===== Waitlist Form Handler =====
const waitlistForm = $('#waitlistForm');
waitlistForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#email').value.trim();
  const note = waitlistForm.querySelector('.form-note');
  note.textContent = 'Submitting…';
  try {
    const res = await api.postWaitlist(email);
    note.textContent = 'Thanks! You are on the list (mock).';
    waitlistForm.reset();
  } catch (err) {
    note.textContent = 'Something went wrong. Please retry.';
  }
});

// ===== AI Playbook Generator =====
window.generatePlaybook = async function generatePlaybook(){
  const role = $('#roleInput').value.trim();
  const junior = $('#juniorMode').checked;
  const out = $('#playbookOutput');
  out.innerHTML = '<p>Generating…</p>';
  try {
    const data = await api.generatePlaybook({ role, junior });
    out.innerHTML = `
      <h3>${data.level} ${escapeHtml(data.role)} Playbook</h3>
      <div class="kv">
        <div><strong>Sourcing queries</strong><pre>${data.sourcing_queries.map(x=>'- '+x).join('\n')}</pre></div>
        <div><strong>Outreach snippet</strong><pre>${data.outreach_snippet}</pre></div>
        <div><strong>Screening rubric</strong><pre>${data.screening_rubric.map(x=>'- '+x).join('\n')}</pre></div>
      </div>
    `;
  } catch (e) {
    out.textContent = 'Could not generate a playbook (mock).';
  }
};

// ===== Semantic Search Mock =====
const searchForm = $('#searchForm');
searchForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const q = $('#searchInput').value.trim();
  const target = $('#searchResults');
  target.textContent = 'Searching…';
  const res = await api.semanticSearch(q);
  if (!res.length) {
    target.textContent = 'No matches.';
    return;
  }
  target.innerHTML = res.map(r => `<div>• <strong>${escapeHtml(r.title)}</strong> — ${escapeHtml(r.text)}</div>`).join('');
});

// Escape helper
function escapeHtml(str){ return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ===== PWA (optional, works when served over HTTP/HTTPS) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
