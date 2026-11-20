# The Leonida List — GTA VI Trophy Tracker & Platinum Roadmap

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kuni29/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kuni29/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A make.fun bounty entry for [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

A trophy tracker and platinum roadmap for Grand Theft Auto VI on PS5. All 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 of them hidden) carry an original, self-written guide with resolved source citations, a kind/stage classification and a PSN earn-rate target. Five trophies are flagged as missable, each with its reasoning.

## What's inside

- `app/` — a dependency-free vanilla-JS tracker: check off trophies as you earn them (progress persists in localStorage), live counters, per-trophy notes, export/import of your progress, text search, kind chips, grade and status filters, and spoiler masking for hidden trophies.
- A 7-stage platinum roadmap page and a missables page, generated from the same data.
- `app/data/trophies.json` — the full trophy dataset with guides and citations.
- `main.ts` — builds the entry dossier from the app and screenshots.
- `screenshots/` — four renders of the app (tracker, roadmap, missables, spoiler view).

## Run it

Open `app/index.html` in a browser, or serve the folder with `serve.ts`. Run `node main.ts` to rebuild the dossier.
