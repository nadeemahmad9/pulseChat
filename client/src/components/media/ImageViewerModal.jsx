import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function ImageViewerModal({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        {/* Top bar controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <a
            href={imageUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-4xl max-h-[85vh] overflow-hidden flex items-center justify-center"
        >
          <img
            src={imageUrl}
            alt="Full preview"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
