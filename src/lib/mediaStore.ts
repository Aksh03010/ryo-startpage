export interface WallpaperRecord {
  id: string;
  blob: Blob;
  name: string;
  mime: string;
  size: number;
  savedAt: number;
}

const DB_NAME = 'ryo-wallpapers';
const LEGACY_DB_NAME = 'aura-wallpapers';
const MIGRATION_KEY = 'ryo.wallpapers.migrated.v1';
const STORE_NAME = 'wallpapers';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      void migrateLegacyWallpapers(db).then(() => resolve(db), reject);
    };
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function migrateLegacyWallpapers(target: IDBDatabase): Promise<void> {
  if (!indexedDB.databases) return;
  try {
    if (localStorage.getItem(MIGRATION_KEY) === 'true') return;
  } catch {
    // Migration still works when localStorage is unavailable; it may repeat next load.
  }

  const markMigrated = () => {
    try {
      localStorage.setItem(MIGRATION_KEY, 'true');
    } catch {
      // Keep wallpaper storage independent of localStorage availability.
    }
  };

  const databases = await indexedDB.databases();
  if (!databases.some(({ name }) => name === LEGACY_DB_NAME)) {
    markMigrated();
    return;
  }

  const legacy = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LEGACY_DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!legacy.objectStoreNames.contains(STORE_NAME)) {
    legacy.close();
    markMigrated();
    return;
  }

  const records = await new Promise<WallpaperRecord[]>((resolve, reject) => {
    const request = legacy.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as WallpaperRecord[]);
    request.onerror = () => reject(request.error);
  });
  legacy.close();
  if (records.length === 0) {
    markMigrated();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const tx = target.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const record of records) store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  markMigrated();
}

export async function saveWallpaper(file: File): Promise<WallpaperRecord> {
  const db = await openDatabase();
  const record: WallpaperRecord = {
    id: crypto.randomUUID(),
    blob: file,
    name: file.name,
    mime: file.type,
    size: file.size,
    savedAt: Date.now(),
  };
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(record);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getWallpaper(id: string): Promise<WallpaperRecord | null> {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as WallpaperRecord | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteWallpaper(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
