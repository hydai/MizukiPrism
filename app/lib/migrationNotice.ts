// 遷移公告的環境/旗標決策,抽成純函式以利單元測試(SPEC-MigrationNotice §3.3)。

export const MIGRATION_ACTIVE_HOST = 'prism.mizuki.tw';
export const NEW_SITE_URL = 'https://prism.oshi.tw/mizuki';

export type MigrationNoticeAction = 'inactive' | 'show' | 'redirect';

export function resolveMigrationNoticeAction(params: {
  hostname: string;
  dismissed: boolean;
}): MigrationNoticeAction {
  // 僅正式網域生效;localhost / preview 一律靜默,避免踢走開發者與 E2E
  if (params.hostname !== MIGRATION_ACTIVE_HOST) return 'inactive';
  // 已確認過 → 自動導向新站;否則顯示公告
  return params.dismissed ? 'redirect' : 'show';
}
