import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatList from '../components/chat/ChatList';
// import SettingsModal from '../components/profile/SettingsModal';

import { Settings, LogOut } from 'lucide-react';

export default function MainLayout({
  children,
  onOpenNewChat,
  onOpenCreateGroup,
  onOpenSettings,
}) {
  const { user } = useAuth();
  const { activeConversation } = useChat();

  return (
    <div className="h-[100dvh] w-screen flex bg-gray-100 dark:bg-[#0b141a] overflow-hidden select-none">

      {/* Navigation Sidebar Controls for Desktop */}
      <div className="w-16 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between items-center py-4 shrink-0 hidden sm:flex z-30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-md">
            <img src="chat.png" alt="" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#202c33] transition"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 cursor-pointer border-2 border-indigo-500"
            title={user?.name}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="flex-1 flex w-full h-full min-w-0 min-h-0 overflow-hidden relative">
        {/* Left Sidebar Pane (Chat list) */}
        <div
          className={`w-full sm:w-80 md:w-96 shrink-0 h-full ${activeConversation ? 'hidden md:block' : 'block'
            }`}
        >
          <ChatList
            onOpenNewChat={onOpenNewChat}
            onOpenCreateGroup={onOpenCreateGroup}
            onOpenSettings={onOpenSettings}
          />
        </div>

        {/* Right Active Chat Pane */}
        <div
          className={`flex-1 min-w-0 min-h-0 h-full flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'
            }`}
        >
          {children}
        </div>
      </div>

      {/* <SettingsModal isOpen={false} onClose={() => { }} /> */}
    </div>
  );
}
