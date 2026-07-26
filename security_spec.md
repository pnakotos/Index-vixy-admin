# Firebase Security Specification

## Data Invariants
1. A driver document must have a valid string ID, non-empty name, email, and phone.
2. A client document must have a valid string ID, non-empty name, email, and phone.
3. A payment record must contain a valid entity ID, payment type, reference number, and amount.
4. An emergency alert must specify emergency type, reporter type, reporter ID, and status.
5. All operations require authenticated access (`request.auth != null`).

## Security Test Payloads
- Unauthenticated read/write requests (Denied)
- Invalid ID injected payloads (Denied)
- Malformed payloads violating schema types or size limits (Denied)
