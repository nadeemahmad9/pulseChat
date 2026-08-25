// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { apiFetch } from '../services/api';
// import { useAuth } from './AuthContext';
// import { useSocket } from './SocketContext';
// import { useToast } from './ToastContext';
// import { soundService } from '../services/sound';

// const ChatContext = createContext(null);

// export const ChatProvider = ({ children }) => {
//   const { user } = useAuth();
//   const { socket } = useSocket();
//   const { addToast } = useToast();

//   const [conversations, setConversations] = useState([]);
//   const [activeConversation, setActiveConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loadingConversations, setLoadingConversations] = useState(true);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [replyingToMessage, setReplyingToMessage] = useState(null);
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [typingUsers, setTypingUsers] = useState({}); // conversationId -> Map(userId -> user)
//   const [searchQuery, setSearchQuery] = useState('');
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   // Fetch initial user conversations
//   const fetchConversations = useCallback(async () => {
//     if (!user) return;
//     try {
//       setLoadingConversations(true);
//       const data = await apiFetch('/api/conversations');
//       setConversations(data.conversations || []);
//     } catch (err) {
//       console.error('Error loading conversations:', err);
//     } finally {
//       setLoadingConversations(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchConversations();
//   }, [fetchConversations]);

//   // Fetch messages when active conversation changes
//   useEffect(() => {
//     if (!activeConversation) {
//       setMessages([]);
//       setReplyingToMessage(null);
//       setEditingMessage(null);
//       return;
//     }

//     const fetchMessages = async () => {
//       try {
//         setLoadingMessages(true);
//         const data = await apiFetch(`/api/messages/${activeConversation._id}?page=1&limit=50`);
//         setMessages(data.messages || []);

//         // Emit message_read event via socket
//         if (socket) {
//           socket.emit('message_read', { conversationId: activeConversation._id });
//         }

//         // Clear local unread count
//         setConversations((prev) =>
//           prev.map((c) => (c._id === activeConversation._id ? { ...c, unreadCount: 0 } : c))
//         );
//       } catch (err) {
//         addToast(err.message, 'error');
//       } finally {
//         setLoadingMessages(false);
//       }
//     };

//     fetchMessages();

//     // Join room in socket
//     if (socket) {
//       socket.emit('join_conversation', { conversationId: activeConversation._id });
//     }

//     return () => {
//       if (socket && activeConversation) {
//         socket.emit('leave_conversation', { conversationId: activeConversation._id });
//       }
//     };
//   }, [activeConversation?._id, socket]);

//   // Handle Real-time Socket Event Listeners
//   useEffect(() => {
//     if (!socket || !user) return;

//     const handleReceiveMessage = ({ conversationId, tempId, message }) => {
//       const senderId = (message.sender?._id || message.sender).toString();

//       // Recipient acknowledges delivery to server
//       if (senderId !== user._id.toString()) {
//         socket.emit('message_delivered', { messageId: message._id, conversationId });
//       }

//       // If message is in active conversation, add to state
//       if (activeConversation && activeConversation._id === conversationId) {
//         setMessages((prev) => {
//           if (tempId && prev.some((m) => m._id === tempId)) {
//             return prev.map((m) => (m._id === tempId ? message : m));
//           }
//           if (prev.some((m) => m._id === message._id)) return prev;
//           return [...prev, message];
//         });

//         // Mark as read ONLY if active conversation is currently open
//         if (senderId !== user._id.toString()) {
//           socket.emit('message_read', { conversationId });
//         }
//       }

//       // Update last message in conversations list
//       setConversations((prev) => {
//         const updatedList = prev.map((conv) => {
//           if (conv._id === conversationId) {
//             const isCurrentActive = activeConversation && activeConversation._id === conversationId;
//             return {
//               ...conv,
//               lastMessage: message,
//               lastMessageAt: message.createdAt,
//               unreadCount: isCurrentActive || senderId === user._id.toString() ? conv.unreadCount : (conv.unreadCount || 0) + 1,
//             };
//           }
//           return conv;
//         });

//         return updatedList.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
//       });

//       // Sound notifications
//       if (senderId !== user._id.toString()) {
//         soundService.playReceivedSound();
//       }
//     };

