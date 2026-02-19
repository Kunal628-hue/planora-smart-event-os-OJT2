# Planora – Smart Event Operating System

> A full-stack SaaS platform for planning, executing, and analysing events at any scale.

---

## 🗂️ Project Structure

```
planora-smart-event-os-OJT2/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express API
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev
# Runs at http://localhost:5000
```

---

## 🧱 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS v4     |
| Routing    | react-router-dom v7                 |
| Animation  | anime.js                            |
| Backend    | Node.js, Express 4                  |
| Auth       | localStorage token (demo)           |

---

## 📄 Pages

| Route          | Description                       |
|----------------|-----------------------------------|
| `/`            | Landing page                      |
| `/login`       | Login form                        |
| `/signup`      | Registration form                 |
| `/dashboard`   | Protected dashboard (needs token) |

---

## 🔒 Auth Flow

- Login / Signup write a `planora_token` key to `localStorage`.
- `ProtectedRoute` reads this key — redirects to `/login` if absent.
- Logout clears the key and redirects.

---

© 2026 Planora Technologies, Inc.
