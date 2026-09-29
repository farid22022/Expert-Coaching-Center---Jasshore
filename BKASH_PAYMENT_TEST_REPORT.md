# bKash payment test report

Date: 2026-09-29

## Automated results

`python manage.py test apps.payments --keepdb --verbosity 1`

- **PASS — 9 tests**
- verified mock completion activates exactly one enrollment when execution is repeated;
- amount submitted by the browser is ignored and another user cannot pay for the application;
- a forged callback `status=success` cannot complete payment;
- invalid account, verification code, and PIN are rejected and none of those values are persisted;
- an active agreement is reused by a later admission and skips account, verification, and PIN steps;
- payment and enrollment notifications remain idempotent.
- a verified payment survives a simulated enrollment failure and later activates enrollment without a second provider payment or transaction ID.

`npm run build`

- **PASS — 3,140 modules transformed**
- payment pages and admin payment dashboard compile as lazy route chunks;
- the existing unresolved Fragment Mono runtime font reference and main bundle size warning remain non-blocking build warnings.

`python manage.py test --keepdb --verbosity 1`

- **PASS — 80 tests in 305.202 seconds**
- the complete Django regression suite passed with no failures or system-check errors;
- existing unordered-queryset pagination warnings were reported for accounts and assessments.

`node --test tests/admissionFormSchema.test.mjs`

- **PASS — 3 tests**

`python manage.py makemigrations --check --dry-run`

- **PASS — no model changes missing migrations**

## Browser verification

The localhost application was exercised with development-only records and fake credentials.

- **PASS** first mock transaction completed, created one active enrollment, exposed the course, and rendered a test receipt.
- **PASS** payment history showed the completed record with amount and application number.
- **PASS** a second approved admission detected `017******00` and opened directly at Confirm Payment.
- **PASS** returning payment completed with a new payment and transaction ID while reusing the agreement ID.
- **PASS** the success page showed backend-verified payment and active enrollment.
- **PASS** the admin dashboard listed both transactions, totals, masked wallet, environment, provider payment ID, transaction ID, invoice, verification time, enrollment state, and event timeline.
- **PASS** no raw account, verification code, or PIN appeared in stored agreement metadata or admin output.

## Acceptance matrix

| Check | Result | Evidence |
|---|---|---|
| Agreement account validation | PASS | API test rejects wrong account; full browser flow accepts configured fake account |
| Agreement verification code | PASS | API test rejects wrong code; correct code advances server state |
| Agreement PIN | PASS | API test rejects wrong PIN; correct PIN creates active agreement; no secret stored |
| Agreement creation | PASS | Active `MOCK_AGR_...` record and masked account verified |
| Payment creation | PASS | Backend-created `MOCK_PAY_...` and trusted invoice shown in admin |
| Payment execution | PASS | Success, failed, cancelled, and pending provider states tested |
| Backend verification | PASS | Payment ID, amount, currency, invoice, and agreement ID checked server-side |
| Automatic enrollment | PASS | Exactly one active enrollment after verified success |
| Enrollment recovery | PASS | Verified payment remains completed; a later status call retries only activation without recharging |
| Student notification | PASS | Payment and enrollment notifications asserted idempotently |
| Course access | PASS | Enrolled course opened in the existing Student Course UI |
| Refresh persistence | PASS | Receipt, history, status, and course loaded again from Django APIs |
| Failure flow | PASS | Failed payment creates no enrollment and allows a new attempt |
| Cancel flow | PASS | Cancelled payment creates no enrollment and allows a new attempt |
| Pending flow | PASS | Pending creates no enrollment; later verified success activates one |
| Amount tampering | PASS | Submitted amount ignored; course fee stored |
| Manual success URL/callback | PASS | Forged success callback rejected; no enrollment |
| Duplicate callback/execution | PASS | Repeated callback cannot complete; repeated execute keeps one enrollment and notifications |
| Existing agreement payment | PASS | Second admission skips account/code/PIN and uses the active agreement |
| Unauthorized payment access | PASS | Other student receives 404 for detail and status endpoints |

## Scope limits

Failure, cancellation, pending, refresh recovery, forged callback, authorization, amount tampering, duplicate execution, and agreement reuse are covered in the service/API test suite or mock developer controls. No real bKash PIN, OTP, account, sandbox payment, or live payment was used. Sandbox/live remains intentionally disabled until official merchant credentials and endpoint contracts are supplied.
