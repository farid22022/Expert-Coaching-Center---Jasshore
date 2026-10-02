# ASTRA browser E2E report

Run: 2026-10-02. Local frontend :5173, backend :8000. In progress.
Only browser-observed actions count as PASS. Historical automated tests are not browser evidence. Credentials omitted. Dedicated fixture accounts reused; new records use ASTRA E2E names.

| Role | Route | Action | Expected | Actual | Status | Console Error | Network Error | Bug ID |
|---|---|---|---|---|---|---|---|---|
| Admin | /admin/login → /admin/dashboard | Fixture login | Dashboard | Dashboard navigation loaded | PASS | None during login | None observed | — |
| Admin | /admin/dashboard/admissions | Create ASTRA admission with blank optional dates, then refresh | Persist fee100 / seats20 | Failed first; saved and listed after fix and refresh | PASS (retest) | HMR ThemeProvider error cleared by reload | Field validation confirmed by serializer | ASTRA-001 |
| Admin/public | /admin/dashboard/admission-form-builder → /admission/online/astra-e2e-medical-admission-2027 | Save 8 fields; reload editor; open public form | Exact fields persist | Name, Phone, Email, College, Guardian Phone, Previous Result, Address, Study Shift and options present | PASS | None observed | None observed | — |
| Admin | /admin/dashboard/teacher-assignments | Assign fixture head to ASTRA admission | Assignment listed | Matching teacher/admission row appeared | PASS | None observed | None observed | — |
| Public | /admission/online/astra-e2e-medical-admission-2027 | Submit empty form | Required inputs block submit | Name validation shown; required phone/email invalid | PASS | None observed | No submission sent | — |
| Head/student fixtures | /login | Documented credentials | Login | Both dedicated E2E credentials rejected; Demo Teacher 10 succeeds | BLOCKED (fixtures) | None observed | Authentication rejection | ASTRA-002 |
| Public | ASTRA admission landing | Responsive overflow at 360/390/430/768/1024/1366 | No horizontal page overflow | Document width stayed within viewport; 390px screenshot checked | PASS (page only) | None observed | None observed | — |
| Admin | Teachers, Applications, Payments, Notices, Gallery, Banners, Success Stories, Renowned Teachers, Website Settings | Open routes | Functional page renders | Headings/forms/tables rendered; no console errors captured in audit tab | PASS (render only) | None captured | Response bodies unavailable in browser tool | — |
| Student | ASTRA admission landing | Submit all eight form values using demo student50 | Pending application | Application ADM-2026-000017 submitted; Pending Review | PASS | None observed | None observed | — |
| Public | ASTRA admission landing | Retest enrollment instructions | Approval precedes payment | Corrected steps visible on reload | PASS | None observed | None observed | ASTRA-003 |
