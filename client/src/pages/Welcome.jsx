import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function Welcome({ onGetStarted }) {
    return (
        <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-between px-4 py-4 md:py-6 overflow-y-auto">
            {/* Background Animated Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.25, 1], x: [0, -40, 0], y: [0, 30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
                />
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
            </div>

            {/* Top Header */}
            <motion.header
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center  shadow-indigo-500/25">
                        <img className="h-8 w-8 md:h-9 md:w-9" src="chatLogo.png" alt="" />

                    </div>
                    <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        PulseChat
                    </span>
                </div>

                {/* <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>v2.0 Live & Secure</span>
                </div> */}
            </motion.header>

            {/* Hero Content Section */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-2xl mx-auto w-full text-center flex flex-col items-center justify-center my-4 md:my-auto py-2"
            >
                {/* Floating Animated Logo */}
                <motion.div variants={itemVariants} className="relative mb-4 md:mb-6">
                    <motion.div
                        animate={{ rotate: [0, 4, -4, 0], y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                        className="relative"
                    >
                        <div className="absolute -inset-3 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                        <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-xl flex items-center justify-center shadow-xl">
                            {/* <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" /> */}
                            <img className="h-10 w-10 md:h-12 md:w-12 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" src="chatLogo.png" alt="" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={itemVariants}
                    className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-3 leading-tight"
                >
                    Conversations at the{' '}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Speed of Thought
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-slate-400 text-xs sm:text-sm md:text-base max-w-lg mb-4 md:mb-6 leading-relaxed px-2"
                >
                    Experience zero-latency real-time messaging, secure media sharing, and fluid connectivity designed for modern communication.
                </motion.p>

                {/* Feature Badges */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center gap-2 mb-5 md:mb-6 text-[11px] sm:text-xs font-medium text-slate-300"
                >
                    <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Zap className="h-3 w-3 text-amber-400" /> WebSockets Powered
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" /> Secure Sessions
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Sparkles className="h-3 w-3 text-indigo-400" /> Modern Dark UI
                    </span>
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5">
                    {/* Email Option */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onGetStarted('email')}
                        className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 sm:py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-indigo-600/30 group cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Mail className="h-4 w-4 text-indigo-200" />
                            <span>Continue with Email Or Mobile</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-indigo-200 group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button>

                    {/* Mobile Option */}
                    {/* <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onGetStarted('mobile')}
                        className="w-full flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-white font-medium text-sm py-2.5 sm:py-3 px-5 rounded-xl transition duration-200 shadow-sm group backdrop-blur-md cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                            <span>Continue with Mobile</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button> */}
                </motion.div>
            </motion.main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="relative z-10 max-w-4xl mx-auto w-full text-center text-[11px] text-slate-500 mt-2"
            >
                &copy; {new Date().getFullYear()} PulseChat. Built for real-time connection.
            </motion.footer>
        </div>
    );
}