import React, { useRef } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { Reply, Smile, Forward, Copy, Edit, Trash2 } from 'lucide-react';

export default function ContextMenu({ x, y, isOwn, onReply, onReact, onForward, onCopy, onEdit, onDelete, onClose }) {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  const style = {
    top: Math.min(y, window.innerHeight - 250),
    left: Math.min(x, window.innerWidth - 200),
  };

  return (
    <div
      ref={ref}
      style={style}
      className="fixed z-50 w-48 bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xl py-1.5 text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={() => { onReply(); onClose(); }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
      >
        <Reply className="w-4 h-4 text-indigo-500" />
        <span>Reply</span>
      </button>

      <button
        onClick={() => { onReact(); onClose(); }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
      >
        <Smile className="w-4 h-4 text-amber-500" />
        <span>React</span>
      </button>

      <button
        onClick={() => { onForward(); onClose(); }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
      >
        <Forward className="w-4 h-4 text-emerald-500" />
        <span>Forward</span>
      </button>

      <button
        onClick={() => { onCopy(); onClose(); }}
        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
      >
        <Copy className="w-4 h-4 text-blue-500" />
        <span>Copy</span>
      </button>

      {isOwn && (
        <button
          onClick={() => { onEdit(); onClose(); }}
          className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
        >
          <Edit className="w-4 h-4 text-purple-500" />
          <span>Edit</span>
        </button>
      )}

      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-4 py-2 flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}
