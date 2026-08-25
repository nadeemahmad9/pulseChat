import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { formatMessageTime } from '../../utils/dateUtils';
import { formatFileSize } from '../../utils/fileUtils';
import { getReceiptStatus } from '../../utils/receiptUtils';
import { Check, CheckCheck, FileText, Play, Smile, CornerUpLeft } from 'lucide-react';

export default function MessageBubble({ message, isOwn, onContextMenu, onReact, onReply, onMediaClick }) {
  const { user } = useAuth();
  const { activeConversation } = useChat();

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 bg-gray-200/80 dark:bg-[#182229] text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg shadow-2xs">
          {message.content}
        </span>
      </div>
    );
  }

  const receiptStatus = isOwn ? getReceiptStatus(message, user?._id, activeConversation) : null;

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, message);
      }}
      className={`group flex flex-col my-1.5 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs transition ${
          isOwn
            ? 'bg-indigo-600 dark:bg-[#005c4b] text-white rounded-br-xs'
            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200/60 dark:border-transparent'
        }`}
      >
        {/* Sender name in groups for incoming messages */}
        {!isOwn && message.sender?.name && (
          <div className="text-[11px] font-bold text-indigo-500 dark:text-emerald-400 mb-1">
            {message.sender.name}
          </div>
        )}

        {/* Reply Preview inside bubble */}
        {message.replyTo && (
          <div
            onClick={() => onReply(message.replyTo)}
            className={`p-2 mb-2 rounded-lg border-l-4 cursor-pointer text-xs ${
              isOwn
                ? 'bg-black/10 border-indigo-300 text-white/90'
                : 'bg-gray-100 dark:bg-[#111b21] border-indigo-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold text-[11px] flex items-center gap-1">
              <CornerUpLeft className="w-3 h-3 inline" />
              {message.replyTo.sender?.name || 'User'}
            </div>
            <p className="truncate opacity-80">{message.replyTo.content || 'Media message'}</p>
          </div>
        )}

        {/* Media Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((att, idx) => {
              if (att.mimeType?.startsWith('image/') || message.type === 'image') {
                return (
                  <div
                    key={idx}
                    onClick={() => onMediaClick(att.url)}
                    className="rounded-xl overflow-hidden cursor-pointer border border-black/10 max-h-72"
                  >
                    <img src={att.url} alt="Uploaded media" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                );
              }
              if (att.mimeType?.startsWith('video/') || message.type === 'video') {
                return (
                  <video key={idx} controls className="rounded-xl max-h-72 w-full">
                    <source src={att.url} type={att.mimeType} />
                  </video>
                );
              }
              if (att.mimeType?.startsWith('audio/') || message.type === 'audio') {
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-black/10 dark:bg-black/20 rounded-xl">
                    <audio controls src={att.url} className="w-full h-10 rounded-lg" />
                  </div>
                );
              }
              // Document / File
              return (
                <a
                  key={idx}
                  href={att.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-2.5 bg-black/10 dark:bg-black/20 rounded-xl hover:bg-black/20 transition text-xs"
                >
                  <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <p className="font-medium truncate">{att.filename || 'Attachment'}</p>
                    <p className="opacity-70 text-[10px]">{formatFileSize(att.size)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.isDeleted ? (
              <span className="italic opacity-60">{message.content}</span>
            ) : (
              message.content
            )}
          </p>
        )}

        {/* Footer timestamp & status ticks */}
        <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1">
          {message.editedAt && <span>edited</span>}
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            <span>
              {receiptStatus === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
              ) : receiptStatus === 'DELIVERED' ? (
                <CheckCheck className="w-3.5 h-3.5 text-white/80" />
              ) : (
                <Check className="w-3.5 h-3.5 text-white/80" />
              )}
            </span>
          )}
        </div>

        {/* Reactions display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="absolute -bottom-2 right-2 flex bg-white dark:bg-[#182229] px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs shadow-xs">
            {Array.from(new Set(message.reactions.map((r) => r.emoji))).map((emoji, idx) => (
              <span key={idx}>{emoji}</span>
            ))}
            {message.reactions.length > 1 && (
              <span className="text-[10px] ml-1 font-bold opacity-70">{message.reactions.length}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
