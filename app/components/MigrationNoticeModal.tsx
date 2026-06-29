'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  readMigrationNoticeDismissed,
  writeMigrationNoticeDismissed,
} from '../lib/migrationNoticeStorage';
import { NEW_SITE_URL, resolveMigrationNoticeAction } from '../lib/migrationNotice';

export default function MigrationNoticeModal() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    const action = resolveMigrationNoticeAction({
      hostname: window.location.hostname,
      dismissed: readMigrationNoticeDismissed(),
    });
    if (action === 'redirect') {
      // 已確認過 → 直接導向新站,不顯示公告(SPEC-MigrationNotice §3.1)
      window.location.replace(NEW_SITE_URL);
      return;
    }
    setShow(action === 'show');
  }, []);

  if (!mounted || !show) return null;

  const handleAcknowledge = () => {
    // 記錄已確認;即使寫入失敗仍照常導向(導向才是主要目的,SPEC-MigrationNotice §3.2)
    writeMigrationNoticeDismissed();
    window.location.replace(NEW_SITE_URL);
  };

  return createPortal(
    <>
      {/* Backdrop:無 onClick,重要公告需明確按「前往新站」確認 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
        data-testid="migration-notice-backdrop"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-notice-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-[150] p-6"
        data-testid="migration-notice-dialog"
      >
        <h2 id="migration-notice-title" className="text-white text-xl font-medium mb-4">
          網站遷移公告
        </h2>

        <p className="text-white/90 leading-relaxed mb-2">
          本網站 (prism.mizuki.tw) 即將合併回{' '}
          <a
            href={NEW_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 underline break-all"
            data-testid="migration-notice-link"
          >
            prism.oshi.tw/mizuki
          </a>{' '}
          以便於進行管理。
        </p>
        <p className="text-white/90 leading-relaxed mb-6">
          點擊下方「前往新站」即可前往;之後再次造訪本站將自動為您重導向。
        </p>

        <button
          onClick={handleAcknowledge}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg font-medium"
          data-testid="migration-notice-acknowledge"
        >
          前往新站
        </button>
      </div>
    </>,
    document.body,
  );
}
