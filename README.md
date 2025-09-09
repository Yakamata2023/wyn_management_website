# WYN Management Website

Elite talent management website for WYN Management, featuring dynamic player statistics and modern web design.

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── gemini-refresh.js   # Gemini AI stats extraction
│   ├── stats-cache.js      # KV-backed stats caching
│   └── refresh-stats.js    # Scheduled stats refresh
├── assets/                 # Static assets
│   └── images/            # Player photos and logos
├── pages/                 # Individual pages
│   ├── jacob.html         # Jacob Njoku profile
│   ├── oscar.html         # Oscar Onyeka profile
│   └── contact.html       # Contact page
├── docs/                  # Documentation
│   └── WYN_Talent_Management_Website.txt
├── index.html             # Homepage
└── vercel.json           # Vercel deployment config
```

## Features

- **Dynamic Player Statistics**: Auto-updating stats via Gemini AI and Transfermarkt
- **KV Caching**: Fast loading with Vercel KV (Upstash Redis)
- **Scheduled Updates**: Hourly cron job for fresh data
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design with smooth animations

## Environment Variables

Set these in your Vercel project:

- `GEMINI_API_KEY`: Google Gemini API key for stats extraction
- `KV_REST_API_URL`: Upstash Redis REST URL (optional)
- `KV_REST_API_TOKEN`: Upstash Redis REST token (optional)
- `OSCAR_SOURCES`: Comma-separated URLs for Oscar's official stats (optional)

## Deployment

Deployed on Vercel with automatic builds from GitHub pushes.

Live site: https://wynmanagementwebsite.vercel.app/

## API Endpoints

- `/api/gemini-refresh?player=jacob|oscar` - Live stats extraction
- `/api/stats-cache?player=jacob|oscar` - Cached stats (KV fallback to live)
- `/api/refresh-stats` - Manual refresh trigger (also runs hourly via cron)

## Development

1. Clone the repository
2. Set up environment variables
3. Deploy to Vercel or run locally with Vercel CLI

## Contact

For inquiries about the talents or technical support, visit the contact page.
