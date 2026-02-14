# Supabase Setup Guide

This document provides step-by-step instructions for setting up Supabase for your bookmarks application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Choose a name for your project (e.g., "Bookmarks App")
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose a region close to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. You'll find two important values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
3. Copy these values - you'll need them in the next step

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in the root of your project
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 4: Set Up the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create:
- `profiles` table (user profiles)
- `collections` table (bookmark collections)
- `tags` table (bookmark tags)
- `bookmarks` table (bookmarks with all fields)
- `bookmark_tags` junction table (many-to-many relationship)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic profile creation and timestamp updates

## Step 5: Populate with Mock Data (Optional)

To populate your database with the mock data from the original project:

1. First, create a test user account:
   - Run your Next.js app: `npm run dev`
   - Navigate to the signup page
   - Create a test account (e.g., test@example.com)

2. Get your user ID:
   - In Supabase dashboard, go to **SQL Editor**
   - Run this query:
     ```sql
     SELECT id FROM auth.users WHERE email = 'test@example.com';
     ```
   - Copy the returned UUID

3. Update the seed file:
   - Open `supabase/seed.sql`
   - Replace all instances of `'YOUR_USER_ID_HERE'` with your actual user ID
   - You can use find and replace in your editor

4. Run the seed script:
   - In Supabase SQL Editor, create a new query
   - Paste the contents of `supabase/seed.sql`
   - Click "Run"

## Step 6: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see all the tables listed:
   - profiles
   - collections
   - tags
   - bookmarks
   - bookmark_tags
3. Click on each table to verify the structure
4. If you ran the seed script, you should see data in the tables

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. You should be redirected to the login page (once authentication UI is implemented)

4. Sign up for a new account or log in with your test account

5. Test the following features:
   - Create a bookmark
   - View bookmarks
   - Toggle favorite
   - Archive/restore bookmarks
   - Move to trash/restore
   - Create collections
   - Create tags
   - Assign tags to bookmarks

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct anon key from Supabase
- Make sure there are no extra spaces in your `.env.local` file
- Restart your development server after updating `.env.local`

### "Row Level Security" errors
- Ensure you ran the `schema.sql` script completely
- Check that RLS policies were created in **Authentication** > **Policies**
- Verify you're logged in with a valid user account

### Database connection issues
- Verify your Project URL is correct
- Check that your Supabase project is active (not paused)
- Ensure you have a stable internet connection

### Seed data not appearing
- Make sure you replaced `'YOUR_USER_ID_HERE'` with your actual user ID
- Check that the user ID exists in `auth.users`
- Verify the seed script ran without errors

## Next Steps

Now that Supabase is set up, the application will:
- Store all bookmarks, collections, and tags in Supabase
- Authenticate users with Supabase Auth
- Enforce user data isolation with Row Level Security
- Persist data across sessions

For more information about Supabase features, visit the [Supabase Documentation](https://supabase.com/docs).
