type BrowserStorageName = 'localStorage' | 'sessionStorage';

export function captureGlobalStorage(storageName: BrowserStorageName): () => void {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, storageName);

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, storageName, originalDescriptor);
      return;
    }

    Reflect.deleteProperty(globalThis, storageName);
  };
}

export function setGlobalStorage(storageName: BrowserStorageName, storage: unknown): void {
  Object.defineProperty(globalThis, storageName, {
    configurable: true,
    value: storage,
  });
}

export function setThrowingStorageGetter(storageName: BrowserStorageName, error: unknown): void {
  Object.defineProperty(globalThis, storageName, {
    configurable: true,
    get: () => {
      throw error;
    },
  });
}
