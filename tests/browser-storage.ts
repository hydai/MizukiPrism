import assert from 'node:assert/strict';
import { getLocalStorage, isLocalStorageAvailable } from '../app/lib/browserStorage';
import {
  captureGlobalStorage,
  setGlobalStorage,
  setThrowingStorageGetter,
} from './storage-test-utils';

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

const restoreLocalStorage = captureGlobalStorage('localStorage');

function installLocalStorage(storage: FakeLocalStorage): void {
  setGlobalStorage('localStorage', storage);
}

try {
  const existingProbeValue = 'user-value';
  const availableStorage = new FakeLocalStorage({
    __mizukiprism_ls_test__: existingProbeValue,
  });

  installLocalStorage(availableStorage);
  assert.equal(getLocalStorage(), availableStorage as unknown as Storage);
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

  restoreLocalStorage();
  assert.equal(getLocalStorage(), null);
  assert.equal(isLocalStorageAvailable(), false);

  setThrowingStorageGetter('localStorage', new Error('localStorage unavailable'));
  assert.equal(getLocalStorage(), null);
  assert.equal(isLocalStorageAvailable(), false);
} finally {
  restoreLocalStorage();
}
