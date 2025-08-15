# WE1WEB - Europe's Democratic Supercomputer

## 🌍 Mission
Transforming 83 million German smartphones into humanity's insurance policy against AI monopolization, while creating the world's first truly democratic supercomputer. Europe is leading the world's most important technological revolution.

## Overview
WE1WEB is a revolutionary platform that transforms idle personal devices into a massive distributed computing network, enabling users to earn €50-100/month while contributing to breaking Big Tech's AI monopoly.

## Features
- 🔐 User authentication with Supabase
- 💰 Dashboard for tracking earnings
- 👥 Community pools for collaborative computing
- 📱 Mobile app download links (Coming Soon)
- 🌐 Real-time network statistics

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Express.js (minimal server)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd WE1WEBreplitv
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 4. Run development server
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Deployment Options

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Render
1. Create a new Web Service
2. Connect GitHub repository
3. Add environment variables
4. Deploy with `npm start`

### Option 3: Railway
1. Create new project
2. Deploy from GitHub
3. Add environment variables
4. Railway handles the rest

### Option 4: Netlify + Supabase Functions
1. Deploy frontend to Netlify
2. Use Netlify Functions for server endpoints
3. Configure environment variables

## Production Build
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user/profile` - Get user profile (protected)
- `GET /api/downloads` - Get app download links
- `POST /api/notify/:platform` - Join app waitlist

## Mobile Apps
Mobile applications for iOS and Android are currently in development. Users can join the waitlist through the web app to be notified when they're available.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service key (server-side) | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Support
For issues or questions, please open an issue on GitHub.

## License
Proprietary - All Rights Reserved