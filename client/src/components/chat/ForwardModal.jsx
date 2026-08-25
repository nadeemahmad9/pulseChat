import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../services/api';
import { Forward, X, Check } from 'lucide-react';

export default function ForwardModal({ message, isOpen, onClose }) {
  const { conversations } = useChat();
  const { addToast } = useToast();

  const [selectedConvIds, setSelectedConvIds] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !message) return null;

  const toggleSelect = (id) => {
    if (selectedConvIds.includes(id)) {
      setSelectedConvIds(selectedConvIds.filter((item) => item !== id));
    } else {
      setSelectedConvIds([...selectedConvIds, id]);
    }
  };

  const handleForward = async () => {
    if (selectedConvIds.length === 0) return;
    setLoading(true);
    try {
      await apiFetch('/api/messages/forward', {
        method: 'POST',
        body: JSON.stringify({
          messageId: message._id,
          targetConversationIds: selectedConvIds,
        }),
      });

      addToast(`Message forwarded to ${selectedConvIds.length} conversation(s)!`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Forward className="w-5 h-5 text-indigo-500" />
            Forward Message
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="p-3 bg-gray-100 dark:bg-[#202c33] rounded-xl text-xs text-gray-600 dark:text-gray-300 italic mb-3 border-l-4 border-indigo-500">
          "{message.content || 'Media message'}"
        </div>

        {/* Conversations checklist */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mb-4">
          {conversations.map((c) => {
            const isSelected = selectedConvIds.includes(c._id);
            const title = c.type === 'group' ? c.name : c.participants.find((p) => p._id !== message.sender?._id)?.name || 'User';

            return (
              <div
                key={c._id}
                onClick={() => toggleSelect(c._id)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-500/15 border border-indigo-500/30'
                    : 'hover:bg-gray-100 dark:hover:bg-[#202c33]'
                }`}
              >
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</span>
                {isSelected && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={loading || selectedConvIds.length === 0}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md disabled:opacity-50"
          >
            {loading ? 'Forwarding...' : `Send (${selectedConvIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
