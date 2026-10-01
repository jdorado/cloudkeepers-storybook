# Cloudkeepers

A family-designed browser adventure about a little explorer who rescues animals across twelve floating islands.

## Current chapter: the world and its characters

**Objective:** Make the first island tangible, beautiful, and fun to explore so Sofia and Daniela can shape its art direction.

**Constraints:** Visual prototype only; no maths exercises, earned rescues, curriculum claims, or completed level system. Keep it child-friendly, responsive, and independent of other projects. No accounts or external services.

**Owner:** The family owns the creative decisions; this project owns its scene, controls, and local preferences.

**Simplest path:** Plain HTML, CSS, and JavaScript, original local artwork, and a small Node static server. No dependencies or install step.

**Proof:** Open the real browser scene; walk using keyboard and touch; meet Pip; view the twelve-island concept map and animal journal; try day/night and both player profiles; check mobile layout and browser errors.

**Stop:** End this chapter after the visual prototype. Design the island progression with the family next, then the maths repertoire and adaptive learning.

## Run

```sh
cd /Users/juancamilo/dev/cloudkeepers
npm run dev
```

Open http://127.0.0.1:4317. Use arrow keys/WASD or tap the grass to walk. Click Pip, the cottage, the signpost, or the sky ferry. The bottom buttons open the map, journal, and explorer customisation. Preferences are stored on this browser separately for Daniela and Sofia; this is not learning progress.

`npm run build` creates a dependency-free static site in `dist/`. `npm run preview` serves that build at the same port. `PORT` can select another local port.

## Making it together

The family's next small creative task is to describe the hero: a name, an outfit, and one special thing they carry. After that, decide what to change in the first island's appearance.

For Sofia's first coding sessions, `game.js` keeps the tentative island stories in the `islands` list and animal ideas in `friends`. Changing one name or description there is a small, visible edit: save, reload, and open the sky map or journal to see the result. The numbered empty islands deliberately leave room for her own designs.

## The next two chapters

1. **Island progression:** Agree on the twelve animal and travel pairings, level order, and how travel differs from rescuing. Winning eventually requires all twelve animals together on the final island.
2. **Maths challenges:** Build curriculum-aligned challenge types for each child, followed by a varied question repertoire and adaptive difficulty. The present concept map does not assign levels or curriculum topics.

## Artwork

Original scenery and character cutouts created using the built-in image generation tool. Prompts and asset roles are in [ART_DIRECTION.md](ART_DIRECTION.md). Final assets live in `assets/`.
