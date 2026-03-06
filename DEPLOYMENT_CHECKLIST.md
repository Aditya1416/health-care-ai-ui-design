# Healthcare AI Frontend - Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables (.env.local)
```bash
# Required for local development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_COLAB_API_URL=https://your-ngrok-url.ngrok-free.app
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Database Setup (Supabase)
- [ ] Create Supabase project
- [ ] Create tables (see INTEGRATION_GUIDE.md)
- [ ] Add sample reference images
- [ ] Enable Row Level Security
- [ ] Configure authentication providers
- [ ] Set up storage buckets for images

### 3. Colab Backend
- [ ] Deploy FastAPI server
- [ ] Setup ngrok tunnel: `!ngrok_token; from pyngrok import ngrok; url = ngrok.connect(8000)`
- [ ] Test endpoints are accessible
- [ ] Verify CORS is enabled
- [ ] Test `/predict` endpoint with sample X-ray
- [ ] Verify GradCAM heatmap format

## Local Testing

### Test Patient Analysis Flow
```bash
npm run dev
# 1. Navigate to http://localhost:3000/admin/patient-analysis
# 2. Wait for patients to load from Supabase
# 3. Select a patient
# 4. Verify 3-column X-ray comparison displays
# 5. Test chat tab with a question
# 6. Check predictions tab loads data
```

### Test Connection to Backend
```bash
# Visit http://localhost:3000/test-connection
# All tests should pass:
✓ Backend health
✓ Root endpoint
✓ API documentation
```

## Vercel Deployment

### 1. Connect Git Repository
```bash
git remote add origin https://github.com/yourusername/repo
git push -u origin main
# Or connect directly in Vercel dashboard
```

### 2. Set Environment Variables in Vercel
Navigate to: Project Settings → Environment Variables

Add all variables from .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_COLAB_API_URL
- NEXT_PUBLIC_API_URL

### 3. Deploy
```bash
vercel deploy
# Or enable auto-deployment on git push
```

### 4. Update Supabase RLS Policies
Ensure RLS allows read access for:
- predictions (for admin)
- reference_images (for public)
- patients (for auth users)
- heatmaps (for admin)

## Post-Deployment

### 1. Verify All Pages Load
- [ ] `/` - Landing page
- [ ] `/auth/login` - Login page
- [ ] `/auth/sign-up` - Signup page
- [ ] `/dashboard` - Patient dashboard
- [ ] `/admin/patient-analysis` - Main analysis page
- [ ] `/admin/predictions` - Predictions list
- [ ] `/admin` - Admin home

### 2. Test Core Features
- [ ] User signup works
- [ ] Email verification works
- [ ] Login redirects to dashboard
- [ ] Patient list loads from Supabase
- [ ] X-ray comparison displays correctly
- [ ] GradCAM heatmap shows
- [ ] Reference image loads
- [ ] Chat sends and receives messages
- [ ] Predictions load with confidence scores

### 3. Monitor Errors
- [ ] Check browser console for errors
- [ ] Review Vercel deployment logs
- [ ] Check Supabase database logs
- [ ] Monitor Colab backend logs
- [ ] Test ngrok connection stability

## Troubleshooting During Deployment

### Build Fails
- Check all imports are correct
- Verify no TypeScript errors: `npm run type-check`
- Clear .next folder: `rm -rf .next`

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check network access policies
- Ensure RLS policies allow your IP

### Backend Connection Issues
- Verify ngrok URL is active
- Check CORS headers in Colab backend
- Test with curl: `curl https://your-ngrok-url.ngrok-free.app/`

### Images Not Loading
- Verify storage bucket permissions
- Check image URLs in database
- Ensure CDN caching is disabled

## Production Considerations

### Security
- [ ] Enable HTTPS only (automatic with Vercel)
- [ ] Set strong authentication tokens
- [ ] Enable RLS on all tables
- [ ] Rate limit API endpoints
- [ ] Add environment-specific secrets

### Performance
- [ ] Enable image optimization
- [ ] Use database connection pooling
- [ ] Cache predictions with SWR
- [ ] Monitor Colab backend latency
- [ ] Optimize database queries

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Monitor API latency
- [ ] Track user sessions
- [ ] Monitor database performance
- [ ] Alert on backend downtime

## Quick Reference

### Main Features
1. **Patient Analysis** (`/admin/patient-analysis`)
   - 3-column X-ray comparison
   - GradCAM heatmap visualization
   - Confidence scores
   - Risk stratification

2. **Chat Interface**
   - AI-powered clinical questions
   - Context-aware responses
   - Works with patient data

3. **Predictions Dashboard** (`/admin/predictions`)
   - View all predictions
   - Filter by doctor, disease, confidence
   - Export reports

4. **Patient Management** (`/admin/patients`)
   - View all patients
   - Filter and search
   - View medical history

### Key Endpoints
- Frontend: Vercel URL (e.g., https://healthcare-ai.vercel.app)
- Backend: Colab ngrok URL (e.g., https://your-ngrok-url.ngrok-free.app)
- Database: Supabase (automatic)
- Chat API: `/api/chat`

## Support Contacts

- **Frontend Issues**: Check Vercel deployment logs
- **Database Issues**: Check Supabase dashboard
- **Backend Issues**: Check Colab kernel output and ngrok status
- **Integration Issues**: Review INTEGRATION_GUIDE.md

---

**Last Updated**: 2026-03-06
**Status**: Ready for Production Deployment
