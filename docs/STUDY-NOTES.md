# Samverse — study notes for the M16 review

Everything below is what the code actually does. If you can explain the bold
sentence of each section, you can answer the follow-ups.

---

## 1. The 60-second pitch

**Samverse is a Samsung-style storefront split into a React SPA and an Express
JSON API, with a layered backend and a separate admin console.**

- Frontend: React 19 + Vite + Tailwind, talks to the API over axios with a JWT
  in the `Authorization: Bearer` header.
- Backend: Express 4. Every feature is one vertical slice:
  `route → middleware → validator → controller → service → model`.
- Database: MongoDB via Mongoose. Users, addresses and OTPs are separate
  collections.
- Two audiences: shoppers (`/`) and staff (`/admin`). The same JWT mechanism
  guards both, but admin routes additionally require `role === "admin"`.

Why layered: a controller only reads `req` and writes `res`; a service holds the
rules and throws `Error` objects with a `status`; a model only describes data.
That is what makes the same `authService.login` usable by both the shopper login
and the admin login.

---

## 2. One request, end to end (use this when asked "walk me through")

`POST /user/auth/register`:

1. `app.js` mounts `authRoutes` at `/user/auth`.
2. `authRoutes.js` runs `validate(validateRegister)` first.
3. `validateMiddleware` calls the validator, which returns an **object keyed by
   field**. Non-empty → `400 { success:false, message:"Validation failed", errors }`.
4. `authController.register` pulls `name, email, phone, password` off `req.body`
   and calls `authService.requestSignup`.
5. The service rejects a duplicate email with `409`, hashes the password with
   bcrypt (cost 10), and hands `{ name, email, phone, passwordHash }` to
   `otpService.issue` as the **payload**.
6. `otpService` generates a 6-digit code with `crypto.randomInt`, upserts one
   `Otp` document for `email + purpose`, sets `expiresAt = now + 120s`, and calls
   the mailer.
7. The mailer sends through nodemailer over Gmail SMTP, or prints
   `[mail:dev] OTP ...` when `SMTP_HOST` is empty.
8. Response: `201 { success:true, message:"OTP sent to your email", data:{ email, expiresIn:120 } }`.
   **No token yet — the account does not exist yet.**

That last point is the one reviewers probe: registration is not "create user",
it is "reserve a pending signup". The user row is only written after the code is
proven.

---

## 3. File map

| Concern | File |
|---|---|
| App wiring, static `/uploads` | `backend/src/app.js` |
| Mongo + listen | `backend/src/server.js` |
| Auth routes | `backend/src/routes/authRoutes.js` |
| Auth rules | `backend/src/services/authService.js` |
| OTP issue / resend / verify | `backend/src/services/otpService.js` |
| Mail transport | `backend/src/utils/mailer.js` |
| SSO | `backend/src/services/oauthService.js`, `controllers/oauthController.js` |
| Profile / addresses | `backend/src/services/userService.js`, `controllers/userController.js` |
| Admin list / block | `backend/src/services/adminService.js`, `controllers/adminController.js` |
| Guards | `middlewares/authMiddleware.js`, `adminMiddleware.js` |
| Validation | `validators/authValidator.js`, `validators/userValidator.js` |
| Avatar upload | `middlewares/uploadMiddleware.js` (multer, 2MB, jpg/png/webp) |
| Storefront shell | `frontend/src/App.jsx` → `Storefront` |
| Admin shell | `frontend/src/App.jsx` → `Admin`, `components/admin/AdminShell.jsx` |
| Token storage | `frontend/src/api/auth.js` (user), `api/admin.js` (admin) |
| API client | `frontend/src/api/axios.js` |

---

## 4. Flows you will be asked to demo

### 4.1 Signup with OTP

`/signup` → `POST /user/auth/register` → `/verify-otp` → `POST /user/auth/verifyotp`
→ token stored → `/`.

- `verifySignup` calls `otpService.verify`, which checks in this order:
  **exists → expired → too many attempts → wrong code → correct**.
