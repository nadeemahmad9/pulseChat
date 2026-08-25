import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import ReplyPreview from './ReplyPreview';
import VoiceRecorder from './VoiceRecorder';
import AttachmentMenu from '../media/AttachmentMenu';
import { Smile, Paperclip, Mic, Send, X, Check } from 'lucide-react';
import { apiFetch } from '../../services/api';

const EMOJI_CATEGORIES = ['❤️', '😂', '👍', '😮', '😢', '🙏', '🔥', '🚀', '🎉', '😍', '👏', '✨', '💯', '😎', '🥳', '🙌'];

export default function MessageInput() {
  const {
    activeConversation,
    sendMessage,
    replyingToMessage,
    setReplyingToMessage,
    editingMessage,
    setEditingMessage,
    editMsg,
  } = useChat();

  const { socket } = useSocket();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [uploading, setUploading] = useState(false);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
    }
  }, [editingMessage]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (socket && activeConversation) {
      socket.emit('typing_start', { conversationId: activeConversation._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId: activeConversation._id });
      }, 2000);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim() && !editingMessage) return;

    if (socket && activeConversation) {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }

    if (editingMessage) {
      editMsg(editingMessage._id, text);
      setText('');
      setEditingMessage(null);
    } else {
      sendMessage(text.trim());
      setText('');
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await apiFetch('/api/uploads/multiple', {
        method: 'POST',
        body: formData,
      });

      const attachments = res.files;
      const type = attachments[0].mimeType.startsWith('image/')
        ? 'image'
        : attachments[0].mimeType.startsWith('video/')
        ? 'video'
        : attachments[0].mimeType.startsWith('audio/')
        ? 'audio'
        : 'document';

      sendMessage(text.trim() || attachments[0].filename, type, attachments);
      setText('');
      setShowAttachmentMenu(false);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSendVoiceNote = async (audioBlob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, `voice_${Date.now()}.webm`);

      const res = await apiFetch('/api/uploads/single', {
        method: 'POST',
        body: formData,
      });

      sendMessage('Voice Message', 'audio', [
        {
          url: res.url,
          filename: res.filename,
          mimeType: 'audio/webm',
          size: res.size,
        },
      ]);
      setIsRecordingVoice(false);
    } catch (err) {
      console.error('Voice send error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shrink-0 z-20">
      {/* Reply Preview Header */}
      {replyingToMessage && (
        <ReplyPreview message={replyingToMessage} onClose={() => setReplyingToMessage(null)} />
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between p-2 px-4 bg-indigo-500/10 text-indigo-500 text-xs font-semibold">
          <span>Editing message</span>
          <button onClick={() => { setEditingMessage(null); setText(''); }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-3">
        {isRecordingVoice ? (
          <VoiceRecorder
            onSendAudio={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 relative">
            {/* Attachment Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowEmojiPicker(false);
                }}
                className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {showAttachmentMenu && (
                <AttachmentMenu
                  onSelectFiles={handleFileUpload}
                  onClose={() => setShowAttachmentMenu(false)}
                />
              )}
            </div>

            {/* Emoji Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachmentMenu(false);
                }}
                className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-40 bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-xl w-64 grid grid-cols-4 gap-2 animate-in fade-in zoom-in-95 duration-100">
                  {EMOJI_CATEGORIES.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl transition text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={text}
                onChange={handleTextChange}
                placeholder={uploading ? 'Uploading media...' : 'Type a message...'}
                disabled={uploading}
                className="w-full py-2.5 px-4 bg-gray-100 dark:bg-[#111b21] text-gray-900 dark:text-gray-100 rounded-2xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Send OR Voice Note Button */}
            {text.trim() || editingMessage ? (
              <button
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition shadow-md shrink-0"
              >
                {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-3 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-full transition shrink-0"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
