# ASTRA browser bugs

Run: 2026-10-02. In progress; no unverified success claims.

| ID | Severity | Role | Route | Action | Expected | Actual | Root Cause | Fix | Retest |
|---|---|---|---|---|---|---|---|---|---|
| ASTRA-003 | MEDIUM | Public/student | Admission landing page | Read How to Enroll | Approval then payment then enrollment | Instructions said pay before approval and approval alone grants course access | Outdated enrollment steps | Correct order and condition | Pending browser retest |
| ASTRA-001 | HIGH | Admin | /admin/dashboard/admissions | Create with optional dates empty | Admission saved | Request failed, record absent | Investigating empty-date payload; generic envelope message hides field errors | Error helper now prioritizes field errors | Pending |
| ASTRA-001 retest | HIGH | Admin | /admin/dashboard/admissions | Same empty-date create | Persist | ASTRA record remains after refresh | Empty string optional dates | Normalize dates to null; prioritize detailed API errors | PASS in browser |
| ASTRA-002 | MEDIUM | QA fixtures | /login | Use documented E2E head/student credentials | Login | Rejected | Credential file stale or account changed; not yet distinguished | Use authorized working demo accounts; no password reset | Demo Teacher 10 login PASS |
