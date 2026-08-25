import React from 'react';
import { X, CornerUpLeft } from 'lucide-react';

export default function ReplyPreview({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between p-2.5 px-4 bg-gray-100 dark:bg-[#111b21] border-t border-gray-200 dark:border-gray-800 text-xs">
      <div className="flex items-center gap-2 min-w-0 border-l-4 border-indigo-500 pl-3">
        <CornerUpLeft className="w-4 h-4 text-indigo-500 shrink-0" />
        <div className="truncate">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Replying to {message.sender?.name || 'User'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {message.content || 'Media message'}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