//     const handleMessageDelivered = ({ conversationId, messageId, deliveredToUserId }) => {
//       if (activeConversation && activeConversation._id === conversationId) {
//         setMessages((prev) =>
//           prev.map((msg) => {
//             const senderId = (msg.sender?._id || msg.sender).toString();
//             if (senderId === user._id.toString() && (!messageId || msg._id === messageId)) {
//               const currentDelivered = (msg.deliveredTo || []).map((d) => (d._id || d).toString());
//               if (!currentDelivered.includes(deliveredToUserId.toString())) {
//                 return { ...msg, deliveredTo: [...(msg.deliveredTo || []), deliveredToUserId] };
//               }
//             }
//             return msg;
//           })
//         );
//       }

//       setConversations((prev) =>
//         prev.map((conv) => {
//           if (conv._id === conversationId && conv.lastMessage) {
//             const lastMsgSender = (conv.lastMessage.sender?._id || conv.lastMessage.sender).toString();
//             if (lastMsgSender === user._id.toString()) {
//               const currentDelivered = (conv.lastMessage.deliveredTo || []).map((d) => (d._id || d).toString());
//               if (!currentDelivered.includes(deliveredToUserId.toString())) {
//                 return {
//                   ...conv,
//                   lastMessage: {
//                     ...conv.lastMessage,
//                     deliveredTo: [...(conv.lastMessage.deliveredTo || []), deliveredToUserId],
//                   },
//                 };
//               }
//             }
//           }
//           return conv;
//         })
//       );
//     };

//     const handleMessageRead = ({ conversationId, readByUserId }) => {
//       if (activeConversation && activeConversation._id === conversationId) {
//         setMessages((prev) =>
//           prev.map((msg) => {
//             const senderId = (msg.sender?._id || msg.sender).toString();
//             if (senderId === user._id.toString()) {
//               const currentRead = (msg.readBy || []).map((r) => (r._id || r).toString());
//               if (!currentRead.includes(readByUserId.toString())) {
//                 return {
//                   ...msg,
//                   readBy: [...(msg.readBy || []), readByUserId],
//                   deliveredTo: [...(msg.deliveredTo || []), readByUserId],
//                 };
//               }
//             }
//             return msg;
//           })
//         );
//       }

//       setConversations((prev) =>
//         prev.map((conv) => {
//           if (conv._id === conversationId && conv.lastMessage) {
//             const lastMsgSender = (conv.lastMessage.sender?._id || conv.lastMessage.sender).toString();
//             if (lastMsgSender === user._id.toString()) {
//               const currentRead = (conv.lastMessage.readBy || []).map((r) => (r._id || r).toString());
//               if (!currentRead.includes(readByUserId.toString())) {
//                 return {
//                   ...conv,
//                   lastMessage: {
//                     ...conv.lastMessage,
//                     readBy: [...(conv.lastMessage.readBy || []), readByUserId],
//                     deliveredTo: [...(conv.lastMessage.deliveredTo || []), readByUserId],
//                   },
//                 };
//               }
//             }
//           }
//           return conv;
//         })
//       );
//     };

//     const handleTypingStart = ({ conversationId, userId, user: typingUser }) => {
//       if (userId === user._id) return;
//       setTypingUsers((prev) => {
//         const convUsers = { ...(prev[conversationId] || {}) };
//         convUsers[userId] = typingUser;
//         return { ...prev, [conversationId]: convUsers };
//       });
//     };

//     const handleTypingStop = ({ conversationId, userId }) => {
//       setTypingUsers((prev) => {
//         const convUsers = { ...(prev[conversationId] || {}) };
//         delete convUsers[userId];
//         return { ...prev, [conversationId]: convUsers };
//       });
//     };

//     const handleMessageReaction = ({ conversationId, message }) => {
//       if (activeConversation && activeConversation._id === conversationId) {
//         setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
//       }
//     };

//     const handleMessageEdit = ({ conversationId, message }) => {
//       if (activeConversation && activeConversation._id === conversationId) {
//         setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
//       }
//     };

//     const handleMessageDelete = ({ conversationId, messageId, isDeletedForEveryone }) => {
//       if (activeConversation && activeConversation._id === conversationId) {
//         if (isDeletedForEveryone) {
//           setMessages((prev) =>
//             prev.map((m) =>
//               m._id === messageId
//                 ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] }
//                 : m
//             )
//           );
//         } else {
//           setMessages((prev) => prev.filter((m) => m._id !== messageId));
//         }
//       }
//     };

//     const handleGroupUpdated = ({ conversationId, group }) => {
//       setConversations((prev) => prev.map((c) => (c._id === conversationId ? { ...c, ...group } : c)));
//       if (activeConversation && activeConversation._id === conversationId) {
//         setActiveConversation((prev) => ({ ...prev, ...group }));
//       }
//     };

