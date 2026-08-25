import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../services/api';
import ConfirmModal from '../common/ConfirmModal';
import { Users, X, Shield, Crown, UserMinus, LogOut, Edit, Check } from 'lucide-react';

export default function GroupDetailsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { activeConversation, selectConversation, fetchConversations } = useChat();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeConversation?.name || '');
  const [description, setDescription] = useState(activeConversation?.description || '');
  const [loading, setLoading] = useState(false);

  const [confirmLeave, setConfirmLeave] = useState(false);

  if (!isOpen || !activeConversation || activeConversation.type !== 'group') return null;

  const isAdmin = activeConversation.admins.some((a) => (a._id || a).toString() === user._id.toString());

  const handleUpdateGroupInfo = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/conversations/group/${activeConversation._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, description }),
      });
      addToast('Group details updated', 'success');
      setIsEditing(false);
      await fetchConversations();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (actionType, memberId) => {
    try {
      const payload = {};
      if (actionType === 'promote') payload.promoteAdmins = [memberId];
      if (actionType === 'demote') payload.demoteAdmins = [memberId];
      if (actionType === 'remove') payload.removeMembers = [memberId];

      await apiFetch(`/api/conversations/group/${activeConversation._id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      addToast('Group member updated', 'info');
      await fetchConversations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await apiFetch(`/api/conversations/group/${activeConversation._id}/leave`, {
        method: 'POST',
      });
      addToast('You left the group', 'info');
      selectConversation(null);
      await fetchConversations();
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Group Information
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Info Header */}
        <div className="text-center py-4 border-b border-gray-200 dark:border-gray-800 mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-3xl font-bold mb-3 shadow-inner">
            {activeConversation.name.charAt(0).toUpperCase()}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-100 dark:bg-[#202c33] text-sm rounded-lg text-center font-bold text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full px-3 py-1 bg-gray-100 dark:bg-[#202c33] text-xs rounded-lg text-center text-gray-500"
              />
              <button
                onClick={handleUpdateGroupInfo}
                disabled={loading}
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{activeConversation.name}</h4>
                {isAdmin && (
                  <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-500">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeConversation.description || 'No group description provided.'}
              </p>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Group Members ({activeConversation.participants.length})
          </h5>

          {activeConversation.participants.map((m) => {
            const memberIsAdmin = activeConversation.admins.some((a) => (a._id || a).toString() === m._id.toString());
            const isSelf = m._id.toString() === user._id.toString();

            return (
              <div
                key={m._id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#202c33] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                    {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : m.name.charAt(0)}
                  </div>
                  <div>
                    <h6 className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                      {m.name} {isSelf && '(You)'}
                      {memberIsAdmin && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />}
                    </h6>
                    <p className="text-[10px] text-gray-400">@{m.username}</p>
                  </div>
                </div>

                {/* Admin controls */}
                {isAdmin && !isSelf && (
                  <div className="flex items-center gap-1">
                    {memberIsAdmin ? (
                      <button
                        onClick={() => handleAdminAction('demote', m._id)}
                        className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg text-[10px]"
                        title="Demote Admin"
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdminAction('promote', m._id)}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg text-[10px]"
                        title="Make Admin"
                      >
                        Promote
                      </button>
                    )}
                    <button
                      onClick={() => handleAdminAction('remove', m._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      title="Remove Member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Leave Group Action */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setConfirmLeave(true)}
            className="w-full py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Leave Group
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmLeave}
        title="Leave Group?"
        message={`Are you sure you want to leave ${activeConversation.name}?`}
        confirmText="Leave Group"
        danger
        onConfirm={handleLeaveGroup}
        onClose={() => setConfirmLeave(false)}
      />
    </div>
  );
}
