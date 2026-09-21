# Expert Coaching Center Backend

Django REST Framework backend for the existing React School/Institute Management System.

## Setup

Create the MySQL database and user first:

```sql
CREATE DATABASE expert_coaching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'expert_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON expert_coaching.* TO 'expert_user'@'localhost';
FLUSH PRIVILEGES;
```

Create the Python environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure env:

```bash
copy .env.example .env
```

Set `DB_PASSWORD` in `.env` to your local database password. Do not commit `.env`.

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_core
python manage.py createsuperuser
python manage.py runserver
```

API docs:

- `GET /api/schema/`
- `GET /api/docs/`

## Implemented Backend Modules

- Auth/JWT: `/api/v1/auth/login/`, `/refresh/`, `/logout/`, `/me/`
- RBAC: users, roles, permissions, login history
- Organizations and branches
- Academic: sessions, classes, sections, shifts, groups, categories, subjects, buildings, floors, rooms, routines, syllabus
- People: students, guardians, documents, addresses, employees, departments, designations
- Admissions: applications, documents, payments, admission exam, marks, result processing
- Exams/results: grade scales, exams, exam subjects, student marks, result processing/publishing, grand result models
- Finance: fee category, structures, student fees, collections, transactions, expense/income
- HR/payroll: payroll structures, employee payroll assignment, salary records, leave types/applications
- SMS/email: providers, templates, campaigns, recipients, logs
- Public website: notices/news/events/galleries/settings
- Audit logs

## Route/API Mapping Starter

| Frontend Area | Main API Prefix |
| --- | --- |
| User Management | `/api/v1/people/`, `/api/v1/auth/users/` |
| Online Application | `/api/v1/applications/` |
| Academic | `/api/v1/academic/` |
| Attendance | planned under `/api/v1/attendance/` |
| Examination/Result | `/api/v1/exams/` |
| Manage Accounts | `/api/v1/finance/` |
| HR and Payroll | `/api/v1/hr/` |
| Mail SMS Service | `/api/v1/sms/` |
| Dynamic Website/Public Site | `/api/v1/website/` |
| Audit | `/api/v1/audit/logs/` |

## Notes

This backend is structured around the existing React route/menu inventory. The next integration pass should replace local React state and `window.alert` flows with calls through the frontend API services.

