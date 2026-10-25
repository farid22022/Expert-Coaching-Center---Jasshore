# Expert Coaching Center — Jashore

A full-stack coaching-center platform with a public website, student learning
portal, teacher tools, administration dashboards, online applications,
academic management, payments, and Firebase hosting support.

## Run from a fresh clone

### 1. Clone the repository

```bash
git clone https://github.com/farid22022/Expert-Coaching-Center---Jasshore.git
cd Expert-Coaching-Center---Jasshore
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Copy the example environment file and fill in the Firebase/API values required
for your environment:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead.

### 3. Start the frontend

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally
`http://localhost:5173`.

The frontend uses the configured API/Firebase services. If this checkout is
paired with a separate backend, start that backend using its own instructions
and set the frontend API base URL in `.env.local`.

## Production build and preview

From `frontend/`:

```bash
npm run build
npm run preview
```

The deployable build is written to `frontend/dist/`. A copy of the current
build is also committed in the root `output/` directory for download or static
hosting.

## Firebase deployment

Authenticate with Firebase, select the configured project, and deploy hosting:

```bash
npx firebase login
npm run deploy
```

The deployment script targets the `expert-coaching-center-jashore` Firebase
project. Use your own Firebase project and environment values for a different
deployment.

## Current features

- Public home, about, contact, gallery, stories, academic, admission, result,
  and content pages.
- Responsive navigation, language switching, theme controls, SEO metadata,
  animated page entrances, counters, hero sliders, and accessible states.
- Student portal with dashboard, courses, curriculum, assignments, practice,
  assessments, results, bookmarks, progress, feedback, notifications, and
  profile/payment views.
- Teacher portal with course outlines, academic structure, gradebook,
  interventions, performance center, and student profiles.
- Admin dashboard with user management, academic structure, admissions,
  examinations, results, attendance, certificates, accounts, library, hostel,
  HR/payroll, website content, mail/SMS, and payment management.
- Online admission applications, admission tests, result publishing, and
  application reporting.
- Firebase authentication, protected role-based routes, API services, and
  sanitized rich-content rendering.
- Framer Motion, GSAP, Tailwind CSS, DaisyUI, responsive layouts, and reduced
  motion-friendly UI behavior.

## Useful commands

```bash
npm run dev       # Start Vite development server
npm run build     # Create production build in dist/
npm run preview   # Preview the production build locally
npm run deploy    # Deploy frontend hosting through Firebase
```

## Project structure

- `frontend/src/` — React application, routes, pages, components, services,
  translations, and styles.
- `frontend/public/` — static images, videos, illustrations, and documents.
- `frontend/dist/` — generated production build.
- `output/` — committed copy of the generated build.
- `backend/` — backend services and API code when running the paired backend.

## Environment and security

Keep `.env`, `.env.local`, Firebase private keys, database credentials, and
service-account files out of Git. Use publishable/client configuration in the
frontend only; keep privileged secrets on the server.