//     socket.on('receive_message', handleReceiveMessage);
//     socket.on('message_delivered', handleMessageDelivered);
//     socket.on('message_read', handleMessageRead);
//     socket.on('typing_start', handleTypingStart);
//     socket.on('typing_stop', handleTypingStop);
//     socket.on('message_reaction', handleMessageReaction);
//     socket.on('message_edit', handleMessageEdit);
//     socket.on('message_delete', handleMessageDelete);
//     socket.on('group_updated', handleGroupUpdated);

//     return () => {
//       socket.off('receive_message', handleReceiveMessage);
//       socket.off('message_delivered', handleMessageDelivered);
//       socket.off('message_read', handleMessageRead);
//       socket.off('typing_start', handleTypingStart);
//       socket.off('typing_stop', handleTypingStop);
//       socket.off('message_reaction', handleMessageReaction);
//       socket.off('message_edit', handleMessageEdit);
//       socket.off('message_delete', handleMessageDelete);
//       socket.off('group_updated', handleGroupUpdated);
//     };
//   }, [socket, user, activeConversation]);

//   // Send message function with OPTIMISTIC UPDATE
//   const sendMessage = async (content, type = 'text', attachments = []) => {
//     if (!activeConversation) return;

//     const tempId = 'temp_' + Date.now();
//     const optimisticMessage = {
//       _id: tempId,
//       conversationId: activeConversation._id,
//       sender: {
//         _id: user._id,
//         name: user.name,
//         username: user.username,
//         avatar: user.avatar,
//       },
//       content,
//       type,
//       attachments,
//       replyTo: replyingToMessage,
//       reactions: [],
//       readBy: [user._id],
//       deliveredTo: [user._id],
//       isDeleted: false,
//       createdAt: new Date().toISOString(),
//       sending: true,
//     };

//     // 1. Add optimistic message to screen instantly
//     setMessages((prev) => [...prev, optimisticMessage]);
//     setReplyingToMessage(null);
//     soundService.playSentSound();

//     try {
//       // 2. Perform API request
//       const data = await apiFetch('/api/messages', {
//         method: 'POST',
//         body: JSON.stringify({
//           conversationId: activeConversation._id,
//           content,
//           type,
//           attachments,
//           replyTo: replyingToMessage?._id || null,
//         }),
//       });

//       const confirmedMessage = data.message;

//       // 3. Emit socket event
//       if (socket) {
//         socket.emit('send_message', {
//           conversationId: activeConversation._id,
//           tempId,
//           message: confirmedMessage,
//         });
//       }

//       // 4. Update message in local state
//       setMessages((prev) => prev.map((m) => (m._id === tempId ? confirmedMessage : m)));

//       // 5. Update conversation list
//       setConversations((prev) =>
//         prev.map((c) =>
//           c._id === activeConversation._id
//             ? { ...c, lastMessage: confirmedMessage, lastMessageAt: confirmedMessage.createdAt }
//             : c
//         )
//       );
//     } catch (err) {
//       // If error occurs, mark message failed
//       setMessages((prev) =>
//         prev.map((m) => (m._id === tempId ? { ...m, sending: false, error: true } : m))
//       );
//       addToast(err.message || 'Failed to send message', 'error');
//     }
//   };

//   // Helper actions
//   const selectConversation = (conv) => {
//     setActiveConversation(conv);
//   };

