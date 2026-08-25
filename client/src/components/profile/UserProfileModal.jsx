import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../services/api';
import { formatLastSeen } from '../../utils/dateUtils';
import { User, X, Phone, Mail, ShieldAlert, Ban, VolumeX, Image as ImageIcon } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, onOpenReport }) {
  const { user } = useAuth();
  const { activeConversation, toggleMute, messages } = useChat();
  const { addToast } = useToast();

  if (!isOpen || !activeConversation || activeConversation.type !== 'private') return null;

  const recipient = activeConversation.participants.find((p) => p._id !== user._id) || activeConversation.participants[0];
  const isMuted = user.mutedConversations?.includes(activeConversation._id);
  const isBlocked = user.blockedUsers?.some((b) => (b._id || b) === recipient._id);

  // Extract shared media from messages
  const sharedMedia = messages.filter(
    (m) => m.attachments && m.attachments.some((a) => a.mimeType?.startsWith('image/'))
  );

  const handleToggleBlock = async () => {
    try {
      const endpoint = isBlocked ? `/api/users/unblock/${recipient._id}` : `/api/users/block/${recipient._id}`;
      const res = await apiFetch(endpoint, { method: 'POST' });
      addToast(res.message, 'info');
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    //   <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
    //     <div className="flex justify-between items-center mb-4">
    //       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
    //         <User className="w-5 h-5 text-indigo-500" />
    //         Contact Info
    //       </h3>
    //       <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
    //         <X className="w-5 h-5" />
    //       </button>
    //     </div>

    //     {/* User Avatar & Header */}
    //     <div className="text-center py-4 border-b border-gray-200 dark:border-gray-800">
    //       <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-600 dark:text-gray-300 shadow-md mb-3">
    //         {recipient.avatar ? (
    //           <img src={recipient.avatar} alt={recipient.name} className="w-full h-full object-cover" />
    //         ) : (
    //           recipient.name.charAt(0).toUpperCase()
    //         )}
    //       </div>
    //       <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{recipient.name}</h4>
    //       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">@{recipient.username}</p>
    //       <p className="text-xs text-indigo-500 font-medium mt-1">
    //         {formatLastSeen(recipient.isOnline, recipient.lastSeen)}
    //       </p>
    //     </div>

    //     {/* Bio & Details */}
    //     <div className="py-4 space-y-3 border-b border-gray-200 dark:border-gray-800 text-sm">
    //       <div>
    //         <span className="text-xs font-semibold text-gray-400 block">About & Bio</span>
    //         <p className="text-gray-800 dark:text-gray-200 mt-0.5">{recipient.bio || 'Hey there! I am using PulseChat.'}</p>
    //       </div>

    //       {recipient.email && (
    //         <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
    //           <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
    //           <span>{recipient.email}</span>
    //         </div>
    //       )}

    //       {recipient.phone && (
    //         <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
    //           <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
    //           <span>{recipient.phone}</span>
    //         </div>
    //       )}
    //     </div>

    //     {/* Shared Media Grid */}
    //     <div className="py-4 border-b border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto">
    //       <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
    //         <ImageIcon className="w-4 h-4" />
    //         Shared Media ({sharedMedia.length})
    //       </h5>

    //       {sharedMedia.length === 0 ? (
    //         <p className="text-xs text-gray-400 italic">No media shared in this conversation yet.</p>
    //       ) : (
    //         <div className="grid grid-cols-4 gap-2">
    //           {sharedMedia.slice(0, 8).map((m) =>
    //             m.attachments.map((att, idx) => (
    //               <div key={idx} className="h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#202c33]">
    //                 <img src={att.url} alt="Shared" className="w-full h-full object-cover" />
    //               </div>
    //             ))
    //           )}
    //         </div>
    //       )}
    //     </div>

    //     {/* Actions */}
    //     <div className="pt-4 space-y-2">
    //       <button
    //         onClick={() => toggleMute(activeConversation._id)}
    //         className="w-full py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl flex items-center gap-3 transition"
    //       >
    //         <VolumeX className="w-4 h-4 text-gray-500" />
    //         <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
    //       </button>

    //       <button
    //         onClick={onOpenReport}
    //         className="w-full py-2 px-3 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl flex items-center gap-3 transition"
    //       >
    //         <ShieldAlert className="w-4 h-4" />
    //         <span>Report Contact</span>
    //       </button>

    //       <button
    //         onClick={handleToggleBlock}
    //         className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-3 transition"
    //       >
    //         <Ban className="w-4 h-4" />
    //         <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
    //       </button>
    //     </div>
    //   </div>
    // </div>

    createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overscroll-contain">
        <div
          role="dialog"
          aria-modal="true"
          className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl flex flex-col min-h-0 max-h-[calc(100dvh-1rem)] sm:max-h-[85vh] overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Contact Info
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Avatar & Header */}
          <div className="text-center py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-600 dark:text-gray-300 shadow-md mb-3">
              {recipient.avatar ? (
                <img src={recipient.avatar} alt={recipient.name} className="w-full h-full object-cover" />
              ) : (
                recipient.name.charAt(0).toUpperCase()
              )}
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{recipient.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">@{recipient.username}</p>
            <p className="text-xs text-indigo-500 font-medium mt-1">
              {formatLastSeen(recipient.isOnline, recipient.lastSeen)}
            </p>
          </div>

          {/* Bio & Details */}
          <div className="py-4 space-y-3 border-b border-gray-200 dark:border-gray-800 text-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 block">About & Bio</span>
              <p className="text-gray-800 dark:text-gray-200 mt-0.5">{recipient.bio || 'Hey there! I am using PulseChat.'}</p>
            </div>

            {recipient.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{recipient.email}</span>
              </div>
            )}

            {recipient.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{recipient.phone}</span>
              </div>
            )}
          </div>

          {/* Shared Media Grid */}
          <div className="py-4 border-b border-gray-200 dark:border-gray-800 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              Shared Media ({sharedMedia.length})
            </h5>

            {sharedMedia.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No media shared in this conversation yet.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {sharedMedia.slice(0, 8).map((m) =>
                  m.attachments.map((att, idx) => (
                    <div key={idx} className="h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#202c33]">
                      <img src={att.url} alt="Shared" className="w-full h-full object-cover" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-2">
            <button
              onClick={() => toggleMute(activeConversation._id)}
              className="w-full py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl flex items-center gap-3 transition"
            >
              <VolumeX className="w-4 h-4 text-gray-500" />
              <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
            </button>

            <button
              onClick={onOpenReport}
              className="w-full py-2 px-3 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl flex items-center gap-3 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Contact</span>
            </button>

            <button
              onClick={handleToggleBlock}
              className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-3 transition"
            >
              <Ban className="w-4 h-4" />
              <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  );
}