- Wrong code increments `attempts` and returns `400 Invalid code. N attempts left.`
- Correct code **deletes the OTP document**, then creates the user with
  `emailVerified: true`, then returns `{ token, user }`.
- `resendotp` re-issues keeping the same payload, so a user who waits too long
  does not have to retype their details.
- Limits: 120s TTL, 5 attempts, one document per `email + purpose` (unique index).

Why store the payload in the OTP document: the password is already hashed before
the code is sent, so the plain password never touches the database or the mail.

### 4.2 Login

`POST /user/auth/login` → `authService.login`.

- Missing user and wrong password return the **same** `401 Invalid email or
  password` so the response cannot be used to discover registered emails.
- Blocked account → `403 Account blocked. Contact support.`
- Success → `{ token, user:{ id, name, email, role } }`.
- JWT payload is `{ id, role }`, signed with `JWT_SECRET`, expires in **7 days**.

### 4.3 Forgot password

`/forgot-password` → `POST /user/auth/forgotpassword` (issues `purpose:"reset"`)
→ `/reset-password` → `POST /user/auth/newpassword`.

- Unknown email → `404 No account with this email` (a deliberate, documented
  simplification for a single-vendor demo).
- The reset step verifies the code, then re-hashes and saves the new password.
- Reusing the same code → `400 No active code. Request a new one.`
- The old password stops working immediately; the new one returns a fresh token.

### 4.4 Profile

- `GET /user/profile` returns `{ id, name, email, phone, role, avatar, provider,
  emailVerified, createdAt }` — never `passwordHash`.
- Display and edit are the same page with an `editing` flag; nothing reloads.
- Avatar: `POST /user/profile/avatar` with `multipart/form-data`, multer writes to
  `uploads/avatars`, the file is served by `express.static("/uploads")`, and the
  previous file is deleted after a successful save.
- Change password: current password must match, and SSO accounts are refused
  (`Your account signs in with google`).
- Change email: `POST /user/email-change` issues `purpose:"email-change"` whose
  payload holds `userId`; `POST /user/email-change/verify` checks the code, then
  checks the code belongs to **this** user, then checks the address is free.

### 4.5 Addresses

`GET/POST /user/addresses`, `PUT/DELETE /user/addresses/:id`.

- Every query is scoped by `userId`, so one user can never touch another's row.
- Exactly one default: creating the first address forces `isDefault`, setting a
  new default unsets the rest, and deleting the default promotes the newest
  remaining address.
- Delete is a two-step confirm in the UI (`Delete` → `Confirm delete` / `Keep`).

### 4.6 SSO (Google, Facebook)

`GET /user/auth/google` → 302 to Google → `GET /user/auth/google/callback`.

- A random `state` is stored in an **httpOnly SameSite=Lax cookie** and compared
  on return. Mismatch → redirect to `/auth/callback?error=Sign-in expired`.
- The code is exchanged for an access token, the profile is fetched, then:
  match by `provider + providerId` → else match by email (link the provider) →
  else create the user with a random password hash and `emailVerified: true`.
- The API redirects to the SPA with `?token=`; `/auth/callback` stores it, loads
  the profile and goes home.
- No keys configured → `503 google sign-in is not configured yet`.

### 4.7 Admin

- `POST /admin/auth/login` reuses `authService.login`, then rejects non-admins
  with `403 Admin access only`.
- `GET /admin/users?search=&page=&limit=` — search is **server side** with a
  regex escaped by `escapeRx`, so `.*` or `(` cannot crash or widen the query.
- Default sort is `createdAt: -1` (latest first). `page`/`limit` become
  `skip`/`limit`; the response carries `pagination:{ page, limit, total, totalPages }`.
- `PATCH /admin/users/:id/block|unblock` flips `isBlocked`.
- The frontend debounces typing by 350ms, resets to page 1 on a new search,
  offers a clear (✕) button, and confirms block/unblock in a dialog.

---

## 5. Security answers (short, and true)

