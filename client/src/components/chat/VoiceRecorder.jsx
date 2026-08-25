import React, { useEffect } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Mic, Square, Trash2, Send, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ onSendAudio, onCancel }) {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  } = useAudioRecorder();

  useEffect(() => {
    startRecording();
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendAudio(audioBlob);
      clearAudio();
    } else if (isRecording) {
      stopRecording();
      // Will send on state update
    }
  };

  useEffect(() => {
    if (audioBlob && !isRecording) {
      onSendAudio(audioBlob);
      clearAudio();
    }
  }, [audioBlob, isRecording]);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 rounded-xl text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
        <button onClick={onCancel} className="ml-auto underline">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-full p-2 bg-gray-100 dark:bg-[#202c33] rounded-2xl animate-in fade-in duration-200">
      <button
        type="button"
        onClick={() => {
          cancelRecording();
          onCancel();
        }}
        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition"
        title="Cancel recording"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
        <span className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-100">
          {formatTimer(recordingTime)}
        </span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition shadow-md"
        title="Send voice note"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
