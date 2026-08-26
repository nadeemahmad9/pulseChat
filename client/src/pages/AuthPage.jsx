import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Phone, Mail, Lock, User, AtSign, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AuthPage() {
  const { login, register, sendOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState('email'); // 'email' | 'mobile'
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  // Mobile OTP form state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileName, setMobileName] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, username, email, password });
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Handled in context toast
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      await verifyOtp(phone, otp, mobileName);
    } catch (err) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 dark:bg-[#111b21]/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-lg mb-4">
            {/* <MessageSquare className="w-8 h-8" /> */}
            <img className='w-8 h-8' src="chatLogo.png" alt="" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PulseChat</h1>
          <p className="text-sm text-gray-300 dark:text-gray-400 mt-1">
            Real-time messaging inspired by WhatsApp
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-6">
          <button
            onClick={() => setAuthMode('email')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${authMode === 'email'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <Mail className="w-4 h-4" />
            Email & Password
          </button>
          <button
            onClick={() => setAuthMode('mobile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${authMode === 'mobile'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <Phone className="w-4 h-4" />
            Mobile OTP
          </button>
        </div>

        {/* Auth Forms */}
        <AnimatePresence mode="wait">
          {authMode === 'email' ? (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-gray-400 hover:text-indigo-400 transition"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="mobile-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      OTP code will be generated and displayed in notification banner (dev mode).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Send OTP Code</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Enter 6-Digit OTP</label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 tracking-widest focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Your Name (Optional for new users)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={mobileName}
                        onChange={(e) => setMobileName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Verify & Continue</span>}
                  </button>

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <button type="button" onClick={() => setOtpSent(false)} className="hover:underline">
                      Change Number
                    </button>
                    {cooldown > 0 ? (
                      <span>Resend in {cooldown}s</span>
                    ) : (
                      <button type="button" onClick={handleSendOtp} className="text-emerald-400 hover:underline">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
