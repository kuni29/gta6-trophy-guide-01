// views.js — rendering: the header scoreboard, the checklist rows, the detail
// pane with a trophy's cited guide, the roadmap's seven stages and the
// missable cards. Pure DOM building from the trophy data and the save.

import {
  isEarned, setEarned, getCount, setCount, getNote, setNote, earnedCount,
} from './store.js';
import {
  KIND_LABELS, GRADE_ORDER, maskedBySpoilers, displayName, displayDescription, nextUp,
} from './filters.js';

export const STAGES = [
  { n: 1, title: 'The story, start to finish', blurb: 'Play the main story in the order PlayStation lists it: the opening, Chapters 1 to 4, the named missions and the finale. All five missable moments live inside this stage — the flags below ride along with the story trophies they belong to, so check the Missables page before each big mission and keep a manual save as you go.' },
  { n: 2, title: 'Side stories & strangers', blurb: 'The named strands: Andy, Kenton, Billy, Randy and Tyrone each end in a final-mission trophy, Bret sends you after a unique animal, and finishing any eight strands earns the Strangers & Freaks silver. Strands wait for you after the story, so nothing here can be lost.' },
  { n: 3, title: 'The activities tour', blurb: 'Sample every activity type once for Master of None, then work the scored ones: 42 Shooting Range golds, a Top Fun win at all 14 drone locations, 20 different race wins, 250 stunts and 50 challenges, with fishing, the arcade, bowling and the 18 meditation spots along the way.' },
  { n: 4, title: 'Collectibles & the map', blurb: 'The state-wide sweeps: 3 complete card sets, 100 WAiNK spots, 100 vehicles discovered, 10 registered to the Scooter Bros app, and all 52 areas of Leonida explored. One district at a time — these four counters cover the same ground, so a single careful pass fills them together.' },
  { n: 5, title: 'Free-roam feats & crime', blurb: 'The one-off feats and the robbery ladder: partner wanted-level and shop-chain trophies, the stealth jewelry job, 5 bank vaults, an armored truck, one illegal operation for each of the 9 gangs, and the strange small trophies — a melee drive-by, a cocktail, a second-try success — that the descriptions only hint at.' },
  { n: 6, title: 'Money & property', blurb: 'Late-game money: $250,000 of marked bills laundered clean through your contacts, $100,000 spent across the shops, and all 8 garage properties bought. The crime sweep in stage 5 fills the account; this stage spends it where the trophies count it.' },
  { n: 7, title: '100% and the platinum', blurb: 'A Long Road asks for 100% on the game’s own completion counter — the checklist the earlier stages were quietly filling. When the last of the 54 lands, Vice Got a Price!, the platinum, is awarded on its own.' },
];

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

const medal = (grade) => el('span', `medal ${grade}`);

function gradeCounts(trophies) {
  const out = {};
  for (const g of GRADE_ORDER) {
    const all = trophies.filter((t) => t.grade === g);
    out[g] = { earned: all.filter((t) => isEarned(t.id)).length, total: all.length };
  }
  return out;
}

export function renderScoreboard(trophies) {
  const n = earnedCount();
  document.getElementById('earned-count').textContent = String(n);
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(n));
  document.getElementById('progress-fill').style.width = `${(n / trophies.length) * 100}%`;
  const gc = gradeCounts(trophies);
  document.getElementById('grade-line').textContent =
    GRADE_ORDER.map((g) => `${g[0].toUpperCase()}${g.slice(1)} ${gc[g].earned}/${gc[g].total}`).join(' · ');
  const next = nextUp(trophies);
  const nextEl = document.getElementById('next-up');
  if (!next) {
    nextEl.textContent = 'Platinum earned — Leonida is yours.';
  } else if (maskedBySpoilers(next)) {
    nextEl.textContent = `Next up: a stage ${next.stage} story beat (spoiler protected).`;
  } else {
    nextEl.replaceChildren(
      document.createTextNode('Next up: '),
      Object.assign(el('strong', null, next.name), {}),
      document.createTextNode(` — ${next.description}`),
    );
  }
  const left = trophies.filter((t) => t.missable && !isEarned(t.id)).length;
  document.getElementById('missable-pill').textContent = String(left);
}

export function trophyRow(trophy, selectedId) {
  const row = el('li', `trophy-row${isEarned(trophy.id) ? ' earned' : ''}${trophy.id === selectedId ? ' selected' : ''}`);
  row.dataset.id = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => setEarned(trophy.id, box.checked));
  row.append(box, medal(trophy.grade));

  const main = el('div', 'row-main');
  main.append(el('div', 'row-name', displayName(trophy)), el('div', 'row-desc', displayDescription(trophy)));

  const meta = el('div', 'row-meta');
  meta.append(el('span', 'tag grade', trophy.grade));
  meta.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.missable) meta.append(el('span', 'tag miss', '⚑ Missable'));
  if (trophy.hidden && !isEarned(trophy.id)) meta.append(el('span', 'tag', 'Hidden on PSN'));
  if (trophy.target) {
    const done = getCount(trophy.id) >= trophy.target;
    meta.append(el('span', `tag count${done ? ' done' : ''}`, `${getCount(trophy.id)} / ${trophy.target} ${trophy.targetLabel}`));
  }
  if (isEarned(trophy.id)) meta.append(el('span', 'tag done', 'Earned'));
  main.append(meta);
  row.append(main);
  return row;
}

