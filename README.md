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

### 2. Set up the backend

The backend is a Django REST API located in `backend/`.

Create and activate a virtual environment from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend requirements and create its environment file:

```bash
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

On Windows PowerShell, use `Copy-Item backend/.env.example backend/.env`.
Update `backend/.env` with the database, allowed frontend URL, and payment
provider settings for your environment. The default bKash configuration uses
the safe mock provider for local development.

Apply migrations and create an administrator when needed:

```bash
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

Start the API in a separate terminal:

```bash
python backend/manage.py runserver 127.0.0.1:8000
```

The API is available at `http://127.0.0.1:8000`, with a health endpoint at
`http://127.0.0.1:8000/health/` and versioned endpoints under
`http://127.0.0.1:8000/api/v1/`.

### 3. Install frontend dependencies

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

### 4. Start the frontend

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally
`http://localhost:5173`.

The frontend uses the configured Firebase services and the Django API at
`http://127.0.0.1:8000`. Set the API base URL in `.env.local` if your backend
runs on another host or port. Keep the backend and frontend running in two
terminals during development.

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
- `backend/` — Django settings, REST API apps, migrations, payment handling,
  authentication, and administrative services.

## Backend checks

```bash
python backend/manage.py check
python backend/manage.py test
```

For a production deployment, run Django behind a production WSGI/ASGI server,
configure a real database and payment credentials, set `DEBUG=false`, restrict
`ALLOWED_HOSTS`, and collect static files with `python backend/manage.py collectstatic`.

## Environment and security

Keep `.env`, `.env.local`, Firebase private keys, database credentials, and
service-account files out of Git. Use publishable/client configuration in the
frontend only; keep privileged secrets on the server.
