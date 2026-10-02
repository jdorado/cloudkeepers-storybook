# Cloudkeepers storybook platform

| Resource | Value |
| --- | --- |
| Visible product name | Cloudkeepers |
| Stable game ID | `cloudkeepers-storybook` |
| Public repository | `jdorado/cloudkeepers-storybook` |
| Vercel project | `cloudkeepers-storybook` |
| Production origin | `https://cloudkeepers-storybook.eztudy.space` |
| Mongo database | `cloudkeepers_storybook` |
| Save document ID | `cloudkeepers-storybook:<verified Clerk user ID>` |
| Source license | MIT |

Production uses the existing Clerk **Learning Games** application with its Google connection. The API derives the parent identity from the verified Clerk token. Each parent owns two stable child profiles with editable nicknames. Guest data uses the game-scoped browser key `cloudkeepers-storybook:guest:v1` and never merges into an account automatically.

Vercel owns the five server-side variables listed in `.env.example`. Secret values never enter the browser bundle or repository. The public build includes its own favicon, Apple touch icon and install manifest.

Release proof is the `production` deployment for this project and the annotated `v1.0.0` Git tag; both must resolve to the same commit.
