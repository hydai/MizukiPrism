import assert from 'node:assert/strict';
import {
  MIGRATION_ACTIVE_HOST,
  resolveMigrationNoticeAction,
} from '../app/lib/migrationNotice';

// 非正式網域 → inactive(不論 dismissed)
assert.equal(
  resolveMigrationNoticeAction({ hostname: 'localhost', dismissed: false }),
  'inactive',
);
assert.equal(
  resolveMigrationNoticeAction({ hostname: 'localhost', dismissed: true }),
  'inactive',
);
assert.equal(
  resolveMigrationNoticeAction({ hostname: 'prism-mizuki.pages.dev', dismissed: true }),
  'inactive',
);

// 正式網域 + 未確認 → show
assert.equal(
  resolveMigrationNoticeAction({ hostname: MIGRATION_ACTIVE_HOST, dismissed: false }),
  'show',
);

// 正式網域 + 已確認 → redirect
assert.equal(
  resolveMigrationNoticeAction({ hostname: MIGRATION_ACTIVE_HOST, dismissed: true }),
  'redirect',
);
