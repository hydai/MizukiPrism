const LOCAL_STORAGE_TEST_KEY_PREFIX = '__mizukiprism_ls_test__';

export function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function isLocalStorageAvailable(): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  const testKey = `${LOCAL_STORAGE_TEST_KEY_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let wroteTestValue = false;
  let isAvailable = false;

  try {
    storage.setItem(testKey, '1');
    wroteTestValue = true;
    isAvailable = storage.getItem(testKey) === '1';
  } catch {
    isAvailable = false;
  } finally {
    if (wroteTestValue) {
      try {
        storage.removeItem(testKey);
      } catch {
        isAvailable = false;
      }
    }
  }

  return isAvailable;
}
