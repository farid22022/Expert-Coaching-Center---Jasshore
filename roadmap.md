# Expert Coaching Center Admin Roadmap

This document explains how the admin dashboard navigation works, how an admin is expected to use the system, and what each navbar item is responsible for.

## Admin Entry Flow

1. Admin opens `/Admin/login` or `/admin/login`.
2. The login form authenticates through the Django REST backend.
3. A valid admin, staff user, superuser, or `institute-admin` role user is redirected to `/admin/dashboard`.
4. The dashboard layout shows:
   - Left sidebar with all admin modules.
   - Top navbar with account status and logout.
   - Main page content from the selected route.
5. Logout clears the auth state and redirects to `/`.

## Routing Model

The admin sidebar is defined in:

`frontend/src/pages/admin/AdminDashboard.jsx`

Each menu item is converted into a slug route. Example:

- `1. User Management` becomes `/dashboard/user-management` and `/admin/dashboard/user-management`
- `Student Create` becomes `/dashboard/user-management/student/student-create`
- Numbered aliases are also supported, such as `/admin/dashboard/1-user-management`

The actual route mappings live in:

`frontend/src/routes/AppRoutes.jsx`

Current audit result:

- `391` admin sidebar paths checked
- `0` missing routes
- Both `/dashboard/...` and `/admin/dashboard/...` dashboard bases are supported

Detailed navbar workflow status is tracked in:

`navbar-functionality-matrix.md`

## Admin Module Overview

### 1. User Management

Purpose: Manage students, teachers, employees, management users, ID cards, RFID, disable/restore flows, and bulk entry/update pages.

Main groups:

- Student
- Teacher
- Employee
- Management
- Student ID Card
- Teacher Employee RFID
- Other Users RFID
- Management Disable
- Management Restore

Current behavior:

- Student, teacher, employee, and management pages are routed.
- Student/teacher/employee demo pages exist for future backend data entry.
- Test student and teacher accounts are seeded through the backend seed command.

Next backend priority:

- Connect student create/list/update pages to real `people/students` APIs.
- Connect teacher/employee pages to real `people/employees` APIs.
- Add role assignment UI for users created by admin.

### 2. Online Application

Purpose: Manage online admission applications, admission tests, result processing, reports, and public admission-card content.

Main groups:

- Application
- Admission Exam
- Admission Result
- Application Report

Important public route:

- `/admission/online`

Current behavior:

- Public online admission now shows admission cards first.
- Cards include image, date, teachers, fee, seats, subjects, schedule, eligibility, and an admission form.
- Admin can manage admission cards at:

`/admin/dashboard/online-application/application/form-setting`

Card data is currently stored in browser localStorage for frontend demo/admin editing.

Next backend priority:

- Create backend models/APIs for admission programs/cards.
- Store card image, fee, dates, teachers, subjects, and form fields in the database.
- Connect submitted admission forms to backend `admissions` APIs.

### Course Foundation

Purpose: Phase 1 foundation for the multi-role learning platform: courses, sections/groups, course subjects, teacher assignments, and enrollments.

Admin routes:

- `/admin/dashboard/courses`
- `/admin/dashboard/courses/sections`
- `/admin/dashboard/courses/subjects`
- `/admin/dashboard/teacher-assignments`
- `/admin/dashboard/enrollments`
- Sidebar aliases under `/admin/dashboard/course-foundation/...`

Backend APIs:

- `/api/v1/courses/courses/`
- `/api/v1/courses/sections/`
- `/api/v1/courses/subjects/`
- `/api/v1/courses/teacher-assignments/`
- `/api/v1/courses/enrollments/`

Current behavior:

- Admin can create and manage courses.
- Admin can create sections/groups inside courses.
- Admin can create course-level subjects inside sections.
- Admin can assign teachers as head teachers, subject teachers, assistant teachers, or coordinators.
- Admin can create enrollments separately from user registration.
- Student registration creates a `StudentProfile` only; it does not create an enrolled `Student`/`Enrollment` record.

Next backend priority:

- Add student-facing course browse/enroll flow.
- Add payment abstraction for course enrollment.
- Add teacher dashboard scoped by `TeacherAssignment`.
- Add assessment/question-bank models in the next phase.

### Teacher And Assessment Foundation

Purpose: Add scoped teacher dashboards, question bank, live/scheduled MCQ infrastructure, server-controlled attempts, auto evaluation, and in-app notifications.

