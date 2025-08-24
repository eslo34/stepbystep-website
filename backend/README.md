# StepByStep Backend API

Email automation backend for StepByStep website using Zoho Mail API.

## Features

- ✅ Lead magnet form submission handling
- ✅ Automated email responses via Zoho Mail API
- ✅ Professional email templates
- ✅ OAuth2 authentication with Zoho
- ✅ Vercel deployment ready

## Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
cd backend
vercel --prod
```

### 3. Set Environment Variables (in Vercel Dashboard)
- `ZOHO_CLIENT_ID`: 1000.2LAU69WJ6OICG08IM4DR75IOP55IHQ
- `ZOHO_CLIENT_SECRET`: 370809c49b56273b7624c3391a56cfe56645b35b79
- `ZOHO_REDIRECT_URI`: https://www.usestepbystep.com/auth/callback

### 4. Authorize Zoho Mail Access
1. Visit your deployed backend URL (e.g., `https://stepbystep-backend.vercel.app`)
2. Copy the authorization URL from the response
3. Visit that URL and grant permissions
4. Complete the OAuth flow

## API Endpoints

### `GET /`
Health check and authorization status

### `POST /api/submit-lead`
Submit lead magnet form data
```json
{
  "company": "Company Name",
  "email": "user@example.com",
  "docsUrl": "https://docs.company.com"
}
```

### `GET /auth/callback`
OAuth callback for Zoho authorization

### `POST /api/test-email`
Test email sending (for debugging)

## Development

### Local Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables (.env)
```
ZOHO_CLIENT_ID=1000.2LAU69WJ6OICG08IM4DR75IOP55IHQ
ZOHO_CLIENT_SECRET=370809c49b56273b7624c3391a56cfe56645b35b79
ZOHO_REDIRECT_URI=http://localhost:3001/auth/callback
PORT=3001
```

## Email Template

The automated welcome email includes:
- Welcome message with company name
- Next steps explanation
- Documentation URL reference
- Calendly booking link
- Professional branding

## Security Notes

- OAuth2 tokens are automatically refreshed
- Environment variables protect sensitive data
- CORS configured for your domain only
- Input validation on all endpoints

## Troubleshooting

### "Authorization required" error
- Visit the backend URL and complete OAuth flow
- Check environment variables are set correctly

### Emails not sending
- Verify Zoho Mail API is enabled for your account
- Check OAuth token hasn't expired
- Test with `/api/test-email` endpoint
