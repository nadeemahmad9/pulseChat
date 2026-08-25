import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../services/api';
import { ShieldAlert, X } from 'lucide-react';

export default function ReportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { activeConversation } = useChat();
  const { addToast } = useToast();

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeConversation) return null;

  const recipient = activeConversation.type === 'private'
    ? activeConversation.participants.find((p) => p._id !== user._id) || activeConversation.participants[0]
    : activeConversation.createdBy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedUser: recipient._id,
          reason,
          conversation: activeConversation._id,
        }),
      });

      addToast('Report submitted. Thank you for keeping PulseChat safe.', 'success');
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Report Contact
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Please select or describe the reason for reporting <span className="font-bold">{recipient?.name}</span>:
          </p>

          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Spam, harassment, inappropriate behavior..."
            className="w-full p-3 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-rose-500 focus:outline-none"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