export function renderTracker(trophies, shown, selectedId, resultText) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  if (shown.length === 0) {
    list.append(el('li', 'empty-note',
      'No trophies match. The official PS5 list has no online trophies, and every filter combination that names real trophies shows them here — try clearing the search or picking another kind.'));
  } else {
    for (const t of shown) list.append(trophyRow(t, selectedId));
  }
  document.getElementById('result-line').textContent = resultText;
}

function sourceItems(trophy, sourceList) {
  const ul = el('ul', 'sources');
  for (const key of trophy.cite ?? ['list', 'own']) {
    const src = sourceList[key];
    if (!src) continue;
    const li = el('li');
    if (src.url) {
      li.append(document.createTextNode(`${src.label} — `));
      const a = el('a', null, src.url.replace('https://', ''));
      a.href = src.url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      li.append(a);
    } else {
      li.textContent = src.label;
    }
    ul.append(li);
  }
  return ul;
}

export function renderDetail(trophy, sourceList) {
  const pane = document.getElementById('detail');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', null, 'Pick a trophy from the list to read its guide.'));
    return;
  }
  const masked = maskedBySpoilers(trophy);

  const kicker = el('div', 'd-kicker');
  kicker.append(medal(trophy.grade), el('span', 'tag grade', trophy.grade),
    el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind),
    el('span', 'tag', `Roadmap stage ${trophy.stage}`));
  if (trophy.missable) kicker.append(el('span', 'tag miss', '⚑ Missable'));
  pane.append(kicker, el('h2', null, displayName(trophy)), el('p', 'd-desc', displayDescription(trophy)));

  const earnBtn = el('button', `earn-btn${isEarned(trophy.id) ? ' is-earned' : ''}`,
    isEarned(trophy.id) ? '✓ Earned — tap to undo' : 'Mark as earned');
  earnBtn.type = 'button';
  earnBtn.addEventListener('click', () => setEarned(trophy.id, !isEarned(trophy.id)));
  pane.append(earnBtn);

  if (masked) {
    pane.append(el('h3', null, 'Spoiler protection is on'));
    pane.append(el('p', null,
      'This trophy’s name, description and guide are held back until you earn it — that is the spoiler setting doing its job. Earn it in the game, tick it here, and the full guide appears. Or turn “Hide spoilers” off in the toolbar if you would rather see everything now.'));
    return;
  }

  if (trophy.missable && trophy.missableNote) {
    pane.append(el('h3', null, '⚑ Missable — read before you play on'));
    pane.append(el('p', 'miss-note', trophy.missableNote));
  }

  pane.append(el('h3', null, 'Guide'));
  pane.append(el('p', null, trophy.guide));

  if (trophy.target) {
    pane.append(el('h3', null, 'Progress counter'));
    const box = el('div', 'counter-box');
    const minus = el('button', null, '−');
    minus.type = 'button';
    minus.addEventListener('click', () => setCount(trophy.id, getCount(trophy.id) - 1));
    const num = el('span', 'c-num');
    num.append(document.createTextNode(`${getCount(trophy.id)} `),
      el('small', null, `/ ${trophy.target} ${trophy.targetLabel}`));
    const plus = el('button', null, '+');
    plus.type = 'button';
    plus.addEventListener('click', () => setCount(trophy.id, getCount(trophy.id) + 1));
    box.append(minus, num, plus);
    pane.append(box);
  }

  pane.append(el('h3', null, 'Sources'));
  pane.append(sourceItems(trophy, sourceList));

  pane.append(el('h3', null, 'Your note'));
  const note = el('textarea', 'note');
  note.placeholder = 'Your own note for this trophy…';
  note.value = getNote(trophy.id);
  note.addEventListener('change', () => setNote(trophy.id, note.value.trim()));
  pane.append(note);
}

export function renderRoadmap(trophies, onPick) {
  const host = document.getElementById('roadmap-stages');
  host.replaceChildren();
  for (const stage of STAGES) {
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const done = inStage.filter((t) => isEarned(t.id)).length;
    const card = el('div', 'stage-card');
    const h = el('h3');
    h.append(el('span', 'stage-no', `Stage ${stage.n} · `), document.createTextNode(stage.title));
    card.append(h, el('p', 'stage-blurb', stage.blurb),
      el('p', 'stage-progress', `${done} of ${inStage.length} earned in this stage`));
    const chips = el('div', 'stage-trophies');
    for (const t of inStage) {
      const chip = el('button', `stage-chip${isEarned(t.id) ? ' done' : ''}`);
      chip.type = 'button';
      chip.append(medal(t.grade), document.createTextNode(maskedBySpoilers(t) ? displayName(t) : t.name));
      if (t.missable) chip.append(el('span', 'flag', '⚑'));
      chip.addEventListener('click', () => onPick(t.id));
      chips.append(chip);
    }
    card.append(chips);
    host.append(card);
  }
}

export function renderMissables(trophies, onPick) {
  const host = document.getElementById('missable-cards');
  host.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = el('div', 'miss-card');
    const h = el('h3');
    h.append(el('span', 'flag', '⚑ '), document.createTextNode(t.name),
      document.createTextNode(' '), el('span', 'tag grade', t.grade));
    card.append(h, el('p', 'm-desc', `“${t.description}”`),
      el('p', null, t.missableNote ?? ''),
      el('p', null, t.guide));
    const btn = el('button', 'ghost-btn', isEarned(t.id) ? '✓ Earned' : 'Open in the tracker');
    btn.type = 'button';
    btn.addEventListener('click', () => onPick(t.id));
    card.append(btn);
    host.append(card);
  }
}
