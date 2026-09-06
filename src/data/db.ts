import { STORES, type StoreName } from './schema';

/**
 * Couche IndexedDB minimale (aucune dépendance).
 *
 * Si IndexedDB est indisponible (navigation privée stricte, environnement de
 * test, stockage bloqué), on bascule silencieusement sur un magasin mémoire :
 * l'application reste utilisable, seule la persistance entre sessions est
 * perdue — et l'utilisateur en est informé par la bannière hors ligne.
 */

const DB_NAME = 'yumi';
const DB_VERSION = 1;

interface StoreConfig {
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

const CONFIG: Record<StoreName, StoreConfig> = {
  users: { keyPath: 'id', indexes: [{ name: 'email', keyPath: 'email', unique: true }] },
  profiles: { keyPath: 'userId' },
  settings: { keyPath: 'userId' },
  trackProgress: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  lessonProgress: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  attempts: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  memories: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  xp: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  daily: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  streaks: { keyPath: 'userId' },
  badges: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  certificates: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  offline: { keyPath: 'id', indexes: [{ name: 'userId', keyPath: 'userId' }] },
  syncQueue: { keyPath: 'seq', autoIncrement: true },
};

export interface KeyValueStore {
  get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined>;
  getAll<T>(store: StoreName): Promise<T[]>;
  getAllByIndex<T>(store: StoreName, index: string, value: IDBValidKey): Promise<T[]>;
  put<T>(store: StoreName, value: T): Promise<void>;
  putMany<T>(store: StoreName, values: T[]): Promise<void>;
  delete(store: StoreName, key: IDBValidKey): Promise<void>;
  clearUser(userId: string): Promise<void>;
  readonly persistent: boolean;
}

// ---------------------------------------------------------------------------
// Implémentation mémoire (repli)
// ---------------------------------------------------------------------------

class MemoryStore implements KeyValueStore {
  readonly persistent = false;
  private data = new Map<StoreName, Map<string, unknown>>();
  private seq = 1;

  private bucket(store: StoreName) {
    if (!this.data.has(store)) this.data.set(store, new Map());
    return this.data.get(store)!;
  }

  async get<T>(store: StoreName, key: IDBValidKey) {
    return this.bucket(store).get(String(key)) as T | undefined;
  }
  async getAll<T>(store: StoreName) {
    return [...this.bucket(store).values()] as T[];
  }
  async getAllByIndex<T>(store: StoreName, index: string, value: IDBValidKey) {
    return (await this.getAll<Record<string, unknown>>(store)).filter(
      (row) => row[index] === value
    ) as T[];
  }
  async put<T>(store: StoreName, value: T) {
    const cfg = CONFIG[store];
    const rec = value as Record<string, unknown>;
    if (cfg.autoIncrement && rec[cfg.keyPath] === undefined) rec[cfg.keyPath] = this.seq++;
    this.bucket(store).set(String(rec[cfg.keyPath]), value);
  }
  async putMany<T>(store: StoreName, values: T[]) {
    for (const v of values) await this.put(store, v);
  }
  async delete(store: StoreName, key: IDBValidKey) {
    this.bucket(store).delete(String(key));
  }
  async clearUser(userId: string) {
    for (const store of Object.values(STORES)) {
      const bucket = this.bucket(store);
      for (const [k, v] of bucket) {
        if ((v as { userId?: string }).userId === userId) bucket.delete(k);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Implémentation IndexedDB
// ---------------------------------------------------------------------------

class IndexedDbStore implements KeyValueStore {
  readonly persistent = true;
  constructor(private db: IDBDatabase) {}

  private run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, mode);
      const req = fn(tx.objectStore(store));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  }

  get<T>(store: StoreName, key: IDBValidKey) {
    return this.run<T | undefined>(store, 'readonly', (s) => s.get(key));
  }
  getAll<T>(store: StoreName) {
    return this.run<T[]>(store, 'readonly', (s) => s.getAll());
  }
  getAllByIndex<T>(store: StoreName, index: string, value: IDBValidKey) {
    return this.run<T[]>(store, 'readonly', (s) => s.index(index).getAll(value));
  }
  put<T>(store: StoreName, value: T) {
    return this.run<void>(store, 'readwrite', (s) => s.put(value as unknown as object));
  }
  async putMany<T>(store: StoreName, values: T[]) {
    if (values.length === 0) return;
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      for (const v of values) os.put(v as unknown as object);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  delete(store: StoreName, key: IDBValidKey) {
    return this.run<void>(store, 'readwrite', (s) => s.delete(key));
  }
  async clearUser(userId: string) {
    for (const store of Object.values(STORES)) {
      const cfg = CONFIG[store];
      const hasUserIndex = cfg.indexes?.some((i) => i.name === 'userId');
      if (store === 'users') continue;
      const rows = hasUserIndex
        ? await this.getAllByIndex<{ [k: string]: unknown }>(store, 'userId', userId)
        : (await this.getAll<{ [k: string]: unknown }>(store)).filter((r) => r.userId === userId);
      for (const row of rows) {
        const key = row[cfg.keyPath] as IDBValidKey;
        if (key !== undefined) await this.delete(store, key);
      }
    }
  }
}

let instance: Promise<KeyValueStore> | null = null;

export function getDb(): Promise<KeyValueStore> {
  if (instance) return instance;
  instance = openDb();
  return instance;
}

function openDb(): Promise<KeyValueStore> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(new MemoryStore());

  return new Promise<KeyValueStore>((resolve) => {
    let settled = false;
    const done = (s: KeyValueStore) => {
      if (!settled) {
        settled = true;
        resolve(s);
      }
    };

    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      done(new MemoryStore());
      return;
    }

    // Certains navigateurs bloquent silencieusement : on ne laisse jamais
    // l'application attendre indéfiniment au démarrage.
    const timeout = setTimeout(() => done(new MemoryStore()), 2500);

    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, cfg] of Object.entries(CONFIG) as [StoreName, StoreConfig][]) {
        if (db.objectStoreNames.contains(name)) continue;
        const os = db.createObjectStore(name, {
          keyPath: cfg.keyPath,
          autoIncrement: cfg.autoIncrement ?? false,
        });
        for (const idx of cfg.indexes ?? []) {
          os.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
        }
      }
    };
    req.onsuccess = () => {
      clearTimeout(timeout);
      done(new IndexedDbStore(req.result));
    };
    req.onerror = () => {
      clearTimeout(timeout);
      done(new MemoryStore());
    };
    req.onblocked = () => {
      clearTimeout(timeout);
      done(new MemoryStore());
    };
  });
}

/** Réinitialise le singleton — utilisé par les tests. */
export function __resetDb() {
  instance = null;
}
