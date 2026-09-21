# Attendance module

Copy this folder to:

`frontend/src/pages/admin/Dashboard/attendance/`

This module uses React, React Router, Tailwind CSS, DaisyUI, Framer Motion and GSAP. No custom CSS file is required.

`AttendanceDashboard.jsx` imports and re-exports all 13 attendance pages, so AppRoutes can import everything from that single file.

See `ROUTES.txt` for the route helper.

The demo pages share attendance data through localStorage key `expertAttendanceRecords` so Student Attendance and Teacher/Employee Attendance feed the report, details, summary and absent pages.
