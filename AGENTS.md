# Cloudkeepers

Standalone family browser game. This is not an AIFit or Ez project.

- The family has now authorised the complete playable game: 12 islands, Year 1 and Year 3 maths, adaptive questions, separate player saves, animal rescues, travel unlocks, and a homecoming requiring all twelve animals.
- Keep a playful, premium storybook look, with original local assets, touch and keyboard controls, and accessible dialogs.
- Keep the renderer dependency-free. Clerk and MongoDB are the only runtime dependencies for the shared learning-game save boundary. Run `npm run dev`, inspect it in a browser, and use `npm run build` to verify a shareable build.
- Preserve progress in parent-owned profiles with stable IDs and editable nicknames. Signed-in saves are canonical in the shared `learning_games.game_saves` collection under the server-owned game/parent key; guest saves stay separate on the device. Three correct-answer stars unlock transport; five allow a rescue. Travel does not rescue animals. Winning requires every animal, the final island, and its home beacon.
- The stable infrastructure identity is `cloudkeepers-storybook`; the visible game name remains `Cloudkeepers`. Keep its repository, Vercel project and domain separate from the reference `cloudkeepers` game. Reuse the reference’s existing Atlas `learning-games` binding, working private credential, `learning_games.game_saves` and Clerk Learning Games production application/Google connection. Do not provision another database/password or Clerk application. Follow `/Users/juancamilo/dev/specs/_game_browser-spec.md`.
- The child is a co-designer. Honour her creative descriptions; tentative island/animal names are concept art, not fixed curriculum design.
