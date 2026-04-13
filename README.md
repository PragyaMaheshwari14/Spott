<div align="center">

<img src="/public/spott.jpg" alt="Spott Logo" height="80" />

# Spott

**Discover & create amazing events — built for India.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-realtime-EE4A4A?style=flat-square)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-auth-6C47FF?style=flat-square)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

[Live Demo](https://pragyamaheshwari.com) · [Report a Bug](https://github.com/PragyaMaheshwari14/spott/issues) · [Request Feature](https://github.com/PragyaMaheshwari14/spott/issues)

</div>

---

## What is Spott?

Spott is a full-stack event management and ticketing platform. Admins can create events, track registrations in real time, and check in attendees with a QR code scanner. Attendees can discover events near them, register instantly, and carry a digital QR ticket on their phone.

> Built with a real-time backend (Convex), so every registration and check-in reflects instantly — no refresh needed.

---

## Features

### For Attendees
- **Discover events** — featured carousel, browse by category, filter by city/state
- **Register in seconds** — fill name + email, get a unique QR code ticket
- **My Tickets** — view all upcoming and past registrations with a live QR code modal
- **Cancel anytime** — one click cancellation, seat is freed up immediately
- **Personalised onboarding** — choose interest categories and your city to get relevant recommendations

### For Admins (Organisers)
- **Create events** — with AI-assisted form filling (describe your event in one sentence, Gemini fills the rest)
- **Cover image picker** — search millions of photos from Unsplash directly in the form
- **Real-time dashboard** — total registrations, check-in rate, revenue, hours until event
- **QR scanner** — scan attendee tickets with your device camera at the door
- **Manual check-in** — click to check in attendees from the attendee list
- **Delete events** — automatically removes all linked registrations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui, Radix UI |
| Language | JavaScript (JSX) |
| Backend | Convex (real-time BaaS) |
| Auth | Clerk |
| Styling | Tailwind CSS v4, oklch color system |
| AI | Google Gemini 2.0 Flash |
| Image Search | Unsplash API |
| QR Code | react-qr-code + html5-qrcode |
| Location Data | country-state-city |
| Search | Convex Search Index (full-text) |
| Deployment | Vercel + Convex Cloud |

---

## Project Structure

```
spott/
├── app/
│   ├── layout.js                  # Root layout — Clerk + Convex + Theme providers
│   ├── page.jsx                   # Homepage (Server Component)
│   ├── explore/
│   │   ├── page.jsx               # Explore main page
│   │   ├── layout.jsx             # Explore layout with back button
│   │   └── [slug]/page.jsx        # Dynamic — category or city/state slug
│   ├── events/[slug]/page.jsx     # Event detail page
│   ├── my-tickets/page.jsx        # Attendee's registered events + QR codes
│   ├── my-events/
│   │   ├── page.jsx               # Admin's created events
│   │   └── [eventId]/page.jsx     # Event dashboard + attendee management
│   ├── create-event/page.jsx      # Event creation form with AI fill
│   └── api/
│       └── generate-event/route.js  # Gemini AI endpoint
│
├── convex/
│   ├── schema.js                  # Database schema — all tables + indexes
│   ├── users.js                   # Auth sync, onboarding, role management
│   ├── events.js                  # Create, fetch, delete events
│   ├── registration.js            # Register, cancel, check-in, QR lookup
│   ├── explore.js                 # Featured, popular, local, category queries
│   ├── search.js                  # Full-text search
│   ├── dashboard.js               # Real-time dashboard stats
│   └── auth_config.js             # Clerk JWT issuer config
│
├── components/
│   ├── event-card.jsx             # Reusable card — grid, compact, list variants
│   ├── header.jsx                 # Glassmorphism nav with search + auth
│   ├── search-location-bar.jsx    # Debounced search + state/city selectors
│   ├── onboarding-modal.jsx       # 2-step interest + location onboarding
│   ├── register-modal.jsx         # Event registration form
│   ├── attendee-card.jsx          # Attendee row with manual check-in
│   ├── qr-scanner-modal.jsx       # Camera-based QR scanner
│   └── unsplash-image-picker.jsx  # Cover image search dialog
│
├── hooks/
│   ├── use-convex-query.jsx       # isLoading + error wrappers for Convex
│   ├── use-store-user.js          # Syncs Clerk identity → Convex on login
│   ├── use-onboarding.jsx         # Onboarding gate logic
│   └── use-is-admin.js            # { isAdmin, isLoading, user }
│
└── lib/
    ├── data.js                    # CATEGORIES array (12 event types)
    ├── location-utils.js          # createLocationSlug / parseLocationSlug
    └── utils.js                   # cn() — clsx + tailwind-merge
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev/) account
- A [Clerk](https://clerk.com/) account
- A [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)
- An [Unsplash](https://unsplash.com/developers) API key

### 1. Clone the repository

```bash
git clone https://github.com/PragyaMaheshwari14/spott.git
cd spott
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will create a new Convex project and generate the `convex/_generated/` folder. Copy the deployment URL shown in the terminal.

### 3. Set up Clerk

1. Create a new application at [clerk.com](https://clerk.com/)
2. Go to **JWT Templates** → create a new template named `convex`
3. Copy the **Issuer URL** from the template

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-issuer-url.clerk.accounts.dev

# AI
GEMINI_API_KEY=your_gemini_api_key

# Unsplash
NEXT_PUBLIC_UNPLASH_ACCESS_KEY=your_unsplash_access_key
```

### 5. Configure Convex authentication

Update `convex/auth_config.js` with your Clerk issuer domain:

```js
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

Then add `CLERK_JWT_ISSUER_DOMAIN` to your Convex environment variables in the [Convex Dashboard](https://dashboard.convex.dev/).

### 6. Run the development server

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Setting Up Your First Admin

By default, all users sign up as `role: "user"`. To make yourself an admin, run this one-time command from the [Convex Dashboard](https://dashboard.convex.dev/) → **Functions** tab:

```
bootstrapAdmin({ userId: "<your_convex_user_id>" })
```

Your user ID is visible in the Convex dashboard under the `users` table after you sign in once. After this, you can promote other users to admin from the app using the `setUserRole` mutation.

---

## Database Schema Overview

```
users         — tokenIdentifier (Clerk ID), role, location, interests, onboarding status
events        — title, slug, organizer, category, dates, location, capacity, ticketType
registration  — eventId, userId, attendeeName, attendeeEmail, qrCode, checkedIn, status
```

**Key indexes:**
- `registration.by_event_user` — prevents duplicate registrations (O(log n) check)
- `registration.by_qr_code` — instant QR scan lookup at check-in
- `events.search_title` — full-text search across event titles

---

## How the QR Check-In Works

1. User registers → server generates a unique QR string (`EVT-{timestamp}-{random9}`)
2. User opens **My Tickets** → sees their QR code rendered by `react-qr-code`
3. Organiser opens the **QR Scanner** in their dashboard
4. `html5-qrcode` accesses the device camera and scans the code
5. `checkInAttendee` mutation looks up the registration by the `by_qr_code` index, verifies the organiser, and sets `checkedIn: true`
6. The dashboard stats update instantly via Convex's real-time subscriptions

---

## AI Event Generation

In the create event form, type a sentence describing your event (e.g. *"a weekend hackathon for college students in Bangalore"*) and click the AI button. It calls the `/api/generate-event` route, which sends the prompt to **Gemini 2.0 Flash** and returns structured JSON:

```json
{
  "title": "BLR Hack Weekend",
  "description": "A two-day hackathon...",
  "category": "tech",
  "suggestedCapacity": 100,
  "suggestedTicketType": "free"
}
```

This auto-fills the form. You can edit any field before submitting.

---

## Scripts

```bash
npm run dev        # Start Next.js dev server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npx convex dev     # Start Convex backend (required alongside npm run dev)
npx convex deploy  # Deploy Convex functions to production
```

---

## Deployment

### Vercel (Frontend)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com/)
2. Add all environment variables from `.env.local` in the Vercel project settings
3. Deploy

### Convex (Backend)

```bash
npx convex deploy
```

Copy the production deployment URL and update `NEXT_PUBLIC_CONVEX_URL` in Vercel.

---

## Roadmap

- [ ] Email confirmation after registration (Resend / SendGrid)
- [ ] Payment gateway for paid events (Razorpay)
- [ ] Drag-and-drop start/end tile (editor mode)
- [ ] Unit tests for Convex functions (Vitest)
- [ ] E2E tests for registration and check-in flows (Playwright)
- [ ] Optimistic UI updates for check-in and cancellation
- [ ] Event image upload to Convex file storage (instead of Unsplash URLs)
- [ ] TypeScript migration

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ♥ by [Pragya Maheshwari](https://pragyamaheshwari.com)

[![Portfolio](https://img.shields.io/badge/Portfolio-pragyamaheshwari.com-2D7B4F?style=flat-square)](https://pragyamaheshwari.com)
[![GitHub](https://img.shields.io/badge/GitHub-PragyaMaheshwari14-181717?style=flat-square&logo=github)](https://github.com/PragyaMaheshwari14)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-pragyam1403-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/pragyam1403)

</div>