Teacher/student routes:

- `/teacher/dashboard`
- `/student/dashboard`

Backend APIs:

- `/api/v1/courses/teacher/dashboard/`
- `/api/v1/assessments/questions/`
- `/api/v1/assessments/options/`
- `/api/v1/assessments/assessments/`
- `/api/v1/assessments/assessment-questions/`
- `/api/v1/assessments/attempts/`
- `/api/v1/assessments/student/assessments/`
- `/api/v1/sms/notifications/`

Current behavior:

- Teacher dashboard reads assigned courses, sections, subjects, and role scope from `TeacherAssignment`.
- Question bank supports text, image, diagram, single-answer and multiple-answer questions.
- MCQ assessments support scheduled/live windows, duration, publish state, question linking, attempts, autosaved answers, manual submit, and auto scoring.
- Student assessment API hides `is_correct` and explanations while serving active test questions.
- Student dashboard shows upcoming test count, live tests, result history count, and unread notification count.
- Notifications support unread counters plus mark-one/read-all actions.

Next backend priority:

- Add assignment file submissions and teacher evaluation.
- Add richer teacher-side question/assessment editors.
- Add head-teacher-specific permission checks for section-level management.
- Add server task/cron handling for auto-closing expired assessments.

### Assignment, Analytics, And Hardening Foundation

Purpose: Add assignment submissions/evaluation, performance analytics, file validation, rate limiting, and automated coverage for the assessment workflow.

Backend APIs:

- `/api/v1/assessments/submissions/`
- `/api/v1/assessments/submissions/:id/evaluate/`
- `/api/v1/assessments/submission-attachments/`
- `/api/v1/assessments/student/assessments/:id/submit_assignment/`
- `/api/v1/assessments/student/assessments/performance/`
- `/api/v1/assessments/student/assessments/history/`
- `/api/v1/assessments/analytics/teacher/`
- `/api/v1/assessments/analytics/subject/:subject_id/`

Current behavior:

- Students can submit assignment PDFs/images.
- Uploads are validated by extension, MIME type, and max size.
- Teachers can evaluate submitted assignments with marks and feedback.
- Student dashboard reads performance and assessment history.
- Teacher dashboard reads participant, average, highest, and lowest score analytics.
- Subject analytics are available by course subject.
- DRF user throttling is enabled, with a stricter assessment submission scope.
- Submission/evaluation models include audit fields through `OrganizationScopedModel`.
- New indexes cover student/status and assessment/status reporting paths.

Next backend priority:

- Add teacher-side rich assignment review UI.
- Add object-level teacher permission checks for every assigned subject action.
- Add background jobs for expired assessment auto-submit/auto-close.

### 3. Academic

Purpose: Manage academic setup, subjects, classes, sections, shifts, student groups/categories, classrooms, buildings, syllabus, and routines.

Main groups:

- Subject
- Class Routine
- Building List
- Floor List
- Class Room List
- Class Teacher Assign List
- Subject Combine Create
- Class
- Section
- Syllabus
- Shift
- Student Group
- Student Category
- Academic Setup

Current behavior:

- Subject page is backend-connected.
- Subject create/update/delete uses academic APIs.
- Organization is assigned automatically by the backend.
- Subject transfer and subject Excel entry are marked as not implemented until backend endpoints exist.

Next backend priority:

- Add import endpoint for subject Excel entry.
- Add subject transfer backend workflow.
- Connect routine/building/classroom/class/section pages to APIs.

### 4. Attendance

Purpose: Track student, teacher, and employee attendance, plus attendance summaries, absence reports, and teacher class attendance.

Main pages:

- Time Attendance
- Student Attendance
- Student Attendance Report
- Student Attendance Overview Report
- Student Details Attendance
- Student Attendance Summary
- Student Absent
- Teacher & Employee Attendance
- Teacher & Employee Attendance Report
- Teacher & Employee Details Attendance
- Teacher & Employee Attendance Summary
- Teacher & Employee Absent
- Teacher Class Attendance

Current behavior:

- All sidebar routes work.
- Top attendance navbar is available.
- `teacher-and-employee-*` alias routes are supported.

Next backend priority:

- Add attendance punch/import API.
- Add daily attendance summaries and report endpoints.

### 5. Examination

Purpose: Manage marks configuration, grades, exam lists, routines, admit cards, seat plans, and teacher exam subject assignments.

