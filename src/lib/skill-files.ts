// Tiny IndexedDB wrapper for persisting skill file attachments across reloads.
// Files include binary ArrayBuffer data, which would be wasteful in localStorage.

const DB_NAME = "insuranceprod";
const DB_VERSION = 1;
const STORE = "skill-files";

export interface StoredFile {
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function getAllSkillFiles(): Promise<Record<string, StoredFile[]>> {
  if (typeof indexedDB === "undefined") return {};
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, "readonly");
      const store = t.objectStore(STORE);
      const result: Record<string, StoredFile[]> = {};
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          result[cursor.key as string] = cursor.value as StoredFile[];
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export async function setSkillFiles(skillId: string, files: StoredFile[]): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    if (files.length === 0) {
      await tx("readwrite", (s) => s.delete(skillId));
    } else {
      await tx("readwrite", (s) => s.put(files, skillId));
    }
  } catch {
    // swallow — quota or permission errors shouldn't break the UI
  }
}

export async function deleteSkillFiles(skillId: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    await tx("readwrite", (s) => s.delete(skillId));
  } catch {
    // ignore
  }
}
