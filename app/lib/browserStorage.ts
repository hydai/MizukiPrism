const LOCAL_STORAGE_TEST_KEY_PREFIX = '__mizukiprism_ls_test__';

export function isLocalStorageAvailable(): boolean {
  const testKey = `${LOCAL_STORAGE_TEST_KEY_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let wroteTestValue = false;
  let isAvailable = false;

  try {
    localStorage.setItem(testKey, '1');
    wroteTestValue = true;
    isAvailable = localStorage.getItem(testKey) === '1';
  } catch {
    isAvailable = false;
  } finally {
    if (wroteTestValue) {
      try {
        localStorage.removeItem(testKey);
      } catch {
        isAvailable = false;
      }
    }
  }

  return isAvailable;
}
