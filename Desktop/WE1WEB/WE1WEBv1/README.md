# 🧠 WE1WEB - The World's Largest Decentralized Living Neural Network

<div align="center">
  <img src="client/public/logo.png" alt="WE1WEB Logo" width="200"/>
  
  **Building humanity's AI brain through personal devices**
  
  [![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
  [![Status: Production](https://img.shields.io/badge/Status-Production-green.svg)]()
  [![Powered by: Humanity](https://img.shields.io/badge/Powered%20by-Humanity-blue.svg)]()
  
  [Website](https://we1web.vercel.app) • [Documentation](docs/) • [Contact](mailto:yassinedrani23@gmail.com)
</div>

---

## 🌍 Our Vision

WE1WEB is building the **world's largest decentralized living neural network** powered by personal devices for AI infrastructure, giving all control to humanity and coexisting with AI, solving the AI alignment threat by being its brain, leveraging existing hardware that is increasingly more powerful, saving billions of dollars in new energy-hungry data centers in a climate change era while giving an alternative for UBI in a community-driven way, not under the mercy of big tech, breaking its monopoly and democratizing access to AI.

## 🚀 Revolutionary Features

### 🧬 Living Neural Network
- **Distributed Intelligence**: Every device becomes a neuron in humanity's collective brain
- **Self-Organizing**: The network adapts and evolves based on usage patterns
- **Consensus Validation**: Multi-node verification ensures accuracy and trust
- **Real-time Learning**: The network continuously improves through collective intelligence

### 💰 Economic Empowerment
- **Universal Basic Income Alternative**: Earn by contributing computing power
- **Instant Payments**: Automated Stripe payouts for completed tasks
- **Fair Distribution**: Rewards based on contribution and reliability
- **No Middlemen**: Direct peer-to-peer value exchange

### 🔐 Security & Privacy
- **End-to-End Encryption**: All data channels are secured
- **Decentralized Control**: No single point of failure or control
- **User Sovereignty**: You own your data and computing resources
- **Transparent Operations**: Open metrics and network statistics

### 🌱 Environmental Impact
- **Zero New Hardware**: Utilizes existing devices
- **Energy Efficient**: Reduces need for massive data centers
- **Carbon Negative**: Prevents construction of new facilities
- **Sustainable Computing**: Maximizes hardware lifecycle

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

## 🏆 Recognition

This project represents a historic collaboration between:
- **Yassine Drani**: Visionary founder and architect
- **Claude AI**: Advanced AI assistant and co-creator

Together, we're building the future of decentralized AI infrastructure.

## 📜 Legal

© 2024 WE1WEB - All Rights Reserved

This software is proprietary and protected by copyright laws and pending patents.
See [LICENSE](LICENSE) for details.

## 🌟 The Future

WE1WEB is not just a platform; it's a movement towards:
- **AI-Human Symbiosis**: Creating harmony between artificial and human intelligence
- **Economic Justice**: Providing income opportunities for everyone with a device
- **Environmental Sustainability**: Reducing the carbon footprint of AI
- **Technological Democracy**: Breaking the monopoly of big tech companies

## 📞 Contact

- **Founder**: Yassine Drani
- **Email**: yassinedrani23@gmail.com
- **Website**: https://we1web.vercel.app
- **GitHub**: https://github.com/yassine-23/WE1WEB.COM

---

<div align="center">
  <strong>Join us in building humanity's decentralized AI brain</strong>
  <br>
  <em>Every device matters. Every person counts. Together, we are WE1WEB.</em>
</div>