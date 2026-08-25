import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatChatTimestamp } from '../../utils/dateUtils';
import { getReceiptStatus } from '../../utils/receiptUtils';
import { Pin, VolumeX, Users, Check, CheckCheck } from 'lucide-react';

export default function ChatListItem({ conversation, isActive, onSelect, onPin, onMute, onArchive }) {
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();

  const isGroup = conversation.type === 'group';

  // Get recipient if 1-on-1
  const recipient = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== user._id) || conversation.participants[0];

  const title = isGroup ? conversation.name : recipient?.name || 'Unknown User';
  const avatar = isGroup ? conversation.avatar : recipient?.avatar;
  const isOnline = !isGroup && (recipient?.isOnline || onlineUserIds.has(recipient?._id));

  const isPinned = user.pinnedConversations?.includes(conversation._id);
  const isMuted = user.mutedConversations?.includes(conversation._id);

  const lastMsg = conversation.lastMessage;
  let lastMessageText = 'No messages yet';
  if (lastMsg) {
    if (lastMsg.type === 'image') lastMessageText = '📷 Photo';
    else if (lastMsg.type === 'audio') lastMessageText = '🎙️ Voice note';
    else if (lastMsg.type === 'video') lastMessageText = '🎥 Video';
    else if (lastMsg.type === 'document' || lastMsg.type === 'file') lastMessageText = '📄 Document';
    else if (lastMsg.type === 'system') lastMessageText = lastMsg.content;
    else lastMessageText = lastMsg.content;
  }

  // Ticks formatting for own last message
  const senderId = lastMsg?.sender?._id || lastMsg?.sender;
  const isOwnLastMsg = lastMsg && senderId?.toString() === user._id.toString();
  const receiptStatus = isOwnLastMsg ? getReceiptStatus(lastMsg, user._id, conversation) : null;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600/10 dark:bg-indigo-500/15 text-gray-900 dark:text-white border border-indigo-500/30'
          : 'hover:bg-gray-100 dark:hover:bg-[#202c33] text-gray-700 dark:text-gray-300'
      }`}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 shadow-xs">
          {avatar ? (
            <img src={avatar} alt={title} className="w-full h-full object-cover" />
          ) : isGroup ? (
            <Users className="w-6 h-6 text-indigo-500" />
          ) : (
            title.charAt(0).toUpperCase()
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#111b21] rounded-full" />
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">{title}</h4>
          <span className="text-[11px] text-gray-400 font-normal shrink-0 ml-2">
            {formatChatTimestamp(conversation.lastMessageAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 truncate">
            {isOwnLastMsg && lastMsg.type !== 'system' && (
              <span>
                {receiptStatus === 'READ' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />
                ) : receiptStatus === 'DELIVERED' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-gray-400 inline" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-gray-400 inline" />
                )}
              </span>
            )}
            <span className="truncate">{lastMessageText}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
            {isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
            {conversation.unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-[18px] text-center shadow-xs">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
