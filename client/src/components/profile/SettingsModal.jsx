import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../services/api';
import { soundService } from '../../services/sound';
import { Settings, X, User, Lock, Moon, Sun, Bell, Shield, LogOut, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled } = useChat();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'privacy' | 'appearance'
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const [lastSeenPrivacy, setLastSeenPrivacy] = useState(user?.privacySettings?.lastSeen || 'everyone');
  const [photoPrivacy, setPhotoPrivacy] = useState(user?.privacySettings?.profilePhoto || 'everyone');
  const [readReceipts, setReadReceipts] = useState(user?.privacySettings?.readReceipts ?? true);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, username, bio, avatar }),
      });
      updateUserProfile(data.user);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await apiFetch('/api/users/privacy', {
        method: 'PATCH',
        body: JSON.stringify({
          lastSeen: lastSeenPrivacy,
          profilePhoto: photoPrivacy,
          readReceipts,
        }),
      });
      addToast('Privacy settings saved!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
    //   <div className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
    //     <div className="flex justify-between items-center mb-4">
    //       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
    //         <Settings className="w-5 h-5 text-indigo-500" />
    //         Settings
    //       </h3>
    //       <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
    //         <X className="w-5 h-5" />
    //       </button>
    //     </div>

    //     {/* Tabs */}
    //     <div className="flex bg-gray-100 dark:bg-[#202c33] p-1 rounded-xl mb-4">
    //       <button
    //         onClick={() => setActiveTab('profile')}
    //         className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
    //           }`}
    //       >
    //         <User className="w-3.5 h-3.5" /> Profile
    //       </button>
    //       <button
    //         onClick={() => setActiveTab('privacy')}
    //         className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
    //           }`}
    //       >
    //         <Shield className="w-3.5 h-3.5" /> Privacy
    //       </button>
    //       <button
    //         onClick={() => setActiveTab('appearance')}
    //         className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
    //           }`}
    //       >
    //         <Sun className="w-3.5 h-3.5" /> Appearance
    //       </button>
    //     </div>

    //     {/* Tab Contents */}
    //     <div className="flex-1 overflow-y-auto pr-1 space-y-4">
    //       {activeTab === 'profile' && (
    //         <form onSubmit={handleSaveProfile} className="space-y-4">
    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Avatar Image URL</label>
    //             <input
    //               type="url"
    //               value={avatar}
    //               onChange={(e) => setAvatar(e.target.value)}
    //               placeholder="https://example.com/avatar.jpg"
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
    //             />
    //           </div>

    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
    //             <input
    //               type="text"
    //               required
    //               value={name}
    //               onChange={(e) => setName(e.target.value)}
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
    //             />
    //           </div>

    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
    //             <input
    //               type="text"
    //               required
    //               value={username}
    //               onChange={(e) => setUsername(e.target.value)}
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
    //             />
    //           </div>

    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio / About</label>
    //             <textarea
    //               value={bio}
    //               rows={3}
    //               onChange={(e) => setBio(e.target.value)}
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
    //             />
    //           </div>

    //           <button
    //             type="submit"
    //             disabled={loading}
    //             className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
    //           >
    //             {loading ? 'Saving...' : 'Save Profile Changes'}
    //           </button>
    //         </form>
    //       )}

    //       {activeTab === 'privacy' && (
    //         <div className="space-y-4">
    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Who can see Last Seen</label>
    //             <select
    //               value={lastSeenPrivacy}
    //               onChange={(e) => setLastSeenPrivacy(e.target.value)}
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl"
    //             >
    //               <option value="everyone">Everyone</option>
    //               <option value="contacts">My Contacts</option>
    //               <option value="nobody">Nobody</option>
    //             </select>
    //           </div>

    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Who can see Profile Photo</label>
    //             <select
    //               value={photoPrivacy}
    //               onChange={(e) => setPhotoPrivacy(e.target.value)}
    //               className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl"
    //             >
    //               <option value="everyone">Everyone</option>
    //               <option value="contacts">My Contacts</option>
    //               <option value="nobody">Nobody</option>
    //             </select>
    //           </div>

    //           <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#202c33] rounded-xl">
    //             <div>
    //               <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Read Receipts</h5>
    //               <p className="text-[10px] text-gray-500">Show blue checkmarks when messages are read</p>
    //             </div>
    //             <input
    //               type="checkbox"
    //               checked={readReceipts}
    //               onChange={(e) => setReadReceipts(e.target.checked)}
    //               className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
    //             />
    //           </div>

    //           <button
    //             onClick={handleSavePrivacy}
    //             className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
    //           >
    //             Save Privacy Settings
    //           </button>
    //         </div>
    //       )}

    //       {activeTab === 'appearance' && (
    //         <div className="space-y-4">
    //           <div>
    //             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Theme Preference</label>
    //             <div className="grid grid-cols-3 gap-2">
    //               {[
    //                 { id: 'light', label: 'Light', icon: Sun },
    //                 { id: 'dark', label: 'Dark', icon: Moon },
    //                 { id: 'system', label: 'System', icon: Settings },
    //               ].map((t) => (
    //                 <button
    //                   key={t.id}
    //                   onClick={() => setTheme(t.id)}
    //                   className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition ${theme === t.id
    //                     ? 'border-indigo-600 bg-indigo-500/10 text-indigo-500'
    //                     : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#202c33]'
    //                     }`}
    //                 >
    //                   <t.icon className="w-5 h-5" />
    //                   {t.label}
    //                 </button>
    //               ))}
    //             </div>
    //           </div>

    //           <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#202c33] rounded-xl">
    //             <div>
    //               <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Sound Notifications</h5>
    //               <p className="text-[10px] text-gray-500">Play audio chimes for incoming & outgoing messages</p>
    //             </div>
    //             <input
    //               type="checkbox"
    //               checked={soundEnabled}
    //               onChange={(e) => {
    //                 setSoundEnabled(e.target.checked);
    //                 soundService.toggleSound(e.target.checked);
    //               }}
    //               className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
    //             />
    //           </div>
    //         </div>
    //       )}
    //     </div>

    //     {/* Logout Button Footer */}
    //     <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
    //       <button
    //         onClick={logout}
    //         className="w-full py-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
    //       >
    //         <LogOut className="w-4 h-4" />
    //         Sign Out
    //       </button>
    //     </div>
    //   </div>
    // </div>

    createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overscroll-contain">
        <div
          role="dialog"
          aria-modal="true"
          className="bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl flex flex-col min-h-0 max-h-[calc(100dvh-1rem)] sm:max-h-[85vh] overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Settings
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-[#202c33] p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <User className="w-3.5 h-3.5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Shield className="w-3.5 h-3.5" /> Privacy
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Sun className="w-3.5 h-3.5" /> Appearance
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-4">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio / About</label>
                  <textarea
                    value={bio}
                    rows={3}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Who can see Last Seen</label>
                  <select
                    value={lastSeenPrivacy}
                    onChange={(e) => setLastSeenPrivacy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Who can see Profile Photo</label>
                  <select
                    value={photoPrivacy}
                    onChange={(e) => setPhotoPrivacy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#202c33] text-gray-900 dark:text-gray-100 text-xs rounded-xl"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#202c33] rounded-xl">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Read Receipts</h5>
                    <p className="text-[10px] text-gray-500">Show blue checkmarks when messages are read</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleSavePrivacy}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
                >
                  Save Privacy Settings
                </button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Theme Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Settings },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition ${theme === t.id
                          ? 'border-indigo-600 bg-indigo-500/10 text-indigo-500'
                          : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#202c33]'
                          }`}
                      >
                        <t.icon className="w-5 h-5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#202c33] rounded-xl">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Sound Notifications</h5>
                    <p className="text-[10px] text-gray-500">Play audio chimes for incoming & outgoing messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => {
                      setSoundEnabled(e.target.checked);
                      soundService.toggleSound(e.target.checked);
                    }}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button Footer */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="w-full py-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  );
}
