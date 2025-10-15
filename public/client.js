const $ = (id) => document.getElementById(id);

/* ---------------------------
   Tiny helpers
----------------------------*/
function toast(msg, ms = 2200) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => (t.hidden = true), ms);
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();
  if (ct.includes('application/json')) {
    try { return JSON.parse(txt); } catch { return { ok: false, error: txt }; }
  }
  return { ok: false, error: txt };
}

function fileBadge(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const type = ext === 'pdf' ? 'PDF' : ext === 'docx' ? 'DOCX' : ext === 'txt' ? 'TXT' : ext.toUpperCase();
  return `<span class="badge">${type}</span>`;
}

function setProgress(perc) {
  const prog = $('progress'), bar = $('progressBar');
  if (!prog || !bar) return;
  prog.hidden = false;
  bar.style.width = `${Math.max(0, Math.min(perc, 100))}%`;
}

/* ---------------------------
   Theme toggle (renamed key)
----------------------------*/
(function initTheme() {
  const root = document.documentElement;
  const key = 'unthinkable-theme';
  const saved = localStorage.getItem(key);
  if (saved === 'light') root.classList.add('light');
  const btn = $('themeBtn');
  if (btn) btn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem(key, root.classList.contains('light') ? 'light' : 'dark');
  });
})();

/* ---------------------------
   Health + Model tag (Status)
----------------------------*/
async function refreshHealth() {
  const j = await fetchJSON('/health');
  const server = $('statServer'), chunks = $('statChunks'), model = $('statModel'), modelTag = $('modelTag');
  if (server) {
    server.textContent = j.ok ? 'Online' : 'Error';
    server.classList.toggle('err', !j.ok);
    server.classList.toggle('ok', !!j.ok);
  }
  if (chunks) chunks.textContent = j.ok ? j.chunks : '—';
  if (model) model.textContent = j.model || '—';
  if (modelTag) modelTag.textContent = `Model: ${j.model || '—'}`;
}
setInterval(refreshHealth, 10000);

/* ---------------------------
   Selection + Dropzone
----------------------------*/
let pendingFiles = [];

function renderSelected() {
  const list = $('selectedList');
  if (!list) return;
  if (!pendingFiles.length) {
    list.classList.add('empty');
    list.innerHTML = 'No files selected yet.';
    return;
  }
  list.classList.remove('empty');
  list.innerHTML = pendingFiles.map(f =>
    `<div class="file-item">
      ${fileBadge(f.name)}
      <div>${f.name}</div>
      <div class="muted small">(${Math.ceil(f.size/1024)} KB)</div>
    </div>`
  ).join('');
}

function addFiles(fileList) {
  const seen = new Set(pendingFiles.map(f => `${f.name}|${f.size}|${f.lastModified}`));
  for (const f of fileList) {
    const key = `${f.name}|${f.size}|${f.lastModified}`;
    if (!seen.has(key)) pendingFiles.push(f);
  }
  renderSelected();
}

function clearSelection() {
  pendingFiles = [];
  renderSelected();
  const input = $('files');
  if (input) input.value = '';
}

const dropZone = $('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  });
  dropZone.addEventListener('click', () => $('files')?.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('files')?.click(); }
  });
}

$('files')?.addEventListener('change', (e) => { if (e.target.files?.length) addFiles(e.target.files); });
$('selectBtn')?.addEventListener('click', () => $('files')?.click());
$('clearSelectedBtn')?.addEventListener('click', clearSelection);

/* ---------------------------
   Upload
----------------------------*/
$('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!pendingFiles.length) return toast('Choose or drop at least one file');

  const form = new FormData();
  for (const f of pendingFiles) form.append('files', f);

  const us = $('uploadStatus');
  if (us) us.textContent = '';
  setProgress(10);
  try {
    const j = await fetchJSON('/upload', { method: 'POST', body: form });
    if (!j.ok) {
      if (us) {
        us.innerHTML = `Error: ${
          typeof j.error === 'string' ? j.error :
          (j.error?.message || JSON.stringify(j.error))
        }` + (j.error?.details ? `<br>${escapeHtml(JSON.stringify(j.error.details))}` : '');
      }
      setProgress(0); $('progress').hidden = true;
      return;
    }
    const lines = (j.results || []).map(r => {
      if (r.error) return `• ${escapeHtml(r.file)} — <span class="err">ERROR: ${escapeHtml(r.error)}</span>`;
      return `• ${escapeHtml(r.file)} — <span class="ok">chunks: ${r.chunksAdded}</span>`;
    });
    if (us) us.innerHTML = `Indexed:<br>${lines.join('<br>')}<br><b>Total chunks:</b> ${j.chunks}`;
    setProgress(100);
    setTimeout(() => { $('progress').hidden = true; setProgress(0); }, 600);
    clearSelection();
    refreshHealth();
    toast('Upload & indexing complete');
  } catch (err) {
    if (us) us.textContent = 'Error: ' + (err?.message || err);
    setProgress(0); $('progress').hidden = true;
  }
});

