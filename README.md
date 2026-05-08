# 🎖️ DEFENCE PATHWAY — SSB Preparation Platform

A fully-featured, production-ready SSB preparation web app built with **React + Firebase + Vite**, deployable on **Vercel** in one click.

---

## 🚀 FEATURES

| Module | Description |
|---|---|
| **GD Topics** | Group Discussion topics with 500-word content, search & timer |
| **PP&DT** | Image-based practice with 30s observe + 4min story timer |
| **GTO Tasks** | Obstacle task library with difficulty levels |
| **WAT** | 60 words, 15s each, auto-advance with response tracking |
| **SRT** | 60 situations, 30-min countdown, navigation sidebar |
| **Lecturette** | Random topic selector with prep + speaking timers |
| **Live Sessions** | Google Meet sessions with live countdown timers |
| **Video Library** | YouTube video player with thumbnail previews |
| **Admin Panel** | Full CRUD for all content, visibility toggles, timer config |

---

## 🛠️ TECH STACK

- **Frontend**: React 18 + React Router 6 + Vite
- **Backend**: Firebase (Firestore + Storage + Auth)
- **Hosting**: Vercel (zero-config)
- **Fonts**: Bebas Neue, Rajdhani, Share Tech Mono
- **Theme**: Military dark — army green + tactical UI

---

## ⚙️ SETUP INSTRUCTIONS

### 1. Clone / Download the project
```bash
git clone https://github.com/your-username/defence-pathway.git
cd defence-pathway
npm install
```

### 2. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → **defence-pathway** (or any name)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in production mode
5. Enable **Storage**
6. Go to **Project Settings** → **Your apps** → Add Web App
7. Copy the config values

### 3. Set up Admin User

In Firebase Console → Authentication → Users → Add User:
- Email: `admin@defencepathway.in` (or your choice)
- Set a strong password

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase values:
```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_ADMIN_EMAIL=admin@defencepathway.in
```

### 5. Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read
    match /{collection}/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@defencepathway.in';
    }
  }
}
```

### 6. Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🚀 DEPLOY TO VERCEL

### Option A — One-Click (GitHub)

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repo
4. Add environment variables (all `VITE_*` variables from `.env.local`)
5. Click **Deploy** ✅

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

---

## 📁 PROJECT STRUCTURE

```
defence-pathway/
├── src/
│   ├── firebase/
│   │   ├── config.js          # Firebase init
│   │   └── firestore.js       # All DB helpers
│   ├── hooks/
│   │   ├── useAuth.jsx        # Auth context
│   │   └── useSettings.jsx    # Settings context
│   ├── components/
│   │   ├── Layout.jsx         # Navbar + footer
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── WATModule.jsx      # WAT test
│   │   ├── SRTModule.jsx      # SRT test
│   │   ├── GDModule.jsx       # GD topics
│   │   ├── PPDTModule.jsx     # PP&DT practice
│   │   ├── GTOModule.jsx      # GTO tasks
│   │   ├── LecturetteModule.jsx
│   │   ├── MeetSessions.jsx
│   │   ├── YoutubeSessions.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx # Full admin CRUD
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx                # Routes
│   └── main.jsx               # Entry point
├── index.html
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## 🔐 ADMIN PANEL

Visit `/admin` → Login with your Firebase admin email/password.

**Admin capabilities:**
- Add/Edit/Delete GD topics, WAT sets, SRT sets, GTO tasks, Lecturette topics
- Upload PP&DT images to Firebase Storage
- Manage Meet sessions with visibility toggle
- Manage YouTube videos with visibility toggle
- Configure timers (WAT interval, SRT duration, Lecturette time)
- Toggle module visibility (Lecturette, Meet, YouTube)

---

## 📜 FIRESTORE COLLECTIONS

| Collection | Purpose |
|---|---|
| `gd_topics` | Group Discussion topics |
| `wat_words` | WAT word sets (array of words) |
| `srt_sets` | SRT situation sets |
| `ppdt_images` | PP&DT image metadata + Storage URLs |
| `gto_tasks` | GTO obstacle task details |
| `lecturette_topics` | Lecturette topic list |
| `google_meet_sessions` | Meet session details |
| `youtube_sessions` | YouTube video entries |
| `settings` | Global platform settings (doc: `global`) |

---

## 🎨 DESIGN SYSTEM

- **Primary**: Army Green `#4a7c3f` / Bright `#6dbf5e`
- **Accent**: Gold `#c8a84b` | Red `#c0392b` | Blue `#2980b9`
- **Background**: Deep tactical dark `#0a0d08`
- **Fonts**: Bebas Neue (display) + Rajdhani (body) + Share Tech Mono

---

**DEFENCE PATHWAY** — Built for Indian Armed Forces Aspirants 🇮🇳
