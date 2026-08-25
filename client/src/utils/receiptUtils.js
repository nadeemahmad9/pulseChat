/**
 * Calculates WhatsApp-style receipt status for a message
 * Returns: 'SENT' | 'DELIVERED' | 'READ' | null
 */
export function getReceiptStatus(message, currentUserId, conversation) {
  if (!message || !currentUserId) return null;

  // System messages do not have receipt status
  if (message.type === 'system') return null;

  // Only sender sees receipt ticks for their own messages
  const senderId = (message.sender?._id || message.sender).toString();
  if (senderId !== currentUserId.toString()) return null;

  // Extract user IDs from array of ObjectIds or populated objects
  const getIds = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item._id) return item._id.toString();
      if (item.user) return (item.user._id || item.user).toString();
      return item.toString();
    }).filter(Boolean);
  };

  const readByUsers = getIds(message.readBy);
  const deliveredUsers = getIds(message.deliveredTo);

  const participants = conversation?.participants || [];
  const otherParticipants = participants
    .map((p) => (p._id || p).toString())
    .filter((id) => id !== currentUserId.toString());

  if (conversation?.type === 'group') {
    if (otherParticipants.length === 0) return 'READ';
    const isReadByAll = otherParticipants.every((id) => readByUsers.includes(id));
    if (isReadByAll) return 'READ';

    const isDeliveredToAny = otherParticipants.some((id) => deliveredUsers.includes(id) || readByUsers.includes(id));
    if (isDeliveredToAny) return 'DELIVERED';

    return 'SENT';
  }

  // 1-on-1 Conversation
  const recipientId = otherParticipants[0];

  // If recipientId is present in readBy
  if (recipientId && readByUsers.includes(recipientId)) {
    return 'READ';
  }

  // Fallback if readBy has > 1 users (including sender)
  if (readByUsers.length > 1) {
    return 'READ';
  }

  // If recipientId is present in deliveredTo
  if (recipientId && deliveredUsers.includes(recipientId)) {
    return 'DELIVERED';
  }

  // Fallback if deliveredTo has > 1 users
  if (deliveredUsers.length > 1) {
    return 'DELIVERED';
  }

  return 'SENT';
}
