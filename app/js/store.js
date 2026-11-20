// store.js — the player's save: earned ticks, progress counters, notes and
// settings, kept in localStorage and exportable to a JSON file. Nothing here
// touches the network; the save never leaves the browser unless the player
// exports it themselves.

const STORAGE_KEY = 'leonida-list-save-v1';

const blankSave = () => ({
  earned: {},   // trophy id -> true
  counts: {},   // trophy id -> number done toward its PSN target
  notes: {},    // trophy id -> the player's own note
  settings: { spoilers: true },
});

let save = blankSave();
let listener = null;

export function onSaveChange(fn) {
  listener = fn;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Storage full or blocked: the in-memory save still works for the session.
  }
  if (listener) listener();
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      save = {
        earned: parsed.earned ?? {},
        counts: parsed.counts ?? {},
        notes: parsed.notes ?? {},
        settings: { spoilers: parsed.settings?.spoilers !== false },
      };
    }
  } catch {
    save = blankSave();
  }
  return save;
}

export function isEarned(id) {
  return save.earned[id] === true;
}

export function earnedCount() {
  return Object.values(save.earned).filter(Boolean).length;
}

export function setEarned(id, on) {
  if (on) save.earned[id] = true;
  else delete save.earned[id];
  persist();
}

export function getCount(id) {
  return save.counts[id] ?? 0;
}

export function setCount(id, n) {
  const v = Math.max(0, Math.floor(Number(n) || 0));
  if (v === 0) delete save.counts[id];
  else save.counts[id] = v;
  persist();
}

export function getNote(id) {
  return save.notes[id] ?? '';
}

export function setNote(id, text) {
  if (text) save.notes[id] = text;
  else delete save.notes[id];
  persist();
}

export function spoilersOn() {
  return save.settings.spoilers;
}

export function setSpoilers(on) {
  save.settings.spoilers = on === true;
  persist();
}

export function exportSave() {
  return JSON.stringify({ app: 'the-leonida-list', version: 1, ...save }, null, 2);
}

export function importSave(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || typeof parsed.earned !== 'object') {
    throw new Error('That file is not a Leonida List progress export.');
  }
  save = {
    earned: parsed.earned ?? {},
    counts: parsed.counts ?? {},
    notes: parsed.notes ?? {},
    settings: { spoilers: parsed.settings?.spoilers !== false },
  };
  persist();
  return save;
}

export function resetSave() {
  save = blankSave();
  persist();
}
