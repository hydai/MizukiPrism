'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { Cloud, HardDrive, Shuffle } from 'lucide-react';

export type MergeOption = 'merge' | 'cloud' | 'local';

interface MergePlaylistDialogProps {
  show: boolean;
  localCount: number;
  cloudCount: number;
  onChoose: (option: MergeOption) => void;
}

export default function MergePlaylistDialog({
  show,
  localCount,
  cloudCount,
  onChoose,
}: MergePlaylistDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-100/50 border border-white/60 p-8 w-full max-w-md"
        data-testid="merge-playlist-dialog"
      >
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-2xl text-white shadow-lg shadow-pink-200">
            <Shuffle className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-700">同步播放清單</h2>
            <p className="text-sm text-slate-500 mt-1">
              發現本機與雲端都有播放清單，請選擇同步方式
            </p>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3 text-center text-sm">
          <div className="flex flex-col items-center gap-1">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-slate-600">本機</span>
            <span className="text-pink-500 font-bold">{localCount} 個清單</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Cloud className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-slate-600">雲端</span>
            <span className="text-pink-500 font-bold">{cloudCount} 個清單</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onChoose('merge')}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-pink-50 to-blue-50 border-2 border-pink-200 hover:border-pink-400 hover:shadow-md hover:shadow-pink-100 transition-all group"
            data-testid="merge-option-merge"
          >
            <div className="p-2 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-xl text-white shadow shadow-pink-200 flex-shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">
                合併本機與雲端清單
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                保留所有清單，相同 ID 以較新的版本為主
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoose('cloud')}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-purple-50/50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md hover:shadow-purple-100 transition-all group"
            data-testid="merge-option-cloud"
          >
            <div className="p-2 bg-purple-400 rounded-xl text-white shadow shadow-purple-200 flex-shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-700 group-hover:text-purple-600 transition-colors">
                以雲端覆蓋本機
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                使用雲端清單，本機清單將被取代
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoose('local')}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-50/50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md hover:shadow-blue-100 transition-all group"
            data-testid="merge-option-local"
          >
            <div className="p-2 bg-blue-400 rounded-xl text-white shadow shadow-blue-200 flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                以本機覆蓋雲端
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                使用本機清單，雲端清單將被取代
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
