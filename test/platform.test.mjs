import assert from "node:assert/strict";
import test from "node:test";
import {
  createLibrary,
  GAME_ID,
  PROFILE_IDS,
  restoreLibrary,
} from "../library.js";
import {
  normalizeSave,
  readAccount,
  saveIdentity,
  writeAccount,
} from "../server/save-service.js";

class MemoryCollection {
  constructor() {
    this.docs = new Map();
  }
  async findOne({ _id }) {
    return this.docs.has(_id) ? structuredClone(this.docs.get(_id)) : null;
  }
  async insertOne(doc) {
    if (this.docs.has(doc._id))
      throw Object.assign(new Error("duplicate"), { code: 11000 });
    this.docs.set(doc._id, structuredClone(doc));
    return { insertedId: doc._id };
  }
  async updateOne({ _id, revision }, { $set }) {
    const current = this.docs.get(_id);
    if (!current || current.revision !== revision) return { matchedCount: 0 };
    this.docs.set(_id, { ...current, ...structuredClone($set) });
    return { matchedCount: 1 };
  }
}

const operation = (digit) =>
  `${digit.repeat(8)}-${digit.repeat(4)}-4${digit.repeat(3)}-8${digit.repeat(3)}-${digit.repeat(12)}`;

test("public defaults use stable generic child profiles", () => {
  const library = createLibrary();
  assert.equal(library.selectedProfileId, PROFILE_IDS[0]);
  assert.deepEqual(
    Object.values(library.profiles).map((profile) => profile.nickname),
    ["Player 1", "Player 2"],
  );
  library.profiles[PROFILE_IDS[0]].nickname = "  Sky  ";
  const restored = restoreLibrary(library);
  assert.equal(restored.profiles[PROFILE_IDS[0]].nickname, "Sky");
  assert.equal(restored.profiles[PROFILE_IDS[1]].data.adventure.year, 3);
});

test("save identity is game-scoped and server-owned", () => {
  assert.equal(saveIdentity("user_123"), `${GAME_ID}:user_123`);
  assert.equal(normalizeSave(createLibrary()).schemaVersion, 1);
  assert.throws(() => normalizeSave({ ...createLibrary(), profiles: {} }));
});

test("writes are idempotent, revision checked, and tenant isolated", async () => {
  const collection = new MemoryCollection();
  const first = createLibrary();
  first.profiles[PROFILE_IDS[0]].data.glow = 2;
  const input = { revision: 0, mutationId: operation("1"), save: first };
  const written = await writeAccount(collection, "parent-a", input);
  assert.equal(written.status, 200);
  assert.equal(written.body.revision, 1);
  assert.equal((await writeAccount(collection, "parent-a", input)).status, 200);

  const stale = await writeAccount(collection, "parent-a", {
    revision: 0,
    mutationId: operation("2"),
    save: createLibrary(),
  });
  assert.equal(stale.status, 409);

  const other = createLibrary();
  other.profiles[PROFILE_IDS[1]].data.glow = 1;
  assert.equal(
    (
      await writeAccount(collection, "parent-b", {
        revision: 0,
        mutationId: operation("3"),
        save: other,
      })
    ).status,
    200,
  );
  assert.equal(
    (await readAccount(collection, "parent-a")).save.profiles[PROFILE_IDS[0]]
      .data.glow,
    2,
  );
  assert.equal(
    (await readAccount(collection, "parent-b")).save.profiles[PROFILE_IDS[1]]
      .data.glow,
    1,
  );
  assert.equal(collection.docs.size, 2);
});
