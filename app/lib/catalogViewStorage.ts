export type CatalogViewMode = 'timeline' | 'grouped';

export const CATALOG_VIEW_MODE_STORAGE_KEY = 'mizukiprism-view-mode';

type CatalogViewStorageReader = Pick<Storage, 'getItem'>;
type CatalogViewStorageWriter = Pick<Storage, 'setItem'>;

export function isCatalogViewMode(value: string | null): value is CatalogViewMode {
  return value === 'timeline' || value === 'grouped';
}

export function readStoredCatalogViewMode(
  storage: CatalogViewStorageReader = sessionStorage,
): CatalogViewMode | null {
  try {
    const stored = storage.getItem(CATALOG_VIEW_MODE_STORAGE_KEY);
    return isCatalogViewMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredCatalogViewMode(
  viewMode: CatalogViewMode,
  storage: CatalogViewStorageWriter = sessionStorage,
): boolean {
  try {
    storage.setItem(CATALOG_VIEW_MODE_STORAGE_KEY, viewMode);
    return true;
  } catch {
    return false;
  }
}
