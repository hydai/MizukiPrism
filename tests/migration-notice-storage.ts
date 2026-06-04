import assert from 'node:assert/strict';
import {
  MIGRATION_NOTICE_DISMISSED_STORAGE_KEY,
  readMigrationNoticeDismissed,
  writeMigrationNoticeDismissed,
} from '../app/lib/migrationNoticeStorage';

function createNoticeStorage(
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

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

function restoreLocalStorage(): void {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'localStorage');
}

// read:Node 環境無 localStorage → false
assert.equal(readMigrationNoticeDismissed(), false);
// read:空 storage → false
assert.equal(readMigrationNoticeDismissed(createNoticeStorage()), false);
// read:已確認 → true
assert.equal(
  readMigrationNoticeDismissed(createNoticeStorage({
    [MIGRATION_NOTICE_DISMISSED_STORAGE_KEY]: 'true',
  })),
  true,
);
// read:非預期值 → false
assert.equal(
  readMigrationNoticeDismissed(createNoticeStorage({
    [MIGRATION_NOTICE_DISMISSED_STORAGE_KEY]: 'yes',
  })),
  false,
);
// read:getItem 拋錯 → false
assert.equal(readMigrationNoticeDismissed(createNoticeStorage({}, { failGet: true })), false);

// write:成功寫入
const writableStorage = createNoticeStorage();
assert.equal(writeMigrationNoticeDismissed(writableStorage), true);
assert.equal(writableStorage.values.get(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY), 'true');

// write:無 storage → false
assert.equal(writeMigrationNoticeDismissed(), false);
// write:setItem 拋錯 → false
assert.equal(writeMigrationNoticeDismissed(createNoticeStorage({}, { failSet: true })), false);

// localStorage getter 本身拋錯 → 安全預設值
try {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('localStorage unavailable');
    },
  });

  assert.equal(readMigrationNoticeDismissed(), false);
  assert.equal(writeMigrationNoticeDismissed(), false);
} finally {
  restoreLocalStorage();
}
