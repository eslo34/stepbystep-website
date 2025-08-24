# StepByStep Marketing Website

A modern, responsive marketing website for StepByStep - AI-powered tutorial video creation service.

## 🚀 Features

- **Clean, modern design** with StepByStep branding
- **Responsive layout** works perfectly on all devices
- **Lead magnet system** with popup modals
- **Password-protected admin dashboard** at `/admin`
- **EandoX portfolio showcase** with YouTube video embeds
- **4-step process explanation** with AI-powered workflow

## 🎨 Design

- **Font:** Satoshi (from Fontshare)
- **Colors:**
  - Primary: `#1D3557` (Deep Navy)
  - Accent: `#38B2AC` (Turquoise)
  - CTA: `#60A5FA` (Soft Blue)
  - Background: `#F7FAFC` (Light Gray)
  - Text: `#2D2D2D` (Charcoal)

## 📱 Sections

1. **Hero Section** - Main value proposition + CTA
2. **Problem → Solution** - Why you need tutorial videos
3. **EandoX Project Highlights** - Portfolio videos (YouTube embeds)
4. **How it works** - 4-step AI-powered process
5. **Lead Magnet** - Free custom video list + tutorial video
6. **Footer** - Simple links

## 🔐 Admin Dashboard

Access the admin dashboard at `/admin`:
- **Password:** `Lastpall12` 
- **Features:** Lead management, status tracking, analytics
- **Workflow:** Submitted → List Sent → Video Created → Completed

⚠️ **Security Note:** Current password is client-side only. For production, implement server-side authentication.

## 🎬 Video Setup

The portfolio videos are configured for YouTube embeds. Update the placeholders in `index.html`:

```html
<!-- Replace YOUR_YOUTUBE_ID_1, YOUR_YOUTUBE_ID_2, YOUR_YOUTUBE_ID_3 -->
<iframe src="https://www.youtube.com/embed/YOUR_YOUTUBE_ID_1">
```

## 🚀 Deployment

This site is designed for static hosting on Vercel:

1. Connect this GitHub repo to Vercel
2. Deploy automatically from main branch
3. Update YouTube video IDs when videos are uploaded
4. Configure custom domain

## 💻 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📧 Lead Management

Form submissions are currently stored in localStorage. For production:

1. Connect to a database (PostgreSQL, MongoDB, etc.)
2. Set up email notifications to hello@usestepbystep.com
3. Add auto-responder functionality
4. Implement proper server-side authentication

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Hosting:** Vercel (static)
- **Videos:** YouTube embeds
- **Admin:** Client-side auth with password `Lastpall12` (needs server-side for production)

---

Built for StepByStep - AI-powered tutorial video creation
