import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import MainLayout from '../layouts/MainLayout';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import EmptyChat from '../components/chat/EmptyChat';

import NewChatModal from '../components/chat/NewChatModal';
import CreateGroupModal from '../components/group/CreateGroupModal';
import GroupDetailsModal from '../components/group/GroupDetailsModal';
import UserProfileModal from '../components/profile/UserProfileModal';
import SettingsModal from '../components/profile/SettingsModal';
import ReportModal from '../components/profile/ReportModal';
import ForwardModal from '../components/chat/ForwardModal';
import ImageViewerModal from '../components/media/ImageViewerModal';

export default function ChatPage() {
  const { activeConversation, selectConversation } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  const handleOpenInfo = () => {
    setShowInfoModal(true);
  };

  return (
    <MainLayout
      onOpenNewChat={() => setShowNewChat(true)}
      onOpenCreateGroup={() => setShowCreateGroup(true)}
      onOpenSettings={() => setShowSettingsModal(true)}
    >
      {activeConversation ? (
        <div className="flex flex-col h-full w-full relative">
          <ChatHeader
            onBack={() => selectConversation(null)}
            onOpenInfo={handleOpenInfo}
            onOpenReport={() => setShowReportModal(true)}
          />
          <MessageList
            onMediaClick={(url) => setViewImageUrl(url)}
            onOpenForward={(msg) => setForwardMessage(msg)}
          />
          <MessageInput />
        </div>
      ) : (
        <EmptyChat onStartChat={() => setShowNewChat(true)} />
      )}

      {/* Modals */}
      <NewChatModal isOpen={showNewChat} onClose={() => setShowNewChat(false)} />
      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />

      {activeConversation?.type === 'group' ? (
        <GroupDetailsModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
      ) : (
        <UserProfileModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onOpenReport={() => setShowReportModal(true)}
        />
      )}

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
      <ForwardModal
        message={forwardMessage}
        isOpen={!!forwardMessage}
        onClose={() => setForwardMessage(null)}
      />
      <ImageViewerModal imageUrl={viewImageUrl} onClose={() => setViewImageUrl(null)} />
    </MainLayout>
  );
}
