'use client';

import { X, GripVertical, Music } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function QueuePanel() {
  const { queue, removeFromQueue, reorderQueue, showQueue, setShowQueue } = usePlayer();
  const [mounted, setMounted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !showQueue) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDraggedOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderQueue(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
        onClick={() => setShowQueue(false)}
      />

      {/* Queue Panel */}
      <div
        data-testid="queue-panel"
        className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white/95 backdrop-blur-xl border-l border-white/60 shadow-2xl z-[100] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-b from-white/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">播放佇列</h2>
              <p className="text-xs text-slate-500 font-medium">
                {queue.length} 首歌曲
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowQueue(false)}
            className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100"
            aria-label="Close queue"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Queue Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6">
              <Music className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">播放佇列為空</p>
              <p className="text-sm mt-2 text-center">點擊任何歌曲旁的「加入佇列」按鈕來新增歌曲</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {queue.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  data-testid="queue-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    draggedOverIndex === index ? 'border-pink-400 bg-pink-50' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate text-sm">
                      {track.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {track.originalArtist}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded-full hover:bg-red-50 flex-shrink-0"
                    aria-label="Remove from queue"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
