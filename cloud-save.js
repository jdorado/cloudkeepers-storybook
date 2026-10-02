import { createLibrary, GAME_ID, restoreLibrary } from "./library.js";
import { newId } from "./id.js";

export class CloudSave {
  constructor({ storage, request, apply, status, conflict }) {
    Object.assign(this, { storage, request, apply, status, conflict });
    this.userId = null;
    this.state = null;
    this.ready = false;
    this.busy = false;
    this.remote = null;
    this.generation = 0;
    this.retryDelay = 2000;
  }

  cacheKey() {
    return `${GAME_ID}:account:${this.userId}`;
  }

  cache() {
    try {
      this.storage.setItem(this.cacheKey(), JSON.stringify(this.state));
    } catch {
      this.status("Keep this page open until saved online", true);
    }
  }

  async connect(userId) {
    clearTimeout(this.timer);
    const generation = ++this.generation;
    this.userId = userId;
    this.state = null;
    this.ready = false;
    this.remote = null;
    this.retryDelay = 2000;
    this.conflict(null);
    if (!userId) return;
    try {
      this.state = JSON.parse(this.storage.getItem(this.cacheKey()));
    } catch {
      // The online save remains canonical if the device cache is unavailable.
    }
    if (
      !this.state ||
      !Number.isSafeInteger(this.state.revision) ||
      !this.state.save
    ) {
      this.state = {
        revision: 0,
        save: createLibrary(),
        dirty: false,
        pending: null,
      };
    }
    this.apply(restoreLibrary(this.state.save));
    this.status("Checking online save…");
    try {
      const remote = await this.request("GET");
      if (generation !== this.generation) return;
      if (this.state.pending || this.state.dirty) {
        if (
          remote.revision !== this.state.revision &&
          remote.revision !== this.state.revision + 1
        ) {
          this.remote = remote;
          this.conflict(remote);
          this.status("Two saves need your choice", true);
          return;
        }
      } else {
        this.state = {
          revision: remote.revision,
          save: remote.save || createLibrary(),
          dirty: false,
          pending: null,
        };
        this.apply(restoreLibrary(this.state.save));
        this.cache();
      }
      this.ready = true;
      if (this.state.pending || this.state.dirty) await this.flush();
      else this.status(remote.save ? "Saved online" : "Saves automatically");
    } catch {
      if (generation === this.generation) {
        this.ready = true;
        this.status("Saved on device · reconnecting…", true);
      }
    }
  }

  save(library) {
    if (!this.userId || !this.state) return;
    this.state.save = structuredClone(library);
    this.state.dirty = true;
    this.cache();
    this.status(this.remote ? "Two saves need your choice" : "Saving…", !!this.remote);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 900);
  }

  async flush() {
    if (
      !this.userId ||
      !this.state ||
      !this.ready ||
      this.remote ||
      this.busy ||
      (!this.state.dirty && !this.state.pending)
    )
      return;
    const generation = this.generation;
    this.busy = true;
    this.state.pending ||= {
      mutationId: newId(),
      revision: this.state.revision,
      save: structuredClone(this.state.save),
    };
    const sent = this.state.pending;
    this.cache();
    this.status("Saving…");
    try {
      const remote = await this.request("PUT", sent);
      if (generation !== this.generation) return;
      this.state.revision = remote.revision;
      this.state.pending = null;
      this.retryDelay = 2000;
      this.state.dirty =
        JSON.stringify(this.state.save) !== JSON.stringify(sent.save);
      this.cache();
      this.status(this.state.dirty ? "Saving…" : "Saved online");
    } catch (error) {
      if (generation !== this.generation) return;
      if (error.status === 409) {
        this.remote = error.body;
        this.conflict(this.remote);
        this.status("Two saves need your choice", true);
      } else this.status("Saved on device · reconnecting…", true);
    } finally {
      this.busy = false;
      if (
        this.userId &&
        this.ready &&
        (this.state?.dirty || this.state?.pending) &&
        !this.remote
      ) {
        const delay = this.state.pending ? this.retryDelay : 900;
        if (this.state.pending)
          this.retryDelay = Math.min(30000, this.retryDelay * 2);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), delay);
        this.timer.unref?.();
      }
    }
  }

  resolve(useDevice) {
    if (!this.remote) return;
    this.state.revision = this.remote.revision;
    this.state.pending = null;
    this.state.dirty = useDevice;
    if (!useDevice) {
      this.state.save = this.remote.save || createLibrary();
      this.apply(restoreLibrary(this.state.save));
    }
    this.remote = null;
    this.conflict(null);
    this.ready = true;
    this.cache();
    if (useDevice) this.flush();
    else this.status("Saved online");
  }
}

function loadScript(src, publishableKey) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    if (publishableKey) script.dataset.clerkPublishableKey = publishableKey;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

export async function setupCloud({ apply, guest, status, activate }) {
  const byId = (id) => document.getElementById(id);
  let config;
  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Missing cloud configuration");
    config = await response.json();
  } catch {
    status("Saved on this device");
    return null;
  }
  if (!config.cloudEnabled) {
    status("Online saving needs setup", true);
    byId("account-controls").hidden = false;
    byId("parent-login").disabled = true;
    return null;
  }
  byId("account-controls").hidden = false;
  byId("parent-login").disabled = true;
  try {
    const domain = atob(config.publishableKey.split("_")[2]).slice(0, -1);
    await loadScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(
      `https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,
      config.publishableKey,
    );
    const clerk = window.Clerk;
    await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
    const cloud = new CloudSave({
      storage: localStorage,
      apply,
      status,
      conflict: (remote) => {
        byId("sync-conflict").hidden = !remote;
      },
      request: async (method, body) => {
        const token = await clerk.session?.getToken();
        if (!token) throw new Error("Signed out");
        const response = await fetch("/api/save", {
          signal: AbortSignal.timeout(15000),
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const data = await response.json();
        if (!response.ok)
          throw Object.assign(new Error(data.error), {
            status: response.status,
            body: data,
          });
        return data;
      },
    });
    activate(cloud);
    let current;
    async function sessionChanged() {
      const id = clerk.user?.id || null;
      if (id === current) return;
      current = id;
      byId("parent-login").hidden = !!id;
      byId("parent-logout").hidden = !id;
      byId("save-menu").open = false;
      await cloud.connect(id);
      if (!id) {
        apply(guest());
        status("Saved on this device");
      }
    }
    byId("parent-login").disabled = false;
    byId("parent-login").onclick = () =>
      clerk.openSignIn({
        forceRedirectUrl: window.location.origin,
        signUpForceRedirectUrl: window.location.origin,
      });
    byId("parent-logout").onclick = async () => {
      await cloud.flush();
      await clerk.signOut();
    };
    byId("use-online").onclick = () => cloud.resolve(false);
    byId("use-device").onclick = () => cloud.resolve(true);
    window.addEventListener("online", () => cloud.flush());
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) cloud.flush();
    });
    clerk.addListener(sessionChanged);
    await sessionChanged();
    return cloud;
  } catch {
    status("Online saving could not start", true);
    byId("parent-login").disabled = true;
    return null;
  }
}
