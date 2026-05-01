'use client';

import { Clock } from 'lucide-react';

export default function TimelineTableHeader() {
  return (
    <div
      className="grid grid-cols-[32px_40px_1fr_60px] lg:grid-cols-[32px_40px_2fr_2fr_100px_60px] gap-0 px-3 py-2 sticky top-[60px] lg:top-[88px] z-10"
      style={{
        borderBottom: '1px solid var(--border-table)',
        background: 'var(--bg-surface-frosted)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="flex items-center justify-center text-center font-bold uppercase tracking-wider"
        style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
      >
        #
      </div>
      <div />
      <div
        className="flex items-center font-bold uppercase tracking-wider lg:pl-3"
        style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
      >
        標題
      </div>
      <div
        className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
        style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
      >
        出處直播
      </div>
      <div
        className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
        style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
      >
        發布日期
      </div>
      <div
        className="flex items-center justify-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <Clock
          aria-hidden="true"
          focusable="false"
          style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }}
        />
      </div>
    </div>
  );
}
