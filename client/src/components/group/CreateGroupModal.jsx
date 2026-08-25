import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { apiFetch } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { Users, X, Search, Check, Camera } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose }) {
  const { fetchConversations, selectConversation } = useChat();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const search = async () => {
      try {
        const data = await apiFetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        setSearchResults(data.users || []);
      } catch (err) {
        console.error(err);
      }
    };
    search();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const toggleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return addToast('Group name is required', 'error');
    if (selectedUsers.length === 0) return addToast('Select at least 1 member for the group', 'error');

    setLoading(true);
    try {
      const data = await apiFetch('/api/conversations/group', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          avatar,
          participants: selectedUsers.map((u) => u._id),
        }),
      });

      addToast(`Group "${name}" created successfully!`, 'success');
      await fetchConversations();
      selectConversation(data.group);
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Create Group Chat
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 flex-1 flex flex-col min-h-0">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team, Football Club"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group about?"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Selected members pills */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 dark:bg-[#202c33] rounded-xl max-h-24 overflow-y-auto">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    onClick={() => toggleSelectUser(u)}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-600 transition"
                  >
                    {u.name}
                    <X className="w-3 h-3" />
                  </span>
                ))}
              </div>
            )}

            {/* Search contacts to add */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Add Members</label>
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users to add..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1 border border-gray-200 dark:border-gray-800 rounded-xl p-2">
                {searchResults.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-400">Search users above to add to group</p>
                ) : (
                  searchResults.map((u) => {
                    const isSelected = selectedUsers.some((sel) => sel._id === u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleSelectUser(u)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition ${isSelected
                          ? 'bg-indigo-500/15 border border-indigo-500/30'
                          : 'hover:bg-gray-100 dark:hover:bg-[#202c33]'
                          }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</h5>
                          <p className="text-[10px] text-gray-400 truncate">@{u.username}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
  );
}
