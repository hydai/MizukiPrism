import { getLocalStorage } from './browserStorage';

export const MIGRATION_NOTICE_DISMISSED_STORAGE_KEY = 'mizukiprism_migration_notice_dismissed';

type MigrationNoticeStorageReader = Pick<Storage, 'getItem'>;
type MigrationNoticeStorageWriter = Pick<Storage, 'setItem'>;

export function readMigrationNoticeDismissed(
  storage?: MigrationNoticeStorageReader,
): boolean {
  try {
    const resolvedStorage = storage ?? getLocalStorage();
    if (!resolvedStorage) return false;

    return resolvedStorage.getItem(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeMigrationNoticeDismissed(
  storage?: MigrationNoticeStorageWriter,
): boolean {
  try {
    const resolvedStorage = storage ?? getLocalStorage();
    if (!resolvedStorage) return false;

    resolvedStorage.setItem(MIGRATION_NOTICE_DISMISSED_STORAGE_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}
