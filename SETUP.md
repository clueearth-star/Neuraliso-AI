# Setting this up

## 1. Drop these files into your repo
Copy the `api/` folder (and the new `vercel.json`) into the root of your
GitHub repo, replacing your old `vercel.json` and `server.ts`. You can
delete `server.ts` — it's fully replaced by the files in `api/`.

## 2. Install the types package (dev dependency only)
```
npm install --save-dev @vercel/node
```

## 3. Set environment variables in Vercel
Go to your Vercel project → Settings → Environment Variables, and add:

- `MASTER_ENCRYPTION_KEY` — required to decrypt the embedded secrets
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` — for review emails
- `REVIEWS_NOTIFICATION_EMAIL` — who receives review notifications
- `ELEVENLABS_API_KEY` — for text-to-speech
- `NVIDIA_API_KEY` / `GEMINI_API_KEY` — optional, override the encrypted fallback keys

## 4. Rotate the leaked OpenRouter key
Your old `server.ts` had a plaintext OpenRouter key hardcoded as a fallback,
and your GitHub repo is public. That key is compromised — revoke/rotate it
in your OpenRouter dashboard now. The new code no longer has any hardcoded
fallback key; it throws a clear error instead if no key is configured.

## 5. Commit and push
Vercel will auto-redeploy. Your routes will now live at:
- POST /api/chat
- POST /api/tts
- GET  /api/insights
- POST /api/premium-blueprint
- GET/POST /api/reviews
- POST /api/reviews/notify
