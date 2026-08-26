// import React from 'react';
// import { ToastProvider } from './context/ToastContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
// import { ChatProvider } from './context/ChatContext';
// import AuthPage from './pages/AuthPage';
// import ChatPage from './pages/ChatPage';

// function AppContent() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-[#0b141a]">
//         <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 animate-pulse">
//           Connecting to PulseChat...
//         </p>
//       </div>
//     );
//   }

//   return user ? <ChatPage /> : <AuthPage />;
// }

// export default function App() {
//   return (
//     <ToastProvider>
//       <ThemeProvider>
//         <AuthProvider>
//           <SocketProvider>
//             <ChatProvider>
//               <AppContent />
//             </ChatProvider>
//           </SocketProvider>
//         </AuthProvider>
//       </ThemeProvider>
//     </ToastProvider>
//   );
// }


import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import Welcome from './pages/Welcome';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('email'); // 'email' ya 'mobile'

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-[#0b141a]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 animate-pulse">
          Connecting to PulseChat...
        </p>
      </div>
    );
  }

  // 1. Agar user logged in hai -> ChatPage
  if (user) {
    return <ChatPage />;
  }

  // 2. Agar user ne 'Continue' click kiya hai -> AuthPage
  if (showAuth) {
    return <AuthPage initialMode={authMode} onBack={() => setShowAuth(false)} />;
  }

  // 3. Pehle Welcome page dikhega
  return (
    <Welcome
      onGetStarted={(mode) => {
        setAuthMode(mode);
        setShowAuth(true);
      }}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}