// filters.js — which trophies a view shows: the kind chips (story, missable,
// collectibles, activities, free roam, money, online), the grade and status
// selects, the search box, and the spoiler rule that decides what a trophy
// may show before it is earned.

import { isEarned, spoilersOn } from './store.js';

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  world: 'Free roam',
  money: 'Money',
  meta: 'Platinum path',
  online: 'Online',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

// The spoiler rule: with spoilers hidden, a story trophy the player has not
// earned yet shows neither its name nor its description, and a trophy
// PlayStation keeps hidden keeps its secret the same way. Earned trophies
// always show in full, and turning the setting off shows everything.
export function maskedBySpoilers(trophy) {
  if (!spoilersOn() || isEarned(trophy.id)) return false;
  return trophy.kind === 'story' || trophy.hidden === true;
}

export function displayName(trophy) {
  if (!maskedBySpoilers(trophy)) return trophy.name;
  return trophy.kind === 'story' ? 'Story trophy — spoiler protected' : 'Hidden trophy';
}

export function displayDescription(trophy) {
  if (!maskedBySpoilers(trophy)) return trophy.description;
  return trophy.kind === 'story'
    ? 'Name and description held back by the spoiler setting until you earn it.'
    : 'PlayStation keeps this trophy hidden until it is earned.';
}

export function matchesFilters(trophy, f) {
  if (f.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (f.kind === 'online') {
    return false; // the official PS5 list has no online trophies at all
  } else if (f.kind !== 'all' && trophy.kind !== f.kind) {
    return false;
  }
  if (f.grade !== 'all' && trophy.grade !== f.grade) return false;
  if (f.status === 'earned' && !isEarned(trophy.id)) return false;
  if (f.status === 'todo' && isEarned(trophy.id)) return false;
  if (f.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(f.query.toLowerCase())) return false;
  }
  return true;
}

// The next trophy to chase: the first unearned one in roadmap order
// (stage, then the official list order), for the header's "Next up" line.
export function nextUp(trophies) {
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  return ordered.find((t) => !isEarned(t.id)) ?? null;
}