//   const startPrivateChat = async (recipientId) => {
//     try {
//       const data = await apiFetch('/api/conversations/private', {
//         method: 'POST',
//         body: JSON.stringify({ recipientId }),
//       });
//       const conv = data.conversation;
//       setConversations((prev) => {
//         if (prev.some((c) => c._id === conv._id)) return prev;
//         return [conv, ...prev];
//       });
//       setActiveConversation(conv);
//       return conv;
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const togglePin = async (convId) => {
//     try {
//       const data = await apiFetch(`/api/conversations/${convId}/pin`, { method: 'PATCH' });
//       addToast(data.message, 'info');
//       fetchConversations();
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const toggleMute = async (convId) => {
//     try {
//       const data = await apiFetch(`/api/conversations/${convId}/mute`, { method: 'PATCH' });
//       addToast(data.message, 'info');
//       fetchConversations();
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const toggleArchive = async (convId) => {
//     try {
//       const data = await apiFetch(`/api/conversations/${convId}/archive`, { method: 'PATCH' });
//       addToast(data.message, 'info');
//       fetchConversations();
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const toggleReaction = async (messageId, emoji) => {
//     try {
//       const data = await apiFetch(`/api/messages/${messageId}/react`, {
//         method: 'POST',
//         body: JSON.stringify({ emoji }),
//       });
//       const updated = data.message;
//       setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));

//       if (socket && activeConversation) {
//         socket.emit('message_reaction', { conversationId: activeConversation._id, message: updated });
//       }
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const deleteMsg = async (messageId, deleteForEveryone = false) => {
//     try {
//       const data = await apiFetch(`/api/messages/${messageId}?deleteForEveryone=${deleteForEveryone}`, {
//         method: 'DELETE',
//       });

//       if (deleteForEveryone) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] } : m
//           )
//         );
//       } else {
//         setMessages((prev) => prev.filter((m) => m._id !== messageId));
//       }

//       if (socket && activeConversation) {
//         socket.emit('message_delete', { conversationId: activeConversation._id, messageId, isDeletedForEveryone: deleteForEveryone });
//       }

//       addToast(data.message, 'info');
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   const editMsg = async (messageId, newContent) => {
//     try {
//       const data = await apiFetch(`/api/messages/${messageId}`, {
//         method: 'PATCH',
//         body: JSON.stringify({ content: newContent }),
//       });
//       const updated = data.message;
//       setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));
//       setEditingMessage(null);

//       if (socket && activeConversation) {
//         socket.emit('message_edit', { conversationId: activeConversation._id, message: updated });
//       }
//       addToast('Message edited', 'success');
//     } catch (err) {
//       addToast(err.message, 'error');
//     }
//   };

//   return (
//     <ChatContext.Provider
//       value={{
//         conversations,
//         activeConversation,
//         messages,
//         loadingConversations,
//         loadingMessages,
//         replyingToMessage,
//         setReplyingToMessage,
//         editingMessage,
//         setEditingMessage,
//         typingUsers,
//         searchQuery,
//         setSearchQuery,
//         soundEnabled,
//         setSoundEnabled,
//         selectConversation,
//         sendMessage,
//         startPrivateChat,
//         fetchConversations,
//         togglePin,
//         toggleMute,
//         toggleArchive,
//         toggleReaction,
//         deleteMsg,
//         editMsg,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const context = useContext(ChatContext);
//   if (!context) throw new Error('useChat must be used within ChatProvider');
//   return context;
// };



import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useToast } from './ToastContext';
import { soundService } from '../services/sound';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // conversationId -> Map(userId -> user)
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch initial user conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const data = await apiFetch('/api/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      setReplyingToMessage(null);
      setEditingMessage(null);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const data = await apiFetch(`/api/messages/${activeConversation._id}?page=1&limit=50`);
        setMessages(data.messages || []);

        // Emit message_read event via socket
        if (socket) {
          socket.emit('message_read', { conversationId: activeConversation._id });
        }

        // Clear local unread count
        setConversations((prev) =>
          prev.map((c) => (c._id === activeConversation._id ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join room in socket
    if (socket) {
      socket.emit('join_conversation', { conversationId: activeConversation._id });
    }

    return () => {
      if (socket && activeConversation) {
        socket.emit('leave_conversation', { conversationId: activeConversation._id });
      }
    };
  }, [activeConversation?._id, socket]);

  // Handle Real-time Socket Event Listeners
  useEffect(() => {
    if (!socket || !user) return;

    // 1. Jab chat open ho aur naya message aaye (Chat Window update)
    const handleReceiveMessage = ({ conversationId, tempId, message }) => {
      const senderId = (message.sender?._id || message.sender).toString();

      // Recipient acknowledges delivery to server
      if (senderId !== user._id.toString()) {
        socket.emit('message_delivered', { messageId: message._id, conversationId });
      }

      // If message is in active conversation, add to messages list
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) => {
          if (tempId && prev.some((m) => m._id === tempId)) {
            return prev.map((m) => (m._id === tempId ? message : m));
          }
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Mark as read ONLY if active conversation is currently open
        if (senderId !== user._id.toString()) {
          socket.emit('message_read', { conversationId });
        }
      }

      // Play sound
      if (senderId !== user._id.toString() && soundEnabled) {
        soundService.playReceivedSound();
      }
    };

    // 2. Realtime Sidebar Update (Har participant ke liye chahe chat open ho ya na ho)
    const handleConversationUpdated = ({ conversationId, lastMessage, updatedAt }) => {
      setConversations((prev) => {
        let exists = false;
        const senderId = (lastMessage?.sender?._id || lastMessage?.sender || '').toString();
        const isCurrentActive = activeConversation && activeConversation._id === conversationId;

        const updatedList = prev.map((conv) => {
          if (conv._id === conversationId) {
            exists = true;
            return {
              ...conv,
              lastMessage: lastMessage,
              lastMessageAt: updatedAt || lastMessage?.createdAt || new Date().toISOString(),
              unreadCount:
                isCurrentActive || senderId === user._id.toString()
                  ? 0
                  : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        });

        // Agar bilkul nayi chat create hui hai jo list me nahi hai
        if (!exists) {
          fetchConversations();
          return prev;
        }

        // List ko sort karein taaki latest chat top par aa jaye
        return [...updatedList].sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
          return timeB - timeA;
        });
      });

      // Agar chat open nahi hai tab bhi receiver ko sound notification mile
      const senderId = (lastMessage?.sender?._id || lastMessage?.sender || '').toString();
      if (senderId !== user._id.toString() && (!activeConversation || activeConversation._id !== conversationId) && soundEnabled) {
        soundService.playReceivedSound();
      }
    };

    const handleMessageDelivered = ({ conversationId, messageId, deliveredToUserId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender).toString();
            if (senderId === user._id.toString() && (!messageId || msg._id === messageId)) {
              const currentDelivered = (msg.deliveredTo || []).map((d) => (d._id || d).toString());
              if (!currentDelivered.includes(deliveredToUserId.toString())) {
                return { ...msg, deliveredTo: [...(msg.deliveredTo || []), deliveredToUserId] };
              }
            }
            return msg;
          })
        );
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId && conv.lastMessage) {
            const lastMsgSender = (conv.lastMessage.sender?._id || conv.lastMessage.sender).toString();
            if (lastMsgSender === user._id.toString()) {
              const currentDelivered = (conv.lastMessage.deliveredTo || []).map((d) => (d._id || d).toString());
              if (!currentDelivered.includes(deliveredToUserId.toString())) {
                return {
                  ...conv,
                  lastMessage: {
                    ...conv.lastMessage,
                    deliveredTo: [...(conv.lastMessage.deliveredTo || []), deliveredToUserId],
                  },
                };
              }
            }
          }
          return conv;
        })
      );
    };

    const handleMessageRead = ({ conversationId, readByUserId }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender).toString();
            if (senderId === user._id.toString()) {
              const currentRead = (msg.readBy || []).map((r) => (r._id || r).toString());
              if (!currentRead.includes(readByUserId.toString())) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), readByUserId],
                  deliveredTo: [...(msg.deliveredTo || []), readByUserId],
                };
              }
            }
            return msg;
          })
        );
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId && conv.lastMessage) {
            const lastMsgSender = (conv.lastMessage.sender?._id || conv.lastMessage.sender).toString();
            if (lastMsgSender === user._id.toString()) {
              const currentRead = (conv.lastMessage.readBy || []).map((r) => (r._id || r).toString());
              if (!currentRead.includes(readByUserId.toString())) {
                return {
                  ...conv,
                  lastMessage: {
                    ...conv.lastMessage,
                    readBy: [...(conv.lastMessage.readBy || []), readByUserId],
                    deliveredTo: [...(conv.lastMessage.deliveredTo || []), readByUserId],
                  },
                };
              }
            }
          }
          return conv;
        })
      );
    };

    const handleTypingStart = ({ conversationId, userId, user: typingUser }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => {
        const convUsers = { ...(prev[conversationId] || {}) };
        convUsers[userId] = typingUser;
        return { ...prev, [conversationId]: convUsers };
      });
    };

    const handleTypingStop = ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const convUsers = { ...(prev[conversationId] || {}) };
        delete convUsers[userId];
        return { ...prev, [conversationId]: convUsers };
      });
    };

    const handleMessageReaction = ({ conversationId, message }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
      }
    };

    const handleMessageEdit = ({ conversationId, message }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
      }
    };

    const handleMessageDelete = ({ conversationId, messageId, isDeletedForEveryone }) => {
      if (activeConversation && activeConversation._id === conversationId) {
        if (isDeletedForEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      }
    };

    const handleGroupUpdated = ({ conversationId, group }) => {
      setConversations((prev) => prev.map((c) => (c._id === conversationId ? { ...c, ...group } : c)));
      if (activeConversation && activeConversation._id === conversationId) {
        setActiveConversation((prev) => ({ ...prev, ...group }));
      }
    };

    // Listeners Register
    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_read', handleMessageRead);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_edit', handleMessageEdit);
    socket.on('message_delete', handleMessageDelete);
    socket.on('group_updated', handleGroupUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('message_read', handleMessageRead);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_edit', handleMessageEdit);
      socket.off('message_delete', handleMessageDelete);
      socket.off('group_updated', handleGroupUpdated);
    };
  }, [socket, user, activeConversation, soundEnabled, fetchConversations]);

  // Send message function with OPTIMISTIC UPDATE
  const sendMessage = async (content, type = 'text', attachments = []) => {
    if (!activeConversation) return;

    const tempId = 'temp_' + Date.now();
    const optimisticMessage = {
      _id: tempId,
      conversationId: activeConversation._id,
      sender: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
      content,
      type,
      attachments,
      replyTo: replyingToMessage,
      reactions: [],
      readBy: [user._id],
      deliveredTo: [user._id],
      isDeleted: false,
      createdAt: new Date().toISOString(),
      sending: true,
    };

    // 1. Add optimistic message to screen instantly
    setMessages((prev) => [...prev, optimisticMessage]);
    setReplyingToMessage(null);
    if (soundEnabled) soundService.playSentSound();

    try {
      // 2. Perform API request
      const data = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeConversation._id,
          content,
          type,
          attachments,
          replyTo: replyingToMessage?._id || null,
        }),
      });

      const confirmedMessage = data.message;

      // 3. Emit socket event
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation._id,
          tempId,
          message: confirmedMessage,
        });
      }

      // 4. Update message in local state
      setMessages((prev) => prev.map((m) => (m._id === tempId ? confirmedMessage : m)));

      // 5. Update conversation list for sender and sort top
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: confirmedMessage, lastMessageAt: confirmedMessage.createdAt }
            : c
        );
        return [...updated].sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
          return timeB - timeA;
        });
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, sending: false, error: true } : m))
      );
      addToast(err.message || 'Failed to send message', 'error');
    }
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
  };

  const startPrivateChat = async (recipientId) => {
    try {
      const data = await apiFetch('/api/conversations/private', {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
      });
      const conv = data.conversation;
      setConversations((prev) => {
        if (prev.some((c) => c._id === conv._id)) return prev;
        return [conv, ...prev];
      });
      setActiveConversation(conv);
      return conv;
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const togglePin = async (convId) => {
    try {
      const data = await apiFetch(`/api/conversations/${convId}/pin`, { method: 'PATCH' });
      addToast(data.message, 'info');
      fetchConversations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const toggleMute = async (convId) => {
    try {
      const data = await apiFetch(`/api/conversations/${convId}/mute`, { method: 'PATCH' });
      addToast(data.message, 'info');
      fetchConversations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const toggleArchive = async (convId) => {
    try {
      const data = await apiFetch(`/api/conversations/${convId}/archive`, { method: 'PATCH' });
      addToast(data.message, 'info');
      fetchConversations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const toggleReaction = async (messageId, emoji) => {
    try {
      const data = await apiFetch(`/api/messages/${messageId}/react`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
      const updated = data.message;
      setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));

      if (socket && activeConversation) {
        socket.emit('message_reaction', { conversationId: activeConversation._id, message: updated });
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const deleteMsg = async (messageId, deleteForEveryone = false) => {
    try {
      const data = await apiFetch(`/api/messages/${messageId}?deleteForEveryone=${deleteForEveryone}`, {
        method: 'DELETE',
      });

      if (deleteForEveryone) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted', attachments: [] } : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }

      if (socket && activeConversation) {
        socket.emit('message_delete', { conversationId: activeConversation._id, messageId, isDeletedForEveryone: deleteForEveryone });
      }

      addToast(data.message, 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const editMsg = async (messageId, newContent) => {
    try {
      const data = await apiFetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: newContent }),
      });
      const updated = data.message;
      setMessages((prev) => prev.map((m) => (m._id === messageId ? updated : m)));
      setEditingMessage(null);

      if (socket && activeConversation) {
        socket.emit('message_edit', { conversationId: activeConversation._id, message: updated });
      }
      addToast('Message edited', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        replyingToMessage,
        setReplyingToMessage,
        editingMessage,
        setEditingMessage,
        typingUsers,
        searchQuery,
        setSearchQuery,
        soundEnabled,
        setSoundEnabled,
        selectConversation,
        sendMessage,
        startPrivateChat,
        fetchConversations,
        togglePin,
        toggleMute,
        toggleArchive,
        toggleReaction,
        deleteMsg,
        editMsg,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
