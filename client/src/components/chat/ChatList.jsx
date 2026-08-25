import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatListItem from './ChatListItem';
import { ChatListSkeleton } from '../common/SkeletonLoaders';
import { Search, Plus, Users, Pin, Archive, MessageSquare, Settings } from 'lucide-react';

export default function ChatList({ onOpenNewChat, onOpenCreateGroup, onOpenSettings }) {
  const { user } = useAuth();
  const { conversations, activeConversation, selectConversation, loadingConversations, togglePin, toggleMute, toggleArchive } = useChat();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pinned' | 'groups' | 'archived'
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const isPinned = user?.pinnedConversations?.includes(conv._id);
    const isArchived = user?.archivedConversations?.includes(conv._id);

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = conv.type === 'group'
        ? conv.name
        : conv.participants.find((p) => p._id !== user._id)?.name || '';
      if (!title.toLowerCase().includes(q)) return false;
    }

    if (activeTab === 'archived') return isArchived;
    if (isArchived) return false; // Hide archived from normal tabs

    if (activeTab === 'pinned') return isPinned;
    if (activeTab === 'groups') return conv.type === 'group';

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800">
      {/* Top Header Controls */}
      <div className="p-3.5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onOpenSettings}
              className="sm:hidden w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 shrink-0 border border-indigo-500"
              title="Settings & Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </button>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
              <MessageSquare className="w-5 h-5 text-indigo-500 shrink-0" />
              Chats
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenNewChat}
              title="New Chat"
              className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] transition shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenCreateGroup}
              title="Create Group"
              className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] transition shrink-0"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="sm:hidden p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] transition shrink-0"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'pinned', label: 'Pinned', icon: Pin },
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'archived', label: 'Archived', icon: Archive },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a3942]'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingConversations ? (
          <ChatListSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs opacity-75 mt-1">Click the + icon above to start chatting!</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ChatListItem
              key={conv._id}
              conversation={conv}
              isActive={activeConversation?._id === conv._id}
              onSelect={() => selectConversation(conv)}
              onPin={() => togglePin(conv._id)}
              onMute={() => toggleMute(conv._id)}
              onArchive={() => toggleArchive(conv._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
