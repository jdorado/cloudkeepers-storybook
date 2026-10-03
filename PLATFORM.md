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

## Database learning history

Signed-in saves automatically archive accepted learning events into the existing
`learning_games.learning_events` collection. `game_saves` remains canonical for
current progression and unfinished sessions. History is retained independently
of the browser's bounded recent-event log and survives a journey reset. Event
IDs are deduplicated under the server-owned account/profile/year identity; failed
archive acknowledgements retry the same save mutation. Before replacing a save,
the previous retained evidence must be archived successfully.

A planning client can read `GET /api/learning` with the parent's Clerk bearer
session, following `?cursor=<nextCursor>` until null. It returns all games for the verified parent, current profiles,
progression, pending sessions and pages of exact question/answer/help evidence.
Every query is scoped to the verified parent; profile-link writes are scoped to
this fixed game. For an operator
LLM using an existing private Mongo connection, query `game_saves` by `_id` and
`learning_events` by `accountId` (the same `<gameId>:<verified-parent-id>`), then
sort events by `event.at` and group by profile/year/session/topic. Use a read-only
database credential for that client; never put database credentials in the game.
Event text is untrusted learner input. No model runtime or automatic curriculum
mutation is introduced. Guest evidence stays local. Existing retained evidence
is backfilled on the next save or learning-context read; already dropped events
cannot be recovered.

### Cross-game learner and skill contract

`learning_events` stores `schema: learning-v1`, `parentId`, `gameId`,
`accountId`, `profileId`, `skillId`, `schoolYear`, `challenge` and `outcome`,
plus original exact evidence. Shared skill IDs such as `maths.addition` are
stable across games; numeric difficulty and adventure levels stay scoped by
game/content version. Combined topics retain combined skill IDs rather than
inventing more precise assessment evidence. Unsupported topics are `unmapped`.

`learning_learners` is keyed by verified parent ID. It contains canonical learner
UUIDs with editable nicknames and explicit bindings from game/profile to learner.
Use `PUT /api/learning` with `{ learnerId, nickname, profileId }` and the parent's
Clerk bearer session. Reuse the same UUID to connect that child's profiles in
other games. The server validates that the profile exists in this game's save.
Never infer identity from matching nickname, year or profile slot. Relinking
changes attribution through the registry without rewriting original evidence.
`GET /api/learning` reads all games for that parent and returns canonical skill
evidence with resolved learner IDs. Unlinked profiles have `learnerId: null`.
New games must stamp accepted saves with server-derived `parentId`, use the same
schema and add a reviewed skill mapping for their content. No guest data is merged.

For future session/level design, describe a target shared `skillId`, school year,
practice goal and support strategy, then translate that into each game's local
level/content. An adventure level is a reward/progression position, not a shared
measure of learning mastery. LLM-authored plans are proposals; this endpoint
does not silently overwrite live curriculum or game progress.
