# 💬 Chat Genius (Slack Clone Chat Application)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-Logic-3178C6?style=for-the-badge&logo=typescript)

A full-stack realtime team messaging platform inspired by Slack. Built with **Next.js**, **Supabase**, and **Tailwind CSS**. Designed for smooth channel-based communication with realtime updates, presence indicators, and a clean, modern interface.

> A focused, production-ready mini Slack alternative for small teams, hackathons, and portfolio demonstrations.

---

## ✨ Highlights

- 🔴 **Realtime Messaging:** Instant message delivery via WebSockets.
- 🔐 **Secure Auth:** Powered by Supabase Auth (Email/Password & OAuth).
- 👥 **Presence:** Live online/offline status indicators.
- 📡 **Live Updates:** Synchronized state across clients using Supabase Realtime.
- 🎨 **Modern UI:** Polished, responsive interface built with Tailwind CSS.
- 📜 **Smart Scrolling:** Pagination and auto-scroll to bottom.

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Realtime Flow](#-realtime-flow)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Features

### Authentication
* Email/Password registration and login.
* **Google OAuth** integration.
* Automatic profile creation triggers upon sign-up.
* Persistent sessions via `SessionProvider`.

### Channels
* Create, join, and leave channels.
* Sidebar updates instantly upon changes.
* **Visibility Control:** Users only see channels they have joined.

### Messaging
* **Optimistic UI:** Instant feedback when sending messages.
* **Deduplication:** Prevents duplicate message rendering.
* Enriched metadata (user profiles, avatars) attached to messages.
* Infinite scroll history.

### Presence
* Online/Offline indicators synced across tabs and users.
* Low-latency updates using Supabase Broadcast Channels.

---

## 🧰 Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State/Components:** React Server & Client Components

### Backend (Supabase)
- **Database:** PostgreSQL
- **Auth:** Supabase Auth
- **Realtime:** Postgres Changes & Broadcast Channels

---

## 🏗 Architecture

This project follows a scalable Next.js architecture:

1.  **Next.js App Router:** Handles routing, layouts, and initial server-side rendering.
2.  **Supabase Client:** Singleton instance configured in `lib/supabaseClient.ts`.
3.  **Context Providers:**
    * `SessionProvider`: Manages authentication state.
    * `ChannelsProvider`: Manages active channel, messages, and presence state.

---

## 📁 Project Structure

```bash
.
├── app
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind imports
│   ├── login/                  # Auth pages
│   └── channels
│       ├── layout.tsx          # Main app shell (Sidebar + Nav)
│       ├── page.tsx            # Empty state
│       ├── create/             # Channel creation
│       └── [id]
│           └── page.tsx        # Main chat interface
│
├── components
│   ├── SessionProvider.tsx
│   └── chat
│       ├── ChannelsProvider.tsx
│       ├── Sidebar.tsx
│       ├── TopNav.tsx
│       ├── MessageList.tsx
│       ├── MessageBubble.tsx
│       └── MessageInput.tsx
│
├── lib
│   └── supabaseClient.ts       # Supabase config
│
├── public/assets
└── .env.local
```

---

## 🗄 Database Schema

Run the following SQL in your Supabase SQL Editor to set up the backend.

```sql
-- 1. Profiles (Linked to Auth)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMP DEFAULT now()
);

-- 2. Channels
CREATE TABLE channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT UNIQUE NOT NULL,
  description  TEXT,
  created_at   TIMESTAMP DEFAULT now()
);

-- 3. Channel Members (Join Table)
CREATE TABLE channel_members (
  user_id     UUID REFERENCES auth.users(id),
  channel_id  UUID REFERENCES channels(id),
  joined_at   TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

-- 4. Messages
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  channel_id  UUID REFERENCES channels(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT now()
);
```

---

## 🔁 Realtime Flow

The chat system utilizes two specific Supabase realtime mechanisms:

1.  **Postgres Changes (Database Listeners)**
    * *Trigger:* When a row is inserted into the `messages` table.
    * *Action:* All clients subscribed to that channel receive the new payload.
    * *Benefit:* Guarantees reliable data synchronization.

2.  **Broadcast Channels (Ephemeral)**
    * *Trigger:* User typing or initial "send" action.
    * *Action:* Used for instant feedback and "User is online" presence.
    * *Benefit:* Prevents UI lag.

> **Note:** A frontend deduplication layer ensures that the Optimistic UI update and the Postgres confirmation do not result in double messages.

---

## 🔐 Security

Security is enforced using **PostgreSQL Row Level Security (RLS)**.

* **Authentication:** Only logged-in users can access the application.
* **Membership Validation:** Users can only read/write messages in channels they have joined (`channel_members` table check).
* **Data Minimization:** Profile data is restricted to public fields (name/avatar).

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/slack-clone.git](https://github.com/your-username/slack-clone.git)
cd slack-clone
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Supabase
1.  Create a new project at [database.new](https://database.new).
2.  Go to the **SQL Editor** and paste the Schema provided above.
3.  Go to **Project Settings > API** to find your URL and Key.

### 4. Environment Variables
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## 🌐 Deployment

This project is optimized for **Vercel**.

1.  Push your code to GitHub.
2.  Import the repository into Vercel.
3.  Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel Environment Variables settings.
4.  Deploy!

---

## 📄 License

This project is licensed under the MIT License.
