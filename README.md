# Samverse — Module 16 exam project

Samsung-style e-commerce storefront. MERN: React (Vite) + Express + MongoDB.

## Portals covered

| Portal | Where |
|---|---|
| Git workflow | `main` ← `week-1` ← feature branches, one PR per block |
| User side | signup with OTP, login, SSO, forgot password, profile, addresses |
| Admin side | admin login, user list, search, pagination, block/unblock |
| Project structure | `backend/src/{routes,controllers,services,models,middlewares,validators,utils}` |
| Go live | `docs/PORT-FORWARDING.md` |

## Stack

- Backend: Express 4, Mongoose 9, JWT (7d), bcryptjs, nodemailer, multer
- Frontend: React 19, Vite 8, Tailwind 4, axios, react-router 7
- Database: MongoDB 8.3 on `127.0.0.1:27017/samverse`

## Run it

```powershell
# 1. MongoDB must be running
Get-Service MongoDB

# 2. Backend  -> http://localhost:5000
cd backend
npm install
npm run dev

# 3. Frontend -> http://localhost:5173
cd frontend
npm install
npm run dev
```

Seed the admin account once:

```powershell
cd backend
node src/utils/seedAdmin.js
```

Admin demo login: `admin@samverse.in` / `Admin@1234`

Optional — 9 demo users so the admin table has a second page:

```powershell
node src/utils/seedDemoUsers.js
```

## Environment

`backend/.env` (gitignored):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/samverse
JWT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...          # Gmail app password
MAIL_FROM=Samverse <you@gmail.com>
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

Leaving `SMTP_HOST` empty makes the OTP print to the backend terminal instead of
sending mail, so the flow still works offline. Google/Facebook keys are optional;
without them the SSO buttons return `503 sign-in is not configured yet`.

`frontend/.env` (optional):

```
VITE_API_URL=http://localhost:5000
```

## API map

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/user/auth/register` | — | start signup, sends OTP |
| POST | `/user/auth/verifyotp` | — | create account, returns JWT |
| POST | `/user/auth/resendotp` | — | new signup code |
| POST | `/user/auth/login` | — | email + password |
| POST | `/user/auth/forgotpassword` | — | reset code |
| POST | `/user/auth/newpassword` | — | verify code + set password |
| GET | `/user/auth/google` `/facebook` | — | SSO start (302) |
| GET | `/user/auth/:provider/callback` | — | SSO return (302 + token) |
| GET | `/user/profile` | user | own profile |
| PUT | `/user/profile` | user | name + phone |
| POST | `/user/profile/avatar` | user | image upload (2MB) |
| PUT | `/user/change-password` | user | current + new password |
| POST | `/user/email-change` | user | code to the new address |
| POST | `/user/email-change/verify` | user | confirm new address |
| GET/POST | `/user/addresses` | user | list / add |
| PUT/DELETE | `/user/addresses/:id` | user | edit / remove |
| POST | `/admin/auth/login` | — | admin only |
| GET | `/admin/users` | admin | `search`, `page`, `limit`, `sort` |
| PATCH | `/admin/users/:id/block` | admin | block |
| PATCH | `/admin/users/:id/unblock` | admin | unblock |

## Screens

Storefront: `/` `/signin` `/signup` `/verify-otp` `/forgot-password`
`/reset-password` `/profile` `/auth/callback`
Admin: `/admin/login` `/admin/users`

## Notes

- OTP codes: 6 digits, 120s expiry, 5 attempts, one active code per email+purpose.
- Passwords: 8+ chars with upper case, lower case and a digit (server and client).
- Phone format: `+91` followed by 10 digits starting 6-9.
- Uploaded avatars land in `backend/uploads/avatars` and are served from `/uploads`.
- Design deviations from the Figma file are logged in
  `FromHub/Module 16/Learnings/Project-RAW/FIGMA-CHANGES.md`.
