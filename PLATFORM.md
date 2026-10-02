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

## Shared-binding status — 2 October 2026

Source guidance, environment examples and save scoping now target the shared
Atlas resource and `learning_games.game_saves`. Provider readback found only the
reference `cloudkeepers` project connected to that resource. The connection for
this project remains pending action-time approval; the source change is not
live Google/Mongo acceptance evidence. Do not create another Atlas password.

Release proof is the `production` deployment for this project and the annotated `v1.0.0` Git tag; both must resolve to the same commit.