Main groups:

- Marks Configure
- Grade
- Signature Sheet
- Exam List
- Exam Routine
- Exam Routine Edit
- Admit Card Report
- Seat Plan
- Seat Plan Report
- Teacher Exam Subject Assign

Current behavior:

- All routes work.
- Parent group routes show shell pages.
- Top navbar is shown across examination pages.

Next backend priority:

- Implement exam models for exams, routines, grades, marks distributions, seat plans, and admit cards.

### 7. Result

Purpose: Process, publish, and report exam results.

Main pages:

- Result Position Setup
- Result Process
- Mark Sheet
- Tabulation Sheet
- Grade Sheet Report
- Merit List
- Fail Report
- Subject Wise Result
- Subject Wise Fail Report
- Exam Wise Roll Update
- Promotion
- Result Publish
- Exam Result Summary
- Student Result Summary

Current behavior:

- All routes work.
- Pages are ready as admin screens.

Next backend priority:

- Connect result process/publish pages to exams/results APIs.

### 8. Grand Final Result

Purpose: Manage final combined exam results, grand mark sheets, tabulation sheets, merit/fail reports, and student promotion.

Current behavior:

- All routes work.
- Pages are scaffolded for later business logic.

Next backend priority:

- Define grand exam configuration and combined-result calculation rules.

### 10. Manage Accounts

Purpose: Manage fees, fee categories, waivers, custom fees, expenses, income, ledger, fund transfer, payment gateway, payment history, balance sheet, and account reports.

Main groups:

- Fees Collection
- Fees Category
- Custom Fee
- Expense Category
- Expense
- Income Category
- Income
- General Ledger
- Fund Transfer
- Payment Gateway
- Payment History
- Balance Sheet Data
- All Account Reports
- Account Settings

Current behavior:

- All routes work.
- Parent group routes show shell pages.
- Top navbar is shown.

Next backend priority:

- Add finance APIs for fees, collections, waivers, invoices, payments, income, expenses, ledger, and reports.

### 11. HR and Payroll

Purpose: Manage salary, leave application, and payroll records.

Main groups:

- Salary
- Leave Application
- Payroll

Current behavior:

- All routes work.
- Parent group routes show shell pages.

Next backend priority:

- Connect salary and payroll pages to HR/payroll APIs.
- Add approval flow for leave applications.

### 12. Mail SMS Service

Purpose: Manage HR SMS, contacts, SMS APIs, campaigns, student SMS, SMS/mail setup, and templates.

Main groups:

- Manage HR SMS
- Contact Category
- Contacts
- SMS API
- SMS Campaign
- Manage Student SMS
- SMS/Mail Setup
- SMS/Mail Template

Current behavior:

- All routes work.
- Parent group pages show child actions.
- Template/setup pages are available.

Next backend priority:

- Store SMS providers, templates, campaigns, contacts, and send logs in backend.
- Add queue/send status endpoints.

### 13. Manage Library

Purpose: Manage publishers, authors, categories, books, issue/return workflows, and returned book records.

Main groups:

- Publisher
- Author
- Book Category
- Book
- Book Issue
- Book Return
- Book Returned List

Current behavior:

- All routes work.
- Parent routes for Publisher, Author, Book Category, Book, and Book Issue are available.

Next backend priority:

- Add library APIs for books, authors, publishers, issue records, returns, and stock status.

### 14. Certificate Report

Purpose: Give certificates, view certificate reports, and configure certificate settings.

Current behavior:

- All routes work.

Next backend priority:

- Add certificate templates, generated certificate records, and printable output.

### 15. All Reports

Purpose: Provide common admin reports.

Main pages:

- Student Report
- Create Inactive Student
- Inactive Student List
- Class Summary Report

Current behavior:

- All routes work.

Next backend priority:

- Connect report pages to filtered backend report APIs.

### 16. Hostel Management

Purpose: Manage hostel students, hostel expenses, hostel expense categories, hostel fees, hostel income, and hostel income categories.

Main groups:

- Hostel Student
- HMS Expense
- HMS Expense Category
- Hostel Fee
- Hms Income
- Hms Income Category

Current behavior:

- All routes work through a module dashboard and generic admin module pages.

Next backend priority:

- Add hostel APIs for enrollment, fees, dues, income, expenses, and reports.

### 17. Coaching Management

Purpose: Manage coaching students, coaching fees, coaching expenses, coaching expense categories, coaching income categories, and coaching income.

