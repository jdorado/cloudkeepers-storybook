import { createHash } from "node:crypto";
import {
  CONTENT_VERSION,
  GAME_ID,
  PROFILE_IDS,
  SCHEMA_VERSION,
  restoreLibrary,
} from "../library.js";

export const MAX_BYTES = 2_000_000;

export function normalizeSave(raw) {
  if (
    !raw ||
    raw.schemaVersion !== SCHEMA_VERSION ||
    raw.contentVersion !== CONTENT_VERSION ||
    !raw.profiles ||
    Array.isArray(raw.profiles) ||
    !PROFILE_IDS.includes(raw.selectedProfileId) ||
    Buffer.byteLength(JSON.stringify(raw)) > MAX_BYTES
  )
    throw new Error("Invalid Cloudkeepers save.");
  for (const id of PROFILE_IDS) {
    const profile = raw.profiles[id];
    if (
      !profile ||
      typeof profile.nickname !== "string" ||
      !profile.nickname.trim() ||
      profile.nickname.length > 30 ||
      !profile.data
    )
      throw new Error("Invalid child profile.");
  }
  return restoreLibrary(raw);
}

export function saveIdentity(userId) {
  return `${GAME_ID}:${userId}`;
}

export function publicSave(doc) {
  if (!doc) return { revision: 0, save: null, updatedAt: null };
  const {
    schemaVersion,
    contentVersion,
    selectedProfileId,
    profiles,
    preferences,
  } = doc;
  return {
    revision: doc.revision,
    save: {
      schemaVersion,
      contentVersion,
      selectedProfileId,
      profiles,
      preferences,
    },
    updatedAt: doc.updatedAt,
  };
}

export async function readAccount(collection, userId) {
  return publicSave(await collection.findOne({ _id: saveIdentity(userId) }));
}

export async function writeAccount(collection, userId, input) {
  if (
    !Number.isSafeInteger(input?.revision) ||
    input.revision < 0 ||
    !/^[a-f0-9-]{36}$/.test(input?.mutationId || "")
  )
    return {
      status: 400,
      body: { error: "Invalid save revision or operation ID." },
    };
  let save;
  try {
    save = normalizeSave(input.save);
  } catch (error) {
    return { status: 400, body: { error: error.message } };
  }
  const _id = saveIdentity(userId);
  const digest = createHash("sha256")
    .update(JSON.stringify(save))
    .digest("hex");
  const current = await collection.findOne({ _id });
  if (current?.mutationId === input.mutationId) {
    return current.digest === digest
      ? { status: 200, body: publicSave(current) }
      : {
          status: 409,
          body: {
            error: "This operation ID already belongs to another save.",
            ...publicSave(current),
          },
        };
  }
  if ((current?.revision || 0) !== input.revision)
    return {
      status: 409,
      body: {
        error: "Another device has saved newer progress.",
        ...publicSave(current),
      },
    };
  const next = {
    _id,
    ...save,
    revision: input.revision + 1,
    mutationId: input.mutationId,
    digest,
    updatedAt: new Date().toISOString(),
  };
  try {
    if (!current) await collection.insertOne(next);
    else {
      const { _id: ignored, ...fields } = next;
      const result = await collection.updateOne(
        { _id, revision: input.revision },
        { $set: fields },
      );
      if (!result.matchedCount)
        return {
          status: 409,
          body: {
            error: "Another device has saved newer progress.",
            ...(await readAccount(collection, userId)),
          },
        };
    }
  } catch (error) {
    if (error.code !== 11000) throw error;
    const raced = await collection.findOne({ _id });
    if (raced.mutationId === input.mutationId && raced.digest === digest)
      return { status: 200, body: publicSave(raced) };
    return {
      status: 409,
      body: {
        error: "Another device has saved newer progress.",
        ...publicSave(raced),
      },
    };
  }
  return { status: 200, body: publicSave(next) };
}
