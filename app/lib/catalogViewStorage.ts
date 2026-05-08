export type CatalogViewMode = 'timeline' | 'grouped';

export const CATALOG_VIEW_MODE_STORAGE_KEY = 'mizukiprism-view-mode';

type CatalogViewStorageReader = Pick<Storage, 'getItem'>;
type CatalogViewStorageWriter = Pick<Storage, 'setItem'>;

function getSessionStorage(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function isCatalogViewMode(value: string | null): value is CatalogViewMode {
  return value === 'timeline' || value === 'grouped';
}

export function readStoredCatalogViewMode(
  storage?: CatalogViewStorageReader,
): CatalogViewMode | null {
  try {
    const resolvedStorage = storage ?? getSessionStorage();
    if (!resolvedStorage) return null;

    const stored = resolvedStorage.getItem(CATALOG_VIEW_MODE_STORAGE_KEY);
    return isCatalogViewMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredCatalogViewMode(
  viewMode: CatalogViewMode,
  storage?: CatalogViewStorageWriter,
): boolean {
  try {
    const resolvedStorage = storage ?? getSessionStorage();
    if (!resolvedStorage) return false;

    resolvedStorage.setItem(CATALOG_VIEW_MODE_STORAGE_KEY, viewMode);
    return true;
  } catch {
    return false;
  }
}
