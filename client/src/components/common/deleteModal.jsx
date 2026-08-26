import React from 'react';
import { Trash2, X } from 'lucide-react';

export default function DeleteModal({ isOpen, isOwn, onClose, onDeleteForMe, onDeleteForEveryone }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/80 w-full max-w-xs p-5 text-gray-800 dark:text-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-base">Delete message?</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                    {isOwn
                        ? 'Choose whether to delete this message only for yourself or for everyone in the chat.'
                        : 'You can delete this message for yourself. Other participants will still be able to see it.'}
                </p>

                <div className="flex flex-col gap-2">
                    {/* Delete for Everyone (Sirf message sender ko dikhega) */}
                    {isOwn && (
                        <button
                            type="button"
                            onClick={() => {
                                onDeleteForEveryone();
                                onClose();
                            }}
                            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                        >
                            Delete for everyone
                        </button>
                    )}

                    {/* Delete for Me (Sabhi users ke liye available) */}
                    <button
                        type="button"
                        onClick={() => {
                            onDeleteForMe();
                            onClose();
                        }}
                        className="w-full py-2.5 px-4 bg-gray-100 dark:bg-[#111b21] hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
                    >
                        Delete for me
                    </button>

                    {/* Cancel */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}