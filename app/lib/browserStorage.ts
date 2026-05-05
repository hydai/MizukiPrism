export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__mizukiprism_ls_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
