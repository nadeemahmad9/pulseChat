import React, { useRef } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { Image, Video, Music, FileText } from 'lucide-react';

export default function AttachmentMenu({ onSelectFiles, onClose }) {
  const ref = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const docInputRef = useRef(null);

  useOutsideClick(ref, onClose);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(e.target.files);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-12 left-0 z-40 bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-xl w-48 space-y-1 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="w-full px-3 py-2 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl transition"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
          <Image className="w-4 h-4" />
        </div>
        <span>Photos</span>
      </button>

      <button
        type="button"
        onClick={() => videoInputRef.current?.click()}
        className="w-full px-3 py-2 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl transition"
      >
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Video className="w-4 h-4" />
        </div>
        <span>Videos</span>
      </button>

      <button
        type="button"
        onClick={() => audioInputRef.current?.click()}
        className="w-full px-3 py-2 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl transition"
      >
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
          <Music className="w-4 h-4" />
        </div>
        <span>Audio File</span>
      </button>

      <button
        type="button"
        onClick={() => docInputRef.current?.click()}
        className="w-full px-3 py-2 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#202c33] rounded-xl transition"
      >
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
          <FileText className="w-4 h-4" />
        </div>
        <span>Document</span>
      </button>
    </div>
  );
}
