import assert from 'node:assert/strict';
import {
  CATALOG_VIEW_MODE_STORAGE_KEY,
  isCatalogViewMode,
  readStoredCatalogViewMode,
  writeStoredCatalogViewMode,
} from '../app/lib/catalogViewStorage';

function createCatalogViewStorage(
  initialValues: Record<string, string> = {},
  options: { failGet?: boolean; failSet?: boolean } = {},
) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key: string) => {
      if (options.failGet) {
        throw new Error('getItem failed');
      }
      return values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (options.failSet) {
        throw new Error('setItem failed');
      }
      values.set(key, value);
    },
    values,
  };
}

const originalSessionStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');

function restoreSessionStorage(): void {
  if (originalSessionStorageDescriptor) {
    Object.defineProperty(globalThis, 'sessionStorage', originalSessionStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'sessionStorage');
}

assert.equal(isCatalogViewMode('timeline'), true);
assert.equal(isCatalogViewMode('grouped'), true);
assert.equal(isCatalogViewMode('grid'), false);
assert.equal(isCatalogViewMode(null), false);

assert.equal(readStoredCatalogViewMode(), null);
assert.equal(readStoredCatalogViewMode(createCatalogViewStorage()), null);
assert.equal(
  readStoredCatalogViewMode(createCatalogViewStorage({
    [CATALOG_VIEW_MODE_STORAGE_KEY]: 'timeline',
  })),
  'timeline',
);
assert.equal(
  readStoredCatalogViewMode(createCatalogViewStorage({
    [CATALOG_VIEW_MODE_STORAGE_KEY]: 'grouped',
  })),
  'grouped',
);
assert.equal(
  readStoredCatalogViewMode(createCatalogViewStorage({
    [CATALOG_VIEW_MODE_STORAGE_KEY]: 'grid',
  })),
  null,
);
assert.equal(readStoredCatalogViewMode(createCatalogViewStorage({}, { failGet: true })), null);

const writableStorage = createCatalogViewStorage();
assert.equal(writeStoredCatalogViewMode('grouped', writableStorage), true);
assert.equal(writableStorage.values.get(CATALOG_VIEW_MODE_STORAGE_KEY), 'grouped');

assert.equal(writeStoredCatalogViewMode('timeline'), false);
assert.equal(writeStoredCatalogViewMode('timeline', createCatalogViewStorage({}, { failSet: true })), false);

try {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    get: () => {
      throw new Error('sessionStorage unavailable');
    },
  });

  assert.equal(readStoredCatalogViewMode(), null);
  assert.equal(writeStoredCatalogViewMode('timeline'), false);
} finally {
  restoreSessionStorage();
}
