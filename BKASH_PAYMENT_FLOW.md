# bKash admission payment flow

```mermaid
flowchart TD
    A[Admin approves paid admission] --> B[Application: payment required]
    B --> C[Student selects Pay Now]
    C --> D{Active agreement exists?}
    D -- No --> E[Create agreement]
    E --> F[Mock account validation]
    F --> G[Mock verification code]
    G --> H[Mock PIN]
    H --> I[Agreement active]
    D -- Yes --> I
    I --> J[Student confirms trusted server amount]
    J --> K[Provider creates and executes payment]
    K --> L{Backend verification}
    L -- Pending --> M[Keep enrollment inactive]
    L -- Failed or cancelled --> N[Show retry-safe result]
    L -- ID/amount/currency/invoice mismatch --> O[Fail closed]
    L -- Verified complete --> P[Mark application paid]
    P --> Q[Activate one enrollment atomically]
    Q --> R[Create notifications and receipt]
    R --> S[Course available in My Courses]
```

The browser never decides that a payment succeeded. Every success UI reads a completed transaction produced by the backend verifier. The mock account, verification code, and PIN exist only for local development; sandbox and live must use bKash-hosted credential entry.

## Returning payment

```mermaid
flowchart LR
    A[Payment required] --> B[Find active agreement]
    B --> C[Show masked wallet and trusted amount]
    C --> D[Confirm payment]
    D --> E[Provider authorization]
    E --> F[Backend execute and query]
    F --> G[Verified payment]
    G --> H[Enrollment or paid item activated]
```

## Failure and retry

```mermaid
flowchart TD
    A[Provider result] --> B{State}
    B -- Failed --> C[Payment failed]
    B -- Cancelled --> D[Payment cancelled]
    B -- Pending --> E[Payment pending]
    C --> F[Enrollment remains inactive]
    D --> F
    E --> F
    C --> G[Create a new retry-safe attempt]
    D --> G
    E --> H[Check status through backend]
    H --> A
```

## Callback and webhook boundary

```mermaid
sequenceDiagram
    participant Gateway as bKash Gateway
    participant API as Django Payment API
    participant Provider as BkashProvider
    participant DB as Payment Database
    participant Enrollment as Enrollment Service
    Gateway->>API: Callback or authenticated webhook event
    API->>Provider: Execute/query using stored provider payment ID
    Provider-->>API: Provider result
    API->>API: Verify amount, currency, invoice, payment and agreement IDs
    alt verified completed
        API->>DB: Save COMPLETED atomically
        API->>Enrollment: Activate idempotently
    else pending or invalid
        API->>DB: Preserve non-completed state
    end
```
