```markdown
# Setup & Deployment

Prereqs:
- Docker & Docker Compose
- Node 18+ (for local npm scripts)
- AWS account (S3 + Rekognition) OR change facial pipeline to face-api.js

1) Copy env files:
- cp backend/.env.example backend/.env
- Set S3_BUCKET, AWS credentials, MAPBOX_TOKEN

2) Start services:
- docker-compose up --build
- This will start Postgres, backend (on :4000), frontend (on :5173)

3) Initialize DB & seed:
- docker exec -it <backend_container> npm run prisma:generate
- docker exec -it <backend_container> npm run prisma:migrate
- docker exec -it <backend_container> npm run seed

4) Log in with seeded accounts:
- ceo@example.com / password
- hr@example.com / password
- hod@example.com / password
- employee@example.com / password

Security & Privacy:
- S3 bucket must be private. Use server-side encryption.
- Biometric images are stored in S3; consider storing face embeddings instead of raw images for lower privacy risk.
- Add explicit enrollment consent flow on the frontend.
- Configure strict IAM policy for Rekognition and S3.

Production tips:
- Use managed Postgres (RDS, DigitalOcean Managed DB).
- Use HTTPS (load balancer).
- Rotate JWT_SECRET; use a secure KMS for secrets.
- Enable auditing and retention policy for logs & biometrics.
```