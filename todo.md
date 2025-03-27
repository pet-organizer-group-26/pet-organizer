# Migration Todo List

## Supabase Migration Tasks
1. [x] Install Supabase dependencies
2. [x] Set up Supabase client with provided credentials
3. [x] Migrate authentication from Firebase to Supabase Auth
4. [x] Create equivalent database schema in Supabase
   - [x] Create events table with required fields
   - [x] Set up appropriate indexes
   - [x] Configure RLS policies for data access
   - [x] Test schema with sample data
5. [ ] Migrate existing data from Firebase to Supabase
   - [ ] Export data from Firebase
   - [ ] Transform data to match Supabase schema
   - [ ] Import data into Supabase
6. [x] Update all Firebase database queries to Supabase
   - [x] Update event creation
   - [x] Update event retrieval
   - [x] Update event updates
   - [x] Update event deletion
   - [x] Update real-time subscriptions
7. [x] Update all Firebase authentication logic
8. [ ] Remove Firebase dependencies
9. [ ] Test all features with Supabase
10. [ ] Update environment variables and configuration

## Testing Checklist
- [ ] Authentication flows
  - [ ] Email/password signup
  - [ ] Email/password login
  - [ ] Google OAuth
  - [ ] Password reset
  - [ ] Session management
- [ ] Data CRUD operations
  - [x] Create operations
  - [x] Read operations
  - [x] Update operations
  - [x] Delete operations
- [x] Real-time subscriptions
- [x] Error handling
- [ ] Performance testing

## Next Steps
1. [x] Create Supabase database schema:
   ```sql
   CREATE TABLE events (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     date DATE NOT NULL,
     time TIME NOT NULL,
     category TEXT NOT NULL,
     location TEXT,
     repeat TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;

   -- Allow users to see only their own events
   CREATE POLICY "Users can view their own events"
     ON events FOR SELECT
     USING (auth.uid() = user_id);

   -- Allow users to insert their own events
   CREATE POLICY "Users can insert their own events"
     ON events FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Allow users to update their own events
   CREATE POLICY "Users can update their own events"
     ON events FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);

   -- Allow users to delete their own events
   CREATE POLICY "Users can delete their own events"
     ON events FOR DELETE
     USING (auth.uid() = user_id);
   ```

2. Migrate existing data from Firebase:
   - Export Firebase data using the Firebase console
   - Transform data to match Supabase schema
   - Import data using Supabase's REST API

3. Update database queries in:
   - [x] Calendar component
   - [ ] Pets component
   - [ ] Shopping List component
   - [ ] Expenses component 