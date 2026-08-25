import React from 'react';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export default function EmptyChat({ onStartChat }) {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-[#efeae2]/50 dark:bg-[#0b141a] text-center select-none">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6 shadow-inner">
        <MessageSquare className="w-10 h-10" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        PulseChat Web
      </h2>

      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
        Send and receive real-time messages with end-to-end efficiency, voice recording, group administration, and instant notifications.
      </p>

      <button
        onClick={onStartChat}
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg flex items-center gap-2"
      >
        <Zap className="w-4 h-4" />
        Start New Conversation
      </button>

      <div className="mt-12 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>End-to-end encrypted session logic</span>
      </div>
    </div>
  );
}