| Question | Answer |
|---|---|
| Why bcrypt, not SHA? | bcrypt is deliberately slow and salted per hash; SHA is fast and unsalted. Cost 10 here. |
| Where is the token stored? | `localStorage`, sent as `Bearer`. Trade-off: readable by JS, so it is XSS-sensitive. Cookies + CSRF token would be the hardening step. |
| Why is the password check inside `protect`? | A blocked user must lose access **immediately**, even with a token still valid for 7 days. So `protect` re-reads the user and returns 403 if `isBlocked`. |
| Why does `adminOnly` exist separately? | Authentication ≠ authorisation. `protect` says who you are; `adminOnly` says you may touch `/admin`. |
| Can an OTP be brute forced? | 6 digits, 5 attempts, then the document is dead and a new code must be requested. 120s TTL. |
| What stops another user reading my address? | Every address query includes `userId: req.user.id`. There is no "get by id alone" endpoint. |
| SSO CSRF? | The `state` cookie. Without it an attacker could feed their own code into your callback. |
| Anything not handled? | No rate limit per IP on `resendotp`/`forgotpassword`; a determined sender could spam a mailbox. Documented as a known gap. |

---

## 6. Demo script (10 minutes)

1. `/signup` — type a bad phone, show inline errors; fix it; submit.
2. Open Gmail, read the code, type it in `/verify-otp`; show the countdown;
   let it expire once and use **Resend code**.
3. Land on `/` with your name in the header.
4. `/profile` — change the photo, edit the name, add an address, set it default,
   delete it and cancel the confirm.
5. Change password, then sign out and sign in with the new one.
6. `/forgot-password` — full reset.
7. Sign in with Google (if keys exist) to show SSO; otherwise explain the flow
   and show `503 sign-in is not configured yet`.
8. `/admin/login` → user list → search `rahul` → clear → page 2 → block → confirm
   → unblock.
9. Back on the storefront, try to sign in as the blocked user: `403 Account blocked`.
10. Open VS Code Ports, show the public URLs, load the app on your phone.

---

## 7. Questions a reviewer is likely to ask

1. **Why does register not return a token?** The account does not exist until the
   email is proven; the token is issued by `verifyotp`.
2. **Where is the OTP stored, and why there?** A separate `otps` collection keyed
   by `email + purpose`, so a signup, a reset and an email change never collide.
3. **What happens if two tabs request a code?** The unique index means the second
   upsert overwrites the first; only the newest code works.
4. **Why a service layer?** `authService.login` serves both shopper and admin
   login; the rule lives in one place.
5. **How does search stay safe?** `escapeRx` escapes regex metacharacters before
   building `new RegExp`.
6. **How is pagination done?** `skip((page-1)*limit).limit(limit)` plus
   `countDocuments` for `totalPages` — server side, so the browser never holds
   the whole table.
7. **What happens when you block someone mid-session?** Their next request hits
   `protect`, which sees `isBlocked` and returns 403.
8. **Why is the admin console a separate shell?** Different navigation and no
   storefront chrome; `/admin/*` is routed before the storefront branch.
9. **What did you change from the Figma?** Point at `FIGMA-CHANGES.md` sections
   E1, E9 and E10: cart icon, wider search, Facebook button, gradient hero,
   invented mobile layout, screens Figma never had, and the profile blocks that
   M16 scope excludes.
10. **What is not finished?** Real OAuth keys (code is ready, apps unregistered),
    no IP rate limit, addresses are not wired into checkout because orders are
    out of scope.

---

## 8. Numbers worth remembering

| Thing | Value |
|---|---|
| OTP length / TTL / attempts | 6 digits / 120s / 5 |
| JWT lifetime | 7 days |
| bcrypt cost | 10 |
| Password rule | 8+ chars, upper, lower, digit |
| Phone rule | `+91` then 10 digits starting 6-9 |
| PIN rule | 6 digits |
| Avatar limit | 2MB, jpg/png/webp |
| Admin page size | 8 rows |
| Search debounce | 350ms |
| Brand blue / footer | `#1a44d6` / `#15171c` |
