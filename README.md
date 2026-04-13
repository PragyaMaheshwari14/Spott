# Spott

**Event management & ticketing platform built for India.**

---

## 🚀 Project Overview

Spott is a full-stack platform where users can **discover, register, and manage events**, while organizers can **create events, track registrations in real-time, and handle check-ins using QR codes**.

It uses a real-time backend, so updates like registrations and check-ins reflect instantly without refreshing.

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React  
- **Backend:** Convex (real-time database & APIs)  
- **Authentication:** Clerk  
- **Styling:** Tailwind CSS  
- **AI:** Google Gemini  
- **Other Tools:** Unsplash API, QR Code libraries  
- **Deployment:** Vercel + Convex  

---

## ✨ Features

### 👤 User
- Discover events by category and location  
- Quick registration with QR ticket  
- View and manage tickets  
- Cancel registrations anytime  

### 🛠 Admin
- Create events (AI-assisted form)  
- Real-time dashboard (registrations, stats)  
- QR code scanning for check-in  
- Manage attendees and events  

---

## ⚙️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/PragyaMaheshwari14/spott.git
cd spott

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# AI
GEMINI_API_KEY=your_gemini_key

# Unsplash
NEXT_PUBLIC_UNPLASH_ACCESS_KEY=your_unsplash_key

# Start backend
npx convex dev

# Start frontend
npm run dev
npm install
