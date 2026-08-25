import React from 'react';

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700/60 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-3 max-w-[70%] animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700/60 shrink-0" />
        <div className="h-14 bg-gray-200 dark:bg-gray-800/80 rounded-2xl w-48" />
      </div>
      <div className="flex gap-3 max-w-[70%] self-end animate-pulse">
        <div className="h-10 bg-indigo-200 dark:bg-indigo-900/40 rounded-2xl w-40" />
      </div>
      <div className="flex gap-3 max-w-[70%] animate-pulse">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700/60 shrink-0" />
        <div className="h-16 bg-gray-200 dark:bg-gray-800/80 rounded-2xl w-64" />
      </div>
    </div>
  );
}
