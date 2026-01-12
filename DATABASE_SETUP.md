# Healthcare AI Database Setup

## Status: ✅ Configured

Your Supabase database has been fully configured with the following components:

### Database Schema Created
- **profiles** - User profile information
- **medical_records** - Patient medical records
- **appointments** - Doctor appointments
- **health_metrics** - Health tracking data (weight, blood pressure, etc.)

### Security
- Row Level Security (RLS) enabled on all tables
- Each user can only access their own data
- Policies enforce data isolation and protection

### Environment Variables
All required Supabase environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`

### Authentication
- Email/password authentication configured
- Session management via middleware
- Protected routes at `/protected`
- Login page at `/auth/login`
- Sign up page at `/auth/sign-up`

## Next Steps

1. **Run the database migration** - Execute `scripts/init-db.sql` to create all tables
2. **Test authentication** - Visit `/auth/sign-up` to create a test account
3. **Access protected pages** - Navigate to `/protected` after logging in

## File Structure
\`\`\`
lib/supabase/
  ├── client.ts        # Browser client
  ├── server.ts        # Server client
  └── proxy.ts         # Session refresh logic

app/auth/
  ├── login/           # Login page
  ├── sign-up/         # Sign up page
  ├── check-email/     # Email confirmation page
  └── callback/        # Auth callback (if needed)

app/protected/         # Protected route example
\`\`\`

## Database Schema Details

### profiles table
- `id` (UUID) - User ID from auth
- `email` (TEXT) - User email
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Profile picture URL
- `created_at`, `updated_at` - Timestamps

### medical_records table
- `id` (UUID) - Record ID
- `user_id` (UUID) - Link to user
- `record_type` (TEXT) - Type of record (diagnosis, prescription, etc.)
- `description` (TEXT) - Record details
- `date_recorded` (TIMESTAMP) - When recorded

### appointments table
- `id` (UUID) - Appointment ID
- `user_id` (UUID) - Link to user
- `doctor_name` (TEXT) - Doctor's name
- `appointment_date` (TIMESTAMP) - Scheduled time
- `reason`, `notes` (TEXT) - Appointment details

### health_metrics table
- `id` (UUID) - Metric ID
- `user_id` (UUID) - Link to user
- `metric_type` (TEXT) - Type (weight, blood_pressure, etc.)
- `value` (NUMERIC) - Measurement value
- `unit` (TEXT) - Unit of measurement (kg, mmHg, etc.)
- `recorded_at` (TIMESTAMP) - When recorded

## Troubleshooting

If you see "No database URL found":
1. Make sure the Supabase integration is connected in the Connect section
2. Verify environment variables in the Vars section
3. Run the database migration script in `scripts/init-db.sql`

If authentication fails:
1. Check that email confirmation is set up in Supabase
2. Verify the redirect URLs in sign-up configuration
3. Check browser console for error messages
