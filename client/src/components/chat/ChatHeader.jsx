import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { formatLastSeen } from '../../utils/dateUtils';
import { ArrowLeft, Users, Search, MoreVertical, ShieldAlert } from 'lucide-react';

export default function ChatHeader({ onBack, onOpenInfo, onOpenReport }) {
  const { user } = useAuth();
  const { activeConversation, typingUsers } = useChat();
  const { onlineUserIds } = useSocket();

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'group';
  const recipient = isGroup
    ? null
    : activeConversation.participants.find((p) => p._id !== user._id) || activeConversation.participants[0];

  const title = isGroup ? activeConversation.name : recipient?.name || 'Unknown User';
  const avatar = isGroup ? activeConversation.avatar : recipient?.avatar;
  const isOnline = !isGroup && (recipient?.isOnline || onlineUserIds.has(recipient?._id));

  // Live typing indicator status
  const conversationTypingMap = typingUsers[activeConversation._id] || {};
  const typingUserNames = Object.values(conversationTypingMap).map((u) => u.name);

  let statusText = '';
  if (typingUserNames.length > 0) {
    statusText = typingUserNames.length === 1
      ? `${typingUserNames[0]} is typing...`
      : `${typingUserNames.join(', ')} are typing...`;
  } else if (isGroup) {
    statusText = `${activeConversation.participants.length} members`;
  } else {
    statusText = formatLastSeen(isOnline, recipient?.lastSeen);
  }

  return (
    <div className="h-16 px-3 sm:px-4 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-20 shrink-0 w-full">
      {/* Left: Back button + User Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onBack}
          title="Back to chats"
          className="md:hidden p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div onClick={onOpenInfo} className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0 flex-1 group">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
              {avatar ? (
                <img src={avatar} alt={title} className="w-full h-full object-cover" />
              ) : isGroup ? (
                <Users className="w-5 h-5 text-indigo-500" />
              ) : (
                title.charAt(0).toUpperCase()
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#202c33] rounded-full" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-500 transition truncate">
              {title}
            </h3>
            <p className={`text-xs truncate ${typingUserNames.length > 0 ? 'text-indigo-500 font-medium animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
              {statusText}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenReport}
          title="Report User"
          className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenInfo}
          title="Conversation Details"
          className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
