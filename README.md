```markdown
# HR Attendance Management — Perfume Retail (Nigeria)

A production-ready HR Attendance Management web application (mobile-first) with:
- Roles: CEO, HR, HOD, Employee
- Attendance: Clock in/out, start/end break with GPS + selfie + face verification (AWS Rekognition) and WebAuthn fingerprint fallback
- Geofence: CEO-managed Mapbox editor, server-side enforcement
- Payroll: Monthly generation, penalty deductions, CSV export
- Tech: React + Tailwind + ShadCN UI, Node.js + TypeScript + Express, Prisma + PostgreSQL, AWS S3 + Rekognition
- Deployment: Docker Compose for local dev, GitHub Actions CI workflow included

Quick local (Docker) run:
1. Copy .env.example to .env and set values (DATABASE_URL, AWS credentials, S3 bucket, MAPBOX_TOKEN).
2. docker-compose up --build
3. Backend: http://localhost:4000, Frontend: http://localhost:5173

Git (create & push):
- git init
- git add .
- git commit -m "Initial commit — HR Attendance"
- Create GitHub repo and push: git remote add origin git@github.com:<you>/<repo>.git; git push -u origin main

See docs/setup.md for detailed steps, env variables and production guidance.
```