# Go live — VS Code port forwarding

Goal: open the app from a phone or another machine, and have OTP + SSO redirects
come back to the right place.

## 1. Start both servers

```powershell
cd backend  ; npm run dev     # 5000
cd frontend ; npm run dev     # 5173
```

MongoDB stays local. Only 5000 and 5173 need forwarding.

## 2. Forward the ports

1. Open the **Ports** panel in VS Code: `Ctrl+Shift+P` → `Ports: Focus on Ports View`
   (or the **Ports** tab next to Terminal).
2. Click **Forward a Port** twice and enter `5000`, then `5173`.
3. Set **Port Visibility → Public** for both (right-click the row → *Port Visibility*).
   Private is fine when the reviewer is signed into GitHub and you use the
   "Open in browser" link; Public is needed for a phone on mobile data.
4. Copy both `https://<random>-5000.app.github.dev` and
   `https://<random>-5173.app.github.dev` URLs.

## 3. Point the app at the forwarded URLs

`backend/.env`:

```
API_URL=https://<random>-5000.app.github.dev
FRONTEND_URL=https://<random>-5173.app.github.dev
```

`frontend/.env` (create it):

```
VITE_API_URL=https://<random>-5000.app.github.dev
```

Restart both dev servers after editing `.env` — Vite only reads `VITE_*` at boot.

## 4. OAuth redirect URIs

When the Google/Facebook apps exist, their authorised redirect URIs must match
`API_URL` exactly:

```
http://localhost:5000/user/auth/google/callback
https://<random>-5000.app.github.dev/user/auth/google/callback
http://localhost:5000/user/auth/facebook/callback
https://<random>-5000.app.github.dev/user/auth/facebook/callback
```

Both localhost and the forwarded host can be registered at the same time.

## 5. Check it

1. Open the forwarded **5173** URL on your phone.
2. Sign up with a real email, confirm the code arrives.
3. Sign in, open `/profile`, add an address.
4. Sign in at `/admin/login` and block/unblock that user.
5. If a request fails with CORS or `Network Error`, the `VITE_API_URL` value is
   wrong or the backend was not restarted.

## 6. CORS

`app.use(cors())` currently allows every origin, which is what makes the
forwarded host work. If you later lock it down, add the forwarded origin to the
allow list or the browser will block every call.
