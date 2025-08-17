# 🚀 WE1WEB PRODUCTION DEPLOYMENT INSTRUCTIONS

## Critical Steps for Production Deployment

### 1. Environment Variables Setup in Vercel

You MUST configure these environment variables in Vercel Dashboard:

#### Required Variables:
```
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
VITE_API_URL=https://api.we1web.com
VITE_WS_URL=wss://ws.we1web.com
```

#### To Add Variables:
1. Go to https://vercel.com/we1web/we1web/settings/environment-variables
2. Add each variable with its production value
3. Select "Production" environment
4. Click "Save"

### 2. Supabase Configuration

#### Database Setup:
1. Create a new Supabase project at https://app.supabase.com
2. Run migrations from `/supabase/migrations/`
3. Enable Row Level Security (RLS) on all tables
4. Copy the project URL and anon key

#### Security:
- Never expose the service role key in client code
- Use environment variables for all keys
- Enable RLS policies for all tables

### 3. Stripe Configuration

1. Get your production keys from https://dashboard.stripe.com
2. Set up webhook endpoints for:
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `charge.succeeded`
3. Configure webhook secret in environment variables

### 4. Domain Configuration

#### DNS Settings:
Add these records to your domain:
```
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

#### SSL:
- Vercel automatically provisions SSL certificates
- Force HTTPS in Vercel settings

### 5. Deployment Command

After setting up environment variables:
```bash
vercel --prod
```

### 6. Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Verify payment processing
- [ ] Check WebSocket connections
- [ ] Test error tracking
- [ ] Verify SSL certificate
- [ ] Test mobile responsiveness
- [ ] Check performance metrics
- [ ] Set up monitoring alerts

### 7. Monitoring

#### Error Tracking:
- Errors are automatically logged to `/api/errors`
- Check Vercel Functions logs for server errors

#### Performance:
- Use Vercel Analytics for performance monitoring
- Set up alerts for high error rates

### 8. Backup & Recovery

- Enable daily database backups in Supabase
- Keep deployment rollback ready in Vercel
- Document all environment variables securely

## Security Notes

⚠️ **NEVER COMMIT THESE TO GIT:**
- API keys
- Database credentials
- JWT secrets
- Stripe keys

## Support

For deployment issues:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Documentation: https://docs.we1web.com

---

**Last Updated:** August 2024
**Version:** 1.0.0