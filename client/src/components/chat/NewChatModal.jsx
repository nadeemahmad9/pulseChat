import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { apiFetch } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { Search, X, User, MessageSquare } from 'lucide-react';

export default function NewChatModal({ isOpen, onClose }) {
  const { startPrivateChat } = useChat();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        setUsers(data.users || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const handleSelectUser = async (userId) => {
    await startPrivateChat(userId);
    onClose();
  };

  return (
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              New Conversation
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, @username, email, or phone..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <p className="text-center py-6 text-xs text-gray-400">Searching contacts...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-xs text-gray-400">
                {query.trim() ? 'No users matching your query' : 'Type to search users across PulseChat'}
              </p>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u._id)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#202c33] cursor-pointer transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.username} • {u.bio}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  );
}
