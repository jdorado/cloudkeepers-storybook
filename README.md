# Cloudkeepers

A complete playable family browser game: rescue twelve animals across floating islands, unlock twelve ways to travel, and bring everyone home. The renderer uses plain HTML, CSS and JavaScript with original local artwork. Optional parent sign-in uses the shared Learning Games Clerk application and saves to the shared Atlas `learning_games.game_saves` collection, scoped by the server-owned game ID and verified parent ID.

## Play

```sh
cd /Users/juancamilo/dev/cloudkeepers
npm run dev
```

Open http://127.0.0.1:4317. Choose either child profile at the top and edit its nickname. Both explorers have independent saved adventures and maths settings. Settings also offer UK pounds/pence or UAE dirhams.

- Tap **Start adventure** or the island animal to begin.
- Answer using the choices or by typing a numeric answer.
- Each correct answer earns one cloud star. Mistakes never remove stars. Hints and read-aloud support the learner; there is no timer.
- At **3 stars**, unlock the transport. Travel onward when you choose.
- At **5 stars**, rescue the animal. Every rescued friend stays in your travelling crew.
- Use the sky map to return to any open island for missed friends.
- Win by rescuing all twelve animals, reaching **Cloudkeeper Haven**, and lighting its home beacon. Arrival alone is not enough.

Walk with arrow keys/WASD or tap the grass. The cottage, journal, map and explorer are interactive. Day/moonlight, gentle synthesized sounds and explorer glow are optional.

Guest progress saves automatically in this browser on this device. A parent can use **Options → Continue with Google** to make MongoDB the canonical save and continue on another device. Signed-in and guest saves remain separate. Read-aloud uses the browser's installed speech voices.

## Maths and progression

The twelve islands introduce place value, addition, subtraction, multiplication, division, fractions of amounts, fractions, money, measurement, time, shapes/perimeter and charts. The final island mixes chart questions with earlier topics.

Year 1 uses counting, smaller numbers, sharing and grouping, halves/quarters, simple money, comparing lengths, o'clock/half past and basic shapes/charts. Year 3 adds hundreds/tens/ones, three-digit arithmetic and exchanging, 3/4/8 tables and two-digit × one-digit, unit/non-unit fractions, tenths, equivalence and same-denominator operations, change, metric conversions, five-minute clocks/durations/Roman clock faces, perimeter and interpreting charts.

This repertoire practises selected skills from the [English mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study). It is a game for practice, not a complete replacement for the school programme. Feedback from young co-designers can guide later content and design changes.

Questions are generated from numbers and templates, with no AI service. Recent questions are avoided, choices never contain equivalent duplicates, and fraction equivalence is recognised when checking answers. Each topic has three difficulty bands: three clean first-try answers raise the band; two incorrect attempts lower it. Hint-assisted/retried answers earn stars without forcing harder questions. Year 1 and Year 3 keep separate skill records. Grown-up corner shows practice totals and topic summaries, and can reset just the selected explorer.

## Build and verify

```sh
npm test
npm run build
npm run preview
```

The browser build is emitted to `dist/`. Vercel serves that build and the two functions in `api/`. Use `preview` after stopping the dev server, or choose another port with `PORT=4318 npm run preview`. All artwork and fonts are local, and there is no analytics.

Tests sample 14,400 generated questions, independently check arithmetic from learner-facing prompts, simulate both complete journeys with backtracking, validate save/restore and adaptive rules, and reject stale/double answer submissions. Browser QA covers wrong/right/typed answers, rewards, travel/backtracking, crew, profiles, reload and small screens.

## Making it together

A child co-designer can start by changing one animal's name or island story in **adventure.js**, saving and reloading to see it in the map, journal and scene. The `ISLANDS` list is deliberately readable. Transport drawings live in **vehicles.js**; maths templates and hints in **questions.js**. **journey-ui.js** connects rules to the game, while **game.js** handles walking, profiles, sound and scenery. **style.css** and **play.css** define the visual design.

The game includes five scenic environments with themed variants across twelve islands, twelve animal characters, and twelve SVG transports. Original asset prompts and roles are documented in [ART_DIRECTION.md](ART_DIRECTION.md).

## Platform identity

- Stable game ID: `cloudkeepers-storybook`
- Public repository: `https://github.com/jdorado/cloudkeepers-storybook`
- Vercel project: `cloudkeepers-storybook`
- Production origin: `https://cloudkeepers-storybook.eztudy.space`
- Shared Atlas binding: `learning-games`; database `learning_games`, collection `game_saves`
- Shared parent identity: existing Clerk Learning Games production application and Google connection

The similarly named `cloudkeepers` repository, Vercel project and domain belong to a separate game. Both reuse the same Clerk and Atlas setup; their server-owned game IDs isolate saves. Reuse the working private provider bindings instead of creating another database credential. Independent external operators supply their own provider configuration.
