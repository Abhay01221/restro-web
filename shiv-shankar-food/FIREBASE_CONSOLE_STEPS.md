# Firebase Console — Required Steps

The config is wired in. Do these two things in the Firebase Console and auth will work immediately.

## 1. Enable Authentication Providers

Go to: https://console.firebase.google.com/project/shiv-shankar-food/authentication/providers

### Email/Password
- Click **Email/Password**
- Toggle **Enable** → Save

### Google
- Click **Google**
- Toggle **Enable**
- Set **Project support email** (your Gmail address)
- Save

---

## 2. Add Authorized Domains

Go to: https://console.firebase.google.com/project/shiv-shankar-food/authentication/settings

Under **Authorized domains**, click **Add domain** and add:
- `localhost`

(It may already be there — verify it's listed.)

---

## 3. Create Firestore Database (for user profiles & orders)

Go to: https://console.firebase.google.com/project/shiv-shankar-food/firestore

- Click **Create database**
- Choose **Start in test mode** (for development)
- Select region: `asia-south1` (Mumbai — closest to Pune)
- Click **Done**

---

## That's it

Once those three steps are done, run:

```bash
cd shiv-shankar-food
npm run dev
```

Auth will work: signup, email verification, login, Google login, and session persistence on refresh.