/* ---------------------------
   Suggestions
----------------------------*/
$('examplesBtn')?.addEventListener('click', async () => {
  const box = $('examples');
  if (!box) return;
  const j = await fetchJSON('/suggest');
  box.innerHTML = (j.suggestions || []).map(s =>
    `<button class="chip" data-q="${escapeHtml(s)}">${escapeHtml(s)}</button>`
  ).join('');
  box.hidden = !box.hidden;
});

$('examples')?.addEventListener('click', (e) => {
  const t = e.target;
  if (t.classList.contains('chip')) {
    const q = t.getAttribute('data-q') || t.textContent;
    const qEl = $('question');
    if (qEl) qEl.value = q;
  }
});

/* ---------------------------
   Ask
----------------------------*/
$('askBtn')?.addEventListener('click', async () => {
  const qEl = $('question');
  if (!qEl) return;
  const question = qEl.value.trim();
  const tkEl = $('topK');
  const topK = parseInt((tkEl?.value || '5'), 10);
  if (!question) return toast('Type a question');

  const health = await fetchJSON('/health');
  if (!health.ok || (health.chunks|0) === 0) {
    return toast('Please upload and index a document first');
  }

  const ans = $('answer'), cites = $('citations'), box = $('citesBox');
  if (ans) ans.textContent = 'Thinking…';
  if (cites) cites.textContent = '';
  if (box) box.open = false;

  const j = await fetchJSON('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, topK })
  });

  if (!j.ok) {
    if (ans) ans.textContent = 'Error: ' + (typeof j.error === 'string' ? j.error : JSON.stringify(j.error));
    return;
  }

  if (ans) ans.textContent = j.answer || 'No answer';
  if (cites) {
    cites.innerHTML = (j.citations || [])
      .map(c => `[#${c.id} • ${escapeHtml(c.source)} • score ${c.score}]`)
      .join(' ');
  }
  if ((j.citations || []).length && box) box.open = true;

  refreshHealth();
});

/* ---------------------------
   Reset KB
----------------------------*/
$('resetBtn')?.addEventListener('click', async () => {
  const confirmReset = confirm('This will remove all indexed chunks and delete uploaded files. Continue?');
  if (!confirmReset) return;

  const j = await fetchJSON('/reset', { method: 'POST' });
  if (!j.ok) {
    toast('Reset failed');
    return;
  }

  const us = $('uploadStatus');
  if (us) us.innerHTML = `✅ ${j.message || 'Knowledge base cleared.'} <br><span class="small muted">Files removed: ${j.filesRemoved ?? '—'}</span>`;
  const ans = $('answer'), cites = $('citations'), box = $('citesBox');
  if (ans) ans.textContent = '—';
  if (cites) cites.textContent = '';
  if (box) box.open = false;

  const input = $('files');
  if (input) input.value = '';
  if (typeof pendingFiles !== 'undefined') pendingFiles = [];
  const list = $('selectedList');
  if (list) { list.classList.add('empty'); list.textContent = 'No files selected yet.'; }

  refreshHealth();
  toast('All documents and chunks removed');
});

/* ---------------------------
   Copy & clear
----------------------------*/
$('copyBtn')?.addEventListener('click', async () => {
  const txt = $('answer')?.textContent || '';
  try { await navigator.clipboard.writeText(txt); toast('Answer copied'); } catch { toast('Copy failed'); }
});
$('clearAnsBtn')?.addEventListener('click', () => {
  const ans = $('answer'), cites = $('citations'), box = $('citesBox');
  if (ans) ans.textContent = '—';
  if (cites) cites.textContent = '';
  if (box) box.open = false;
});

/* ---------------------------
   Utilities
----------------------------*/
function escapeHtml(s){
  return (s || '').replace(/[&<>\"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

/* Init */
renderSelected();
refreshHealth();
