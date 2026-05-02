'use client';

import type { ReactNode, RefObject } from 'react';
import type { CatalogMobileTab } from '../hooks/useCatalogViewState';
import MobileBottomNav from './MobileBottomNav';
import MobileTopBar from './MobileTopBar';

interface CatalogShellProps {
  apiLoadError: string | null;
  streamerName: string;
  activeMobileTab: CatalogMobileTab;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  sidebar: ReactNode;
  children: ReactNode;
  onMobileTabChange: (tab: CatalogMobileTab) => void;
}

export default function CatalogShell({
  apiLoadError,
  streamerName,
  activeMobileTab,
  scrollContainerRef,
  sidebar,
  children,
  onMobileTabChange,
}: CatalogShellProps) {
  return (
    <>
      {apiLoadError && (
        <div
          data-testid="api-load-error"
          className="fixed top-0 left-0 right-0 z-[300] bg-red-500 text-white px-6 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="font-bold text-sm">{apiLoadError}</span>
        </div>
      )}
      <div
        className="flex h-screen font-sans selection:bg-pink-200 selection:text-pink-900 dark:selection:bg-pink-800 dark:selection:text-pink-100 overflow-hidden"
        style={{
          color: 'var(--text-secondary)',
          background: 'linear-gradient(135deg, var(--bg-page-start) 0%, var(--bg-page-mid) 50%, var(--bg-page-end) 100%)',
        }}
      >
        {sidebar}

        <MobileTopBar name={streamerName} />

        <main
          className="flex-1 lg:m-3 lg:rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-900/20 flex flex-col"
          style={{
            background: 'var(--bg-surface-glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-3xl)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-14 lg:pt-0"
          >
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav activeTab={activeMobileTab} onTabChange={onMobileTabChange} />
    </>
  );
}
