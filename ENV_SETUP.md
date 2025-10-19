# 🔑 Environment Variables Setup

## Required API Keys

### Google Gemini API Key (FREE)

**Purpose**: AI-enhanced prerequisite parsing

**How to get it** (100% Free, no credit card required):

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

---

## 📦 Local Development Setup

### 1. Create `.env.local` file in project root:

```bash
# In /Users/woodyxiao/Documents/Project/course_scheduler/
touch .env.local
```

### 2. Add your API key to `.env.local`:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart your development server:

```bash
npm start
```

---

## 🚀 Netlify Production Setup

### 1. Go to Netlify Dashboard

Navigate to: **Your Site → Site settings → Environment variables**

### 2. Add Environment Variable

- **Key**: `GEMINI_API_KEY`
- **Value**: Your Gemini API key
- **Scopes**: Select "All scopes" or at least "Functions"

### 3. Redeploy

The changes will take effect on next deployment.

---

## ✅ Verify Setup

### Local Development

Run your app and check the console:

```
✅ Should see: "🤖 [AI] Complex prerequisite detected..."
❌ If you see errors: Check your .env.local file
```

### Production (Netlify)

After deploying, test a complex course (e.g., BUS 217W):

```
✅ Should see "🤖 Parsed with AI" in Additional Notes
❌ If not working: Check Netlify environment variables
```

---

## 🔒 Security Notes

- ✅ `.env.local` is gitignored (safe)
- ✅ API keys in Netlify are encrypted
- ✅ Gemini API key is FREE (no billing risk)
- ❌ Never commit API keys to git

---

## 💡 Troubleshooting

### "AI parsing unavailable"

**Cause**: API key not set or invalid

**Solution**:
1. Check `.env.local` exists and has correct key
2. Restart dev server (`npm start`)
3. For production, check Netlify environment variables

### "GEMINI_API_KEY not configured"

**Cause**: Environment variable not loaded

**Solution** (Local):
```bash
# Verify .env.local exists
ls -la .env.local

# Should contain:
cat .env.local
# GEMINI_API_KEY=AIza...
```

**Solution** (Netlify):
- Go to Site Settings → Environment variables
- Verify GEMINI_API_KEY is listed
- Trigger a new deploy

---

## 📊 Usage Limits (Free Tier)

**Gemini 1.5 Flash (Free)**:
- 15 requests per minute
- 1,500 requests per day
- 100% FREE forever

**Your expected usage**:
- ~10-20 AI requests per user session
- Well within free limits 🎉

---

## 🎯 Quick Start Checklist

- [ ] Get Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Create `.env.local` file in project root
- [ ] Add `GEMINI_API_KEY=your_key` to `.env.local`
- [ ] Restart dev server
- [ ] Test with a complex course (BUS 217W, ENGL 272)
- [ ] For production: Add GEMINI_API_KEY to Netlify
- [ ] Deploy and test on production

---

**Need help?** Check the console logs for detailed error messages!

