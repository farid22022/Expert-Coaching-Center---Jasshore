# bKash admission payment integration

## Runtime modes

The backend selects one mode with `BKASH_MODE`: `mock`, `sandbox`, or `live`.

- `mock` is permitted only when `DEBUG=true` and `BKASH_MOCK_ENABLED=true`. It makes no outbound requests and generates identifiers prefixed with `MOCK_AGR_`, `MOCK_PAY_`, and `MOCK_TRX_`.
- `sandbox` and `live` fail closed until all merchant-issued credentials and endpoint mappings are configured. The current real provider intentionally does not guess private API contracts.
- Merchant credentials belong only in `backend/.env`. No bKash credential is exposed through Vite or returned by the API.

The complete environment template is in `backend/.env.example`. The development defaults are:

```text
BKASH_MOCK_ACCOUNT=01700000000
BKASH_MOCK_OTP=123456
BKASH_MOCK_PIN=12121
```

These are fake local values. They are returned as checkout hints only when both Django `DEBUG` and mock mode are active. Account, OTP, and PIN submissions are validated server-side and are never saved in an agreement, transaction, webhook event, or log.

## Agreement and payment lifecycle

1. Admin approval marks a paid application `approved` and `payment_required`; enrollment remains inactive.
2. Initiation accepts only `application_id`. Django locks the application and derives the `Decimal` amount, currency, course, applicant, and invoice server-side.
3. The service reuses an active agreement for the same organization, payer, and environment. A first payment creates a pending agreement.
4. Mock agreement steps move from account to verification code to PIN. Only the masked account and generated agreement ID persist.
5. An active agreement moves the transaction to `ready_for_payment`. Agreement success explicitly does not mean payment success.
6. Payment confirmation creates and executes the provider payment. The backend checks payment ID, amount, currency, merchant invoice, and agreement ID against trusted transaction data.
7. Only a verified `completed` result may atomically mark the application paid, create or activate its one enrollment, and send payment and enrollment notifications.
8. Repeated initiation and execution reuse terminal or active records and cannot create duplicate enrollments.

If downstream enrollment activation fails after provider verification, the payment remains `completed` with `enrollment_activation_status=failed`. Admins can see the safe failure text. A later backend status/execute call retries only the idempotent enrollment service and reuses the same provider payment and transaction IDs, so the student is never charged again.

Free admissions keep the existing direct approval and enrollment path.

## API surface

- `POST /api/v1/payments/bkash/initiate/`
- `POST /api/v1/payments/bkash/agreement/start/`
- `POST /api/v1/payments/bkash/agreement/account/`
- `POST /api/v1/payments/bkash/agreement/otp/`
- `POST /api/v1/payments/bkash/agreement/pin/`
- `POST /api/v1/payments/bkash/execute/`
- `POST /api/v1/payments/<public-id>/status/`
- `POST /api/v1/payments/<public-id>/cancel/`
- `POST /api/v1/payments/agreements/<agreement-public-id>/disconnect/`
- `GET /api/v1/payments/admissions/<application-id>/`
- `GET /api/v1/payments/me/`
- `GET /api/v1/payments/<public-id>/`
- `GET /api/v1/payments/admin/`

Student endpoints enforce record ownership. The admin endpoint allows platform staff and organization administrators and scopes non-superusers to their organization. There is deliberately no manual “mark paid” operation. Callback query parameters and browser URLs are never proof of payment.

## Production rollout

1. Obtain the current merchant-specific Checkout, tokenized agreement, execute, query, cancellation, refund, and webhook specifications from bKash onboarding.
2. Implement the official hosted agreement and checkout request mapper in `apps.payments.providers.RealBkashProvider`.
3. Validate the official webhook signature or authentication method before enabling webhook completion.
4. Configure protected sandbox credentials, run the full success/failure/cancel/pending matrix, and reconcile provider results with local records.
5. Set `BKASH_MODE=live` only with `DEBUG=false`, production secrets, HTTPS return URLs, and monitoring that excludes credentials, PINs, OTPs, and access tokens.

No sandbox or live payment is claimed by this implementation because merchant-issued credentials and endpoint mappings were not supplied. Public product context is available from [bKash Online Business](https://www.bkash.com/en/business/online-business) and [bKash business solutions](https://www.bkash.com/en/business).
