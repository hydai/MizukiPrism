export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__mizukiprism_ls_test__';
    const existingValue = localStorage.getItem(testKey);

    localStorage.setItem(testKey, '1');
    if (existingValue === null) {
      localStorage.removeItem(testKey);
    } else {
      localStorage.setItem(testKey, existingValue);
    }

    return true;
  } catch {
    return false;
  }
}