Current behavior:

- All routes work.
- Child routes and shorter aliases are supported.

Next backend priority:

- Add coaching-specific student, fee, income, and expense APIs.

### 18. Admin Panel

Purpose: Manage admin billing, academic year, admin list, password reset, roles, login history, admin disable, and admin restore.

Current behavior:

- All routes work.
- Role and user-login-history pages are available as admin pages.

Next backend priority:

- Connect role/permission UI to accounts APIs.
- Add admin enable/disable restore workflow.

### 19. Dynamic Website

Purpose: Manage website content shown on the public site.

Main groups:

- Front Service Box
- Notice Category
- Notice
- News Category
- News
- Photo Gallery Category
- Photo Gallery
- Video Gallery Category
- Video Gallery
- Pop Up
- Website Settings
- Custom Page List
- Slider List
- Menu List

Current behavior:

- All routes work through a dynamic website dashboard and generic admin module pages.

Next backend priority:

- Connect public website content to backend website APIs.
- Add image upload support for gallery/slider/pop-up content.

### 20. System Setup

Purpose: Configure shared setup values used throughout the application.

Main groups:

- Leave Category
- Holiday Category
- Yearly Holiday
- Blood Group
- Designation
- Religion
- Gender
- Education
- Profession
- Divisions
- Districts
- Upazilas

Current behavior:

- All routes work.
- Parent group routes and create/list routes are supported.
- Short aliases like `/create` and `/list` are supported.

Next backend priority:

- Connect setup values to backend system/setup APIs.
- Use these values in user, student, teacher, employee, and admission forms.

### Student Work

Purpose: Manage class work, assignments, and home work.

Main groups:

- Class Work
- Assignment
- Home Work

Current behavior:

- All routes work.
- Parent group routes and create/list routes are supported.

Next backend priority:

- Add backend APIs for homework, assignments, classwork, attachments, and student submissions.

## Current Backend Integration Status

Backend-connected or partially backend-connected:

- Authentication and JWT login
- Public registration with selected role assignment
- Admin dashboard route guard
- Academic Subject CRUD
- Organization-scoped create behavior
- Seeded admin, student, and teacher demo accounts

Frontend/demo-local state:

- Admission cards use localStorage
- Most admin module pages are UI scaffolds
- Many reports/forms currently display demo workflows

Generic placeholder route behavior:

- Some modules route to `AdminModulePage` until their full page is implemented.
- This keeps every sidebar click functional while backend-specific workflows are added gradually.

## Demo Accounts

Seed command:

```bash
python manage.py seed_core
```

Demo students:

- `test.student01@gmail.com` through `test.student10@gmail.com`
- Password: `2633123`

Demo teachers:

- `test.teacher01@gmail.com` through `test.teacher10@gmail.com`
- Password: `2633123`

## Recommended Implementation Order

1. Finish User Management backend integration:
   - Student create/list/update
   - Teacher create/list/update
   - Employee create/list/update
   - Role-based profile views

2. Move admission cards from localStorage to backend:
   - Admission program model
   - Program image upload
   - Program form-field settings
   - Application submissions tied to program

3. Complete Academic setup:
   - Class, section, shift, groups, categories
   - Routine and syllabus
   - Subject import/transfer

4. Build Attendance APIs:
   - Student attendance
   - Teacher/employee attendance
   - Absence and summary reports

5. Build Examination and Result engines:
   - Exam setup
   - Marks distribution
   - Seat plan
   - Result process and publish

6. Build finance/accounting:
   - Fees setup
   - Fee collection
   - Waiver
   - Income/expense
   - Ledger/reporting

7. Build communication and dynamic website:
   - SMS providers/templates/campaigns
   - Notices/news/gallery/slider/pop-up

8. Complete secondary modules:
   - Library
   - Hostel
   - Coaching
   - Certificate
   - Student work

## Admin Operating Principle

The admin panel should work module by module:

1. System Setup defines reusable values.
2. Academic defines classes, sections, subjects, and routines.
3. User Management creates students, teachers, employees, and roles.
4. Online Application receives new admissions and admission program data.
5. Attendance, Examination, Result, Accounts, SMS, Library, Hostel, and Coaching operate on those core records.
6. Dynamic Website publishes public-facing content.

This keeps the system consistent: setup first, people second, academic/admission workflows third, then operations and reporting.
