# Roadmap & Next Steps

Priority items to reach production-ready:

1. Authentication & Security
   - Enforce password hashing & strong policies.
   - Implement refresh tokens, token revocation.
   - RBAC enforcement and auditing.

2. Facial Biometrics
   - Complete AWS Rekognition or on-prem face-api.js pipeline.
   - Enrollment flow (HR / Employee) with consent and liveness checks.
   - Store face embeddings instead of raw images if desired.

3. Fingerprint Fallback
   - Evaluate WebAuthn / platform authenticator as fallback for devices that support fingerprint.
   - Provide mobile native wrapper (optional) or PWA for better hardware access.

4. Maps & UI
   - Integrate Mapbox map for geofence editing (CEO).
   - Department & payroll visualization charts (Chart.js or Recharts).

5. Testing & Compliance
   - Add unit & integration tests.
   - Add audit logging for attendance actions.
   - Ensure NDPR/compliance for biometric data in Nigeria.

6. Deployment
   - Docker Compose or Kubernetes manifests.
   - CI/CD pipelines for frontend (Vercel) and backend (ECS / DigitalOcean).

If you'd like, I can:
- Push this repo to GitHub, create issues for each roadmap item and seed data for demo.
- Implement Rekognition integration end-to-end and a minimal admin UI for geofence editing and payroll report exports (CSV/PDF).