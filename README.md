# PulseChat - Production-Ready Real-Time Messaging Platform

PulseChat is a high-performance, real-time messaging application inspired by the core usability of WhatsApp, built using the **MERN Stack (MongoDB, Express, React, Node.js)** and **Socket.IO**. 

It features an end-to-end authentication system (HTTP-only JWT cookies & WhatsApp-style simulated mobile OTP flow), live 1-on-1 and group chats, group administration, voice recording, rich media file sharing, message status indicators (`✓`, `✓✓`, blue `✓✓`), reactions, replies, typing indicators, message editing & deletion, dark mode, toast notifications, and optimistic UI updates.

---

## 🌟 Key Features

### 🔐 Authentication & Profile System
- **Dual Login Modes**:
  - **Email + Password**: Account registration and login with bcrypt hashing and validation.
  - **WhatsApp-Style Mobile OTP**: Simulated phone OTP verification with resend cooldown timers.
- **JWT Cookies**: HTTP-only, SameSite secure cookie authentication.
- **User Profile Management**: Avatar photo upload/URL, custom bio, about section, username change, and privacy settings (Last seen, profile photo, read receipts).
- **Contact Blocking & Reporting**: Block/unblock users and submit abuse reports with detailed reasons.

### 💬 Real-Time Messaging Engine (Socket.IO)
- **Instant Message Delivery**: Sub-10ms delivery via Socket.IO with optimistic UI rendering.
- **WhatsApp Message Status Indicators**:
  - `✓` Sent
  - `✓✓` Delivered
  - `✓✓` (Blue) Read
- **Live Typing Indicators**: Displays `John is typing...` or `John, Sarah are typing...` in real-time.
- **Presence Tracking**: Live online/offline status and last seen timestamp updates.
- **Reactions & Replies**: React to messages with emojis (`❤️`, `😂`, `👍`, `😮`, `😢`, `🙏`, `🔥`) and reply to specific messages with jump-to-original scroll.
- **Message Editing & Deletion**: Edit sent messages ("Edited" tag) and Delete for me / Delete for everyone ("This message was deleted").
- **Forwarding & Search**: Forward messages across single/multiple conversations and search messages within chats.

### 🎙️ Rich Media & Voice Messages
- **Voice Recorder**: Built-in `MediaRecorder` hook featuring live duration timer, waveform visualizer preview, and voice note sending.
- **Full-Screen Photo Viewer**: Image thumbnail preview with zoom in/out, rotation, and download options.
- **Media Uploads**: Support for images, videos, audio, and documents (PDF, Word, Excel, ZIP) with Multer validation.

### 👥 Group Conversations & Administration
- **Group Creation**: Create group chats with custom name, avatar, description, and member selection.
- **Admin Management**: Promote members to admin, demote admins, remove members, and manage group details.
- **System Announcements**: Automated announcements for group creation, member joins, and exits.

### 🎨 Modern UI & UX Design
- **WhatsApp-Inspired Usability**: Clean dual-pane layout for desktop and single-screen navigation for mobile viewports (320px to 1280px+).
- **Themes**: Dark Mode, Light Mode, and System Theme preference with localStorage persistence.
- **Sound Notifications**: Web Audio API synthesized chimes for incoming & outgoing messages with mute toggle.
- **Skeleton Loaders & Toasts**: Smooth loading states and non-intrusive toast notifications.

---



## ⚙️ Environment Variables

Create `.env` inside `server/`:

```env
PORT=your port 
MONGO_URI=your_mongodb_url/pulsechat
JWT_SECRET=pulsechat_super_secret_jwt_key_production_ready_2026!
CLIENT_URL=your_client_url
NODE_ENV=development
```

And `.env` inside `client/`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
Run from root directory:
```bash
npm run install:all
```

### 2. Run Development Server
Start backend and frontend:
```bash
# Terminal 1 (Backend Server on Port 3000)
npm run dev:server

# Terminal 2 (Vite Frontend Client on Port 5173)
npm run dev:client
```

### 3. Run Automated Tests
```bash
npm run test:server
```

---

## 📡 Socket.IO Architecture & Events

| Event Name | Direction | Description |
|---|---|---|
| `connection` | Client → Server | Authenticates socket connection via JWT cookie |
| `user_online` / `user_offline` | Server → Client | Broadcasts live presence updates |
| `send_message` | Client ↔ Server | Emits message with temporary ID & broadcasts to room |
| `receive_message` | Server → Client | Delivers realtime message payload to conversation room |
| `message_delivered` | Client ↔ Server | Emits delivery receipt (`✓✓`) |
| `message_read` | Client ↔ Server | Emits read receipt (`✓✓` turning blue) |
| `typing_start` / `typing_stop` | Client ↔ Server | Triggers live typing indicator status |
| `message_reaction` | Client ↔ Server | Updates emoji reaction in real time |
| `message_edit` / `message_delete` | Client ↔ Server | Synchronizes message edits and deletions |

---

## 🛡️ Security & Performance Highlights

- **Password Security**: Passwords hashed with `bcryptjs` (salt factor 10) and excluded from default Mongo selections.
- **Cookies**: Tokens stored in HTTP-only, SameSite cookies to protect against XSS attacks.
- **MongoDB Compound Indexes**: High performance indexes on `{ conversationId: 1, createdAt: -1 }` for instant paginated scrolling.
- **Optimistic UI**: Messages render instantly in state with fallback error handling if request fails.
