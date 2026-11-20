// main.js — boot and wiring: load the trophy data, restore the save, route
// the four views (tracker, roadmap, missables, my save) and connect the
// toolbar, the tabs and the backup buttons to the store and the views.

import {
  loadSave, onSaveChange, spoilersOn, setSpoilers,
  exportSave, importSave, resetSave, earnedCount,
} from './store.js';
import { matchesFilters } from './filters.js';
import { renderScoreboard, renderTracker, renderDetail, renderRoadmap, renderMissables } from './views.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceList = doc.sourceList ?? {};

loadSave();

const ui = {
  view: 'tracker',
  selectedId: 17, // The Shootist: a silver with a counter and a cited guide
  filters: { kind: 'all', grade: 'all', status: 'all', query: '' },
};

const byId = (id) => trophies.find((t) => t.id === id);

function render() {
  renderScoreboard(trophies);
  for (const t of [document.getElementById('spoiler-toggle'), document.getElementById('spoiler-toggle-2')]) {
    if (t) t.checked = spoilersOn();
  }
  document.querySelectorAll('#tabs .tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === ui.view);
  });
  for (const name of ['tracker', 'roadmap', 'missables', 'save']) {
    document.getElementById(`view-${name}`).hidden = ui.view !== name;
  }
  if (ui.view === 'tracker') {
    const shown = trophies.filter((t) => matchesFilters(t, ui.filters));
    const resultText = ui.filters.kind === 'online'
      ? 'Online: the official PS5 list contains no online trophies — all 55 are earned in single player.'
      : `Showing ${shown.length} of 55 trophies · ${earnedCount()} earned in all`;
    renderTracker(trophies, shown, ui.selectedId, resultText);
    renderDetail(byId(ui.selectedId), sourceList);
  } else if (ui.view === 'roadmap') {
    renderRoadmap(trophies, pickTrophy);
  } else if (ui.view === 'missables') {
    renderMissables(trophies, pickTrophy);
  }
}

function pickTrophy(id) {
  ui.selectedId = id;
  ui.view = 'tracker';
  ui.filters = { kind: 'all', grade: 'all', status: 'all', query: '' };
  document.getElementById('search').value = '';
  document.getElementById('grade-filter').value = 'all';
  document.getElementById('status-filter').value = 'all';
  document.querySelectorAll('#kind-chips .chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.kind === 'all');
  });
  render();
  document.getElementById('detail').scrollIntoView({ block: 'nearest' });
}

document.querySelectorAll('#tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    ui.view = tab.dataset.view;
    render();
  });
});

document.getElementById('trophy-list').addEventListener('click', (e) => {
  const row = e.target.closest('.trophy-row');
  if (!row) return;
  ui.selectedId = Number(row.dataset.id);
  render();
});

document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    ui.filters.kind = chip.dataset.kind;
    document.querySelectorAll('#kind-chips .chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
    });
    render();
  });
});

document.getElementById('grade-filter').addEventListener('change', (e) => {
  ui.filters.grade = e.target.value;
  render();
});
document.getElementById('status-filter').addEventListener('change', (e) => {
  ui.filters.status = e.target.value;
  render();
});
document.getElementById('search').addEventListener('input', (e) => {
  ui.filters.query = e.target.value.trim();
  render();
});

for (const id of ['spoiler-toggle', 'spoiler-toggle-2']) {
  document.getElementById(id).addEventListener('change', (e) => setSpoilers(e.target.checked));
}

document.getElementById('export-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportSave()], { type: 'application/json' }));
  a.download = 'leonida-list-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  document.getElementById('save-status').textContent = 'Exported — keep the file somewhere safe.';
});

document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const status = document.getElementById('save-status');
  if (!file) return;
  try {
    importSave(await file.text());
    status.textContent = `Imported: ${earnedCount()} of 55 trophies marked earned.`;
  } catch (err) {
    status.textContent = `Import failed: ${err.message}`;
  }
  e.target.value = '';
  render();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!window.confirm('Clear every tick, counter and note from this browser?')) return;
  resetSave();
  document.getElementById('save-status').textContent = 'Progress cleared. A fresh run through Leonida awaits.';
  render();
});

onSaveChange(render);
render();
