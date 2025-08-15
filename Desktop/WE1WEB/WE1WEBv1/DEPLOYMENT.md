# WE1WEB Deployment Guide

## Production Deployment Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (via Supabase)
- Stripe account for payments
- Domain with SSL certificate
- PM2 for process management (optional)

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_KEY` - Supabase service key (backend only)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 2. Database Setup

Run Supabase migrations:

```bash
# Apply migrations to your Supabase project
npx supabase db push
```

Or manually run the SQL in:
- `supabase/migrations/001_create_payment_tables.sql`

### 3. Build Frontend

```bash
# Install dependencies
npm install

# Build production bundle
npm run build
```

### 4. Start Services

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
pm2 startup
```

#### Option B: Using npm scripts

```bash
# Start all services
npm run start:all
```

#### Option C: Separate processes

```bash
# Terminal 1: Main API server
npm run start

# Terminal 2: WebSocket signaling server
npm run start:signaling
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/we1web.com
server {
    listen 80;
    server_name we1web.com www.we1web.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name we1web.com www.we1web.com;

    ssl_certificate /etc/letsencrypt/live/we1web.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/we1web.com/privkey.pem;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket signaling server
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. Stripe Webhook Setup

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://we1web.com/api/payments/webhook/stripe`
3. Select events:
   - `account.updated`
   - `transfer.created`
   - `payout.paid`
4. Copy webhook signing secret to `.env`

### 7. SSL Certificate

Using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d we1web.com -d www.we1web.com
```

### 8. Monitoring

#### Health Checks
- Main API: `https://we1web.com/api/health`
- Signaling Server: `https://we1web.com:3001/health`

#### Logs
```bash
# PM2 logs
pm2 logs

# System logs
journalctl -u nginx -f
```

### 9. Testing Production

```bash
# Test WebSocket connection
node test/test-websocket.js

# Test payment system
curl https://we1web.com/api/payments/stats
```

## PM2 Ecosystem Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'we1web-api',
      script: './server/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'we1web-signaling',
      script: './server/signaling-server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        SIGNALING_PORT: 3001
      },
      error_file: './logs/signaling-error.log',
      out_file: './logs/signaling-out.log',
      log_file: './logs/signaling-combined.log',
      time: true
    }
  ]
};
```

## Docker Deployment (Alternative)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000 3001

CMD ["npm", "run", "start:all"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  we1web:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
```

## Security Checklist

- [ ] Environment variables secured
- [ ] SSL certificates installed
- [ ] Firewall configured (allow 80, 443, 3001)
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Database RLS policies active
- [ ] Stripe webhook secret configured
- [ ] Regular security updates scheduled

## Backup Strategy

1. **Database**: Supabase handles automatic backups
2. **Code**: Git repository with tags for releases
3. **Environment**: Backup `.env` file securely
4. **Logs**: Rotate and archive using logrotate

## Scaling Considerations

- Use Redis for session management when scaling horizontally
- Implement load balancing for multiple server instances
- Consider CDN for static assets
- Use dedicated TURN servers for production WebRTC

## Support

For deployment issues:
- Check logs: `pm2 logs`
- Test health endpoints
- Verify environment variables
- Check Supabase connection
- Verify Stripe webhook configuration