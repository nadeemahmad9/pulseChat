// import React, { useRef, useEffect, useState } from 'react';
// import { useChat } from '../../context/ChatContext';
// import { useAuth } from '../../context/AuthContext';
// import MessageBubble from './MessageBubble';
// import ContextMenu from '../common/ContextMenu';
// import { MessageSkeleton } from '../common/SkeletonLoaders';
// import { ChevronDown } from 'lucide-react';
// import { formatChatTimestamp } from '../../utils/dateUtils';

// export default function MessageList({ onMediaClick, onOpenForward }) {
//   const { user } = useAuth();
//   const { messages, loadingMessages, toggleReaction, deleteMsg, setReplyingToMessage, setEditingMessage } = useChat();

//   const containerRef = useRef(null);
//   const bottomRef = useRef(null);

//   const [showScrollBottom, setShowScrollBottom] = useState(false);
//   const [contextMenu, setContextMenu] = useState(null); // { x, y, message }

//   // Auto-scroll to bottom logic
//   const scrollToBottom = (smooth = true) => {
//     bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
//   };

//   useEffect(() => {
//     scrollToBottom(false);
//   }, [messages.length]);

//   const handleScroll = () => {
//     if (!containerRef.current) return;
//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
//     setShowScrollBottom(isFarFromBottom);
//   };

//   const handleContextMenu = (e, message) => {
//     setContextMenu({
//       x: e.clientX,
//       y: e.clientY,
//       message,
//     });
//   };

//   // Group messages by date
//   const renderMessagesWithDates = () => {
//     const items = [];
//     let lastDateStr = null;

//     messages.forEach((msg, idx) => {
//       const msgDateStr = formatChatTimestamp(msg.createdAt);
//       if (msgDateStr !== lastDateStr) {
//         lastDateStr = msgDateStr;
//         items.push(
//           <div key={`date_${idx}`} className="flex justify-center my-4">
//             <span className="px-3 py-1 bg-gray-200/70 dark:bg-[#182229] text-gray-600 dark:text-gray-400 text-[11px] font-semibold rounded-full shadow-2xs">
//               {msgDateStr}
//             </span>
//           </div>
//         );
//       }

//       const isOwn = msg.sender?._id === user._id;

//       items.push(
//         <MessageBubble
//           key={msg._id || idx}
//           message={msg}
//           isOwn={isOwn}
//           onContextMenu={handleContextMenu}
//           onReact={(emoji) => toggleReaction(msg._id, emoji)}
//           onReply={(replyMsg) => setReplyingToMessage(replyMsg || msg)}
//           onMediaClick={onMediaClick}
//         />
//       );
//     });

//     return items;
//   };

//   if (loadingMessages) {
//     return <MessageSkeleton />;
//   }

//   return (
//     <div
//       ref={containerRef}
//       onScroll={handleScroll}
//       className="flex-1 overflow-y-auto p-4 space-y-1 relative bg-[#efeae2] dark:bg-[#0b141a]"
//       style={{
//         backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)',
//         backgroundSize: '24px 24px',
//       }}
//     >
//       {messages.length === 0 ? (
//         <div className="h-full flex items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
//           <div className="bg-white/80 dark:bg-[#111b21]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-sm">
//             <p className="text-sm font-semibold mb-1">No messages yet</p>
//             <p className="text-xs opacity-75">Send a message below to start the conversation!</p>
//           </div>
//         </div>
//       ) : (
//         renderMessagesWithDates()
//       )}

//       <div ref={bottomRef} />

//       {/* Floating Scroll to Bottom Button */}
//       {showScrollBottom && (
//         <button
//           onClick={() => scrollToBottom(true)}
//           className="fixed bottom-20 right-6 p-3 bg-white dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition z-30"
//         >
//           <ChevronDown className="w-5 h-5" />
//         </button>
//       )}

//       {/* Right click Context Menu */}
//       {contextMenu && (
//         <ContextMenu
//           x={contextMenu.x}
//           y={contextMenu.y}
//           isOwn={contextMenu.message.sender?._id === user._id}
//           onReply={() => setReplyingToMessage(contextMenu.message)}
//           onReact={(emoji) => toggleReaction(contextMenu.message._id, emoji)}
//           onForward={() => onOpenForward(contextMenu.message)}
//           onCopy={() => navigator.clipboard.writeText(contextMenu.message.content)}
//           onEdit={() => setEditingMessage(contextMenu.message)}
//           onDelete={() => deleteMsg(contextMenu.message._id, contextMenu.message.sender?._id === user._id)}
//           onClose={() => setContextMenu(null)}
//         />
//       )}
//     </div>
//   );
// }


import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import ContextMenu from '../common/ContextMenu';
import { MessageSkeleton } from '../common/SkeletonLoaders';
import { ChevronDown } from 'lucide-react';
import { formatChatTimestamp } from '../../utils/dateUtils';
import DeleteModal from '../common/deleteModal';

export default function MessageList({ onMediaClick, onOpenForward }) {
  const { user } = useAuth();
  const { messages, loadingMessages, toggleReaction, deleteMsg, setReplyingToMessage, setEditingMessage } = useChat();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteModalMsg, setDeleteModalMsg] = useState(null); // <-- Selected msg for delete

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleContextMenu = (e, message) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const renderMessagesWithDates = () => {
    const items = [];
    let lastDateStr = null;

    messages.forEach((msg, idx) => {
      const msgDateStr = formatChatTimestamp(msg.createdAt);
      if (msgDateStr !== lastDateStr) {
        lastDateStr = msgDateStr;
        items.push(
          <div key={`date_${idx}`} className="flex justify-center my-4">
            <span className="px-3 py-1 bg-gray-200/70 dark:bg-[#182229] text-gray-600 dark:text-gray-400 text-[11px] font-semibold rounded-full shadow-2xs">
              {msgDateStr}
            </span>
          </div>
        );
      }

      const isOwn = (msg.sender?._id || msg.sender) === user._id;

      items.push(
        <MessageBubble
          key={msg._id || idx}
          message={msg}
          isOwn={isOwn}
          onContextMenu={handleContextMenu}
          onReact={(emoji) => toggleReaction(msg._id, emoji)}
          onReply={(replyMsg) => setReplyingToMessage(replyMsg || msg)}
          onMediaClick={onMediaClick}
        />
      );
    });

    return items;
  };

  if (loadingMessages) {
    return <MessageSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-1 relative bg-[#efeae2] dark:bg-[#0b141a]"
      style={{
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
          <div className="bg-white/80 dark:bg-[#111b21]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-sm">
            <p className="text-sm font-semibold mb-1">No messages yet</p>
            <p className="text-xs opacity-75">Send a message below to start the conversation!</p>
          </div>
        </div>
      ) : (
        renderMessagesWithDates()
      )}

      <div ref={bottomRef} />

      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-20 right-6 p-3 bg-white dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition z-30"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Right click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={(contextMenu.message.sender?._id || contextMenu.message.sender) === user._id}
          onReply={() => setReplyingToMessage(contextMenu.message)}
          onReact={(emoji) => toggleReaction(contextMenu.message._id, emoji)}
          onForward={() => onOpenForward(contextMenu.message)}
          onCopy={() => navigator.clipboard.writeText(contextMenu.message.content || '')}
          onEdit={() => setEditingMessage(contextMenu.message)}
          onDelete={() => setDeleteModalMsg(contextMenu.message)} // <-- Opens delete modal
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteModalMsg)}
        isOwn={(deleteModalMsg?.sender?._id || deleteModalMsg?.sender) === user._id}
        onClose={() => setDeleteModalMsg(null)}
        onDeleteForMe={() => deleteMsg(deleteModalMsg._id, false)} // <-- false = delete for me
        onDeleteForEveryone={() => deleteMsg(deleteModalMsg._id, true)} // <-- true = delete for everyone
      />
    </div>
  );
}