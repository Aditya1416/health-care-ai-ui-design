# Debugging Prediction Fetch Issues

## Issue: "Error: Failed to fetch prediction"

### Quick Checklist
- [ ] `.env.local` file exists with all 3 Supabase keys
- [ ] Supabase project is active and accessible
- [ ] Database tables exist: `predictions`, `patients`, `doctors`, `users`
- [ ] Test data has been seeded

### Steps to Debug

#### 1. Verify Environment Variables
\`\`\`bash
# In VS Code terminal, check if env vars are loaded
echo $NEXT_PUBLIC_SUPABASE_URL

# If empty, restart dev server after creating .env.local
npm run dev
\`\`\`

#### 2. Check Database Tables
Visit your Supabase dashboard:
1. Click "SQL Editor"
2. Run this query:
\`\`\`sql
SELECT COUNT(*) as count FROM predictions;
SELECT COUNT(*) as count FROM patients;
SELECT COUNT(*) as count FROM doctors;
SELECT COUNT(*) as count FROM users;
\`\`\`

If all show 0, run seed data:
- Go to http://localhost:3000/api/admin/seed-data
- Check if data is created in Supabase dashboard

#### 3. Enable Verbose Logging
Edit `app/api/admin/predictions/[id]/route.ts`:
- Look for `console.log("[v0]"...)` statements
- These show exactly what's happening
- Check VS Code terminal output

#### 4. Test API Directly
\`\`\`bash
# Seed test data first
curl -X POST http://localhost:3000/api/admin/seed-data

# Get list of predictions
curl http://localhost:3000/api/admin/predictions

# Get specific prediction ID (replace with ID from list)
curl http://localhost:3000/api/admin/predictions/{prediction_id}
\`\`\`

#### 5. Browser Console Errors
In your browser (F12 → Console):
- Check for CORS errors (shouldn't happen, it's same domain)
- Check for 401/403 authentication errors
- Check for 404 "Prediction not found" errors

### Solution Flow

**If you see "Prediction not found":**
→ The prediction exists in database but isn't being retrieved
→ Check if prediction ID matches exactly
→ Seed more data: http://localhost:3000/api/admin/seed-data

**If you see "Admin access required":**
→ Your user isn't marked as admin
→ Go to Supabase dashboard → user_profiles table
→ Set `is_admin = true` for your user

**If you see "Unauthorized":**
→ You're not logged in
→ Go to http://localhost:3000/auth/login or /auth/sign-up
→ Create account and login first

**If you see network error:**
→ Supabase URL/key is wrong
→ Check .env.local file
→ Restart dev server (npm run dev)
→ Verify keys in Supabase dashboard

### Checking Server Logs

In your VS Code terminal running `npm run dev`, you'll see:

\`\`\`
[v0] Fetching prediction: {
  id: '93cb07ee-e54c...',
  disease: 'Asthma',
  patientId: 'abc123',
  doctorId: 'def456'
}

[v0] Patient data loaded: {
  name: 'John Doe',
  aqi: 150,
  pm25: 45.2,
  ...
}

[v0] Reference images found: 5 {
  disease: 'Asthma',
  images: [...]
}
\`\`\`

If you don't see these logs:
1. Check if you're looking at the right terminal
2. Check if the prediction ID is correct
3. Check if API is being called (network tab in browser DevTools)

### Final Check

Open browser DevTools → Network tab:
1. Navigate to http://localhost:3000/admin/predictions/[prediction-id]
2. You should see API call to `/api/admin/predictions/[id]`
3. Response should be 200 with prediction data
4. If 404: Prediction doesn't exist, seed more data
5. If 500: Check server terminal for error message
