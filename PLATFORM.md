# Cloudkeepers storybook platform

| Resource | Value |
| --- | --- |
| Visible product name | Cloudkeepers |
| Stable game ID | `cloudkeepers-storybook` |
| Public repository | `jdorado/cloudkeepers-storybook` |
| Vercel project | `cloudkeepers-storybook` |
| Production origin | `https://cloudkeepers-storybook.eztudy.space` |
| Shared Atlas binding | Existing Cloudkeepers `learning-games` deployment/integration and working private credential |
| Mongo database / collection | `learning_games` / `game_saves` |
| Save document ID | `cloudkeepers-storybook:<verified Clerk user ID>` |
| Source license | MIT |

Production uses the existing Clerk **Learning Games** application with its Google connection. The API derives the parent identity from the verified Clerk token. Each parent owns two stable child profiles with editable nicknames. Guest data uses the game-scoped browser key `cloudkeepers-storybook:guest:v1` and never merges into an account automatically.

Reuse the existing Atlas binding and Clerk production keys; do not create a game-specific database or password. The shared credential is not a database permission boundary; each API scopes every read/write by its fixed game ID and verified parent ID. The canonical workspace contract is `specs/_game_browser-spec.md`.

Vercel owns the five server-side variables listed in `.env.example`. Secret values never enter the browser bundle or repository. The public build includes its own favicon, Apple touch icon and install manifest.

## Shared-binding status — 3 October 2026

This project is now connected to the existing `learning-games` Atlas resource
for production. Vercel installs the resource's private Mongo connection; no new
cluster, database or password was created. Production uses the existing Learning
Games Clerk application and server key. These are provider configuration checks;
a signed-in save/readback is recorded separately from configuration readiness.

Release proof is the production deployment metadata and the source commit recorded by Vercel.

## Learning evidence release — 3 October 2026

Added bounded private question/attempt/help evidence and a parent JSON export for
manual EzStudy review. Old saves remain compatible and historical evidence is not
invented. See `LEARNING_EVIDENCE.md`. Local verification: 8 tests and the
production build passed; browser checks covered answer/help and evidence download.
Deployment commit and status are available in the production deployment metadata.
