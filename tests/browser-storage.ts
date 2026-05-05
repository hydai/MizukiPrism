import assert from 'node:assert/strict';
import { isLocalStorageAvailable } from '../app/lib/browserStorage';

interface FakeLocalStorageOptions {
  failSet?: boolean;
  failRemove?: boolean;
}

class FakeLocalStorage {
  readonly removeCalls: string[] = [];

  private readonly store = new Map<string, string>();

  constructor(
    initialValues: Record<string, string> = {},
    private readonly options: FakeLocalStorageOptions = {},
  ) {
    for (const [key, value] of Object.entries(initialValues)) {
      this.store.set(key, value);
    }
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.options.failSet) {
      throw new Error('setItem failed');
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.removeCalls.push(key);
    if (this.options.failRemove) {
      throw new Error('removeItem failed');
    }
    this.store.delete(key);
  }

  entries(): Record<string, string> {
    return Object.fromEntries(this.store.entries());
  }
}

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

function installLocalStorage(storage: FakeLocalStorage): void {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage as unknown as Storage,
  });
}

function restoreLocalStorage(): void {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'localStorage');
}

try {
  const existingProbeValue = 'user-value';
  const availableStorage = new FakeLocalStorage({
    __mizukiprism_ls_test__: existingProbeValue,
  });

  installLocalStorage(availableStorage);
  assert.equal(isLocalStorageAvailable(), true);
  assert.equal(availableStorage.getItem('__mizukiprism_ls_test__'), existingProbeValue);
  assert.deepEqual(availableStorage.entries(), {
    __mizukiprism_ls_test__: existingProbeValue,
  });
  assert.equal(availableStorage.removeCalls.length, 1);
  assert.match(availableStorage.removeCalls[0], /^__mizukiprism_ls_test__-/);

  const unavailableStorage = new FakeLocalStorage({}, { failSet: true });
  installLocalStorage(unavailableStorage);
  assert.equal(isLocalStorageAvailable(), false);
  assert.deepEqual(unavailableStorage.entries(), {});
  assert.equal(unavailableStorage.removeCalls.length, 0);

  const cleanupFailingStorage = new FakeLocalStorage({}, { failRemove: true });
  installLocalStorage(cleanupFailingStorage);
  assert.equal(isLocalStorageAvailable(), false);
  assert.equal(cleanupFailingStorage.removeCalls.length, 1);
  assert.match(cleanupFailingStorage.removeCalls[0], /^__mizukiprism_ls_test__-/);
} finally {
  restoreLocalStorage();
}
