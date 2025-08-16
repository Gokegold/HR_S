# API Documentation — HR Attendance (Summary)

Base URL: / (backend: http://localhost:4000)

Auth
- POST /auth/login
  - body: { email, password }
  - returns: { token, user }

- POST /auth/seed-admin (dev only)
  - body: { email, password, fullName }

Employees
- POST /employees/ (HR, CEO)
  - create new employee
- GET /employees/ (HR, CEO, HOD)
  - list users
- GET /employees/:id (roles as above)

Geofence
- POST /geofence/ (CEO)
  - { name, centerLat, centerLng, radiusMeters }
- GET /geofence/ (CEO, HR, HOD)
- PUT /geofence/:id (CEO)

Attendance
- POST /attendance/ (Authenticated)
  - { type, latitude, longitude, photoBase64 }
  - Enforces geofence, stores photo (S3), compares face
- GET /attendance/me (Authenticated)
  - My logs

Payroll
- POST /payroll/generate (HR, CEO)
  - { month, year }
- GET /payroll/ (HR, CEO, HOD)

Notes:
- All authenticated endpoints require Authorization: Bearer <token>
- Photo payloads should be base64-encoded images (camera capture)
- Geofence enforcement is done server-side; client-side check is supplementary
