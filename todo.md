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

## iOS Deployment Tasks
- [x] Clean and reset iOS build environment
- [x] Configure code signing in Xcode
- [x] Fix package version compatibility issues:
  - [x] Resolve @react-native-community/datetimepicker error
  - [x] Update @react-native-async-storage/async-storage to compatible version
  - [x] Ensure other Expo packages are compatible
- [ ] Resolve module map and sandbox permission issues:
  - [ ] Try creating a development build instead of production archive
  - [ ] Switch to Debug configuration in Xcode scheme
  - [ ] Generate new modulemap files by rebuilding from scratch
  - [ ] Manually enable Disable Library Validation in Xcode settings
  - [ ] Test with EAS build service as alternative
- [ ] Complete iOS build and deployment to device
- [ ] Test app functionality on iOS device

## Next Steps
1. [x] Create Supabase database schema:
   ```sql
   CREATE TABLE events (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     event_date DATE NOT NULL,
     event_time TIME NOT NULL,
     category TEXT NOT NULL,
     location TEXT,
     repeat TEXT,
     pet_id UUID,
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
   - [x] Expenses component
   - [x] Home component

## UI Improvements

### High Priority
- [x] Create a centralized theme.ts file with:
  - [x] Color palette
  - [x] Typography system
  - [x] Spacing scale
  - [x] Border radius values
  - [x] Shadow definitions

- [x] Implement base components:
  - [x] Button component with variants (primary, secondary, outline, text)
  - [x] Card component with consistent styling
  - [x] InputField component with validation states
  - [x] Header component with consistent styling

### Medium Priority
- [ ] Update all screens to use the new theme system:
  - [ ] Login screen
  - [ ] Signup screen
  - [ ] Home screen
  - [ ] Calendar screen
  - [ ] Pets screen
  - [ ] Shopping List screen
  - [ ] Expenses screen
  - [ ] Emergency screen

- [ ] Standardize form layouts and input styles
- [ ] Implement consistent list item styles
- [ ] Create reusable loading states
- [ ] Standardize error and success messages

### Low Priority
- [ ] Add animations for state transitions
- [ ] Implement dark mode support
- [ ] Create component documentation
- [ ] Add accessibility improvements

## High Priority
- [x] Update remaining screens to use new theme system
  - [x] Pets screen
  - [x] Expenses screen
  - [x] Emergency screen
  - [x] Shopping list screen
  - [x] Add Event screen
- [x] Implement consistent form validation patterns
- [x] Add proper error handling and loading states
- [x] Add user feedback with success/error messages for all CRUD operations
- [x] Improve modal button layout for better usability
- [x] Fix keyboard dismissal in expense form amount field
- [x] Fix thin buttons in AddEvent and AddExpense components
- [ ] Create component documentation

## Medium Priority
- [x] Implement custom date and time pickers
  - [x] Create DatePicker component
  - [x] Create TimePicker component
  - [x] Create combined DateTimePicker component
  - [x] Implement accessibility features
  - [x] Create documentation
  - [x] Integrate in AddEvent screen
  - [x] Integrate in expenses screen
  - [x] Integrate in calendar screen
- [x] Create Settings page with:
  - [x] Account management section
  - [x] Appearance preferences (dark mode option)
  - [x] Notification preferences
  - [x] Support options
  - [x] Account deletion option
- [ ] Add accessibility features
  - [ ] Screen reader support
  - [ ] Keyboard navigation
  - [ ] Color contrast improvements
- [ ] Implement dark mode support
- [ ] Add animations for state transitions
- [ ] Create comprehensive design system documentation

## Low Priority
- [ ] Add unit tests for components
- [ ] Implement E2E testing
- [ ] Add performance monitoring
- [ ] Create user onboarding flow
- [ ] Add analytics tracking

## Completed
- [x] Create centralized theme system
- [x] Implement base components (Button, InputField, Card)
- [x] Update login screen with new theme system
- [x] Update pets screen with new theme system
- [x] Update expenses screen with new theme system
- [x] Update emergency screen with new theme system
- [x] Update shopping list screen with new theme system
- [x] Update Add Event screen with new theme system
- [x] Create custom date and time picker components
- [x] Add consistent error handling in login form
- [x] Implement proper keyboard handling
- [x] Add loading states to buttons
- [x] Enhance shadow styling for UI cards to create realistic 3D effects
- [x] Implement real-time data on Home screen
- [x] Implement real-time data on Expenses screen
- [x] Create expenses database table with proper RLS

## Troubleshooting

### AddEvent Component Issues
- [ ] Debug event creation not working - investigate handleSave function:
  - [x] **CRITICAL**: Fix database schema issue - Error: "Could not find the 'date' column of 'events' in the schema cache"
    - [x] Verify events table column names match the expected fields in app code
    - [x] Column names in database are 'event_date' and 'event_time' instead of 'date' and 'time'
    - [x] Updated application code to use correct column names
    - [ ] Refresh the Supabase schema cache if needed
    - [x] Updated SQL definition in todo.md to match actual implementation
  - [x] Fix real-time update issue in Calendar component:
    - [x] Added better logging to track subscription updates
    - [x] Verified subscription configuration with proper channel setup
    - [x] Added explicit empty dependency array to useEffect
    - [x] Enhanced subscription to handle INSERT/UPDATE/DELETE separately
    - [x] Improved state updates to avoid unnecessary re-fetching
    - [x] Added loading state to prevent multiple submissions
    - [x] Implemented simplified real-time subscription approach that refetches all data
    - [x] Fixed channel cleanup with proper removeChannel method
    - [x] **Expo-specific fix:** Implemented useFocusEffect for automatic refresh on screen returns
    - [x] **Expo-specific fix:** Modified navigation flow to prevent app reloads
    - [x] **Refine UX**: Removed manual refresh button as automatic refresh is working well
    - [x] **Refine UX**: Simplified success alert to only show "Go to Calendar" option
  - [x] Fix editing and deleting events real-time updates:
    - [x] Improve real-time subscription to explicitly handle all event types (INSERT, UPDATE, DELETE)
    - [x] Add specific handlers for each operation type
    - [x] Enhance handleDelete and handleSaveEdit functions
    - [x] Add proper user feedback during edit/delete operations
    - [x] Implement filtering by user_id in subscription for better security
    - [x] Add unique channel names to prevent subscription conflicts
    - [x] Implement fallback manual updates in case real-time updates fail
    - [x] Add success confirmation alerts after editing or deleting events
  - [ ] Check Supabase database connection and permissions
  - [x] Fix missing try/catch block syntax - there appears to be a missing opening `try` in the error handler
  - [ ] Verify user authentication is working properly
  - [ ] Check database schema constraints to ensure all required fields are being provided
  - [x] Add better error logging to identify specific failure points
  - [ ] Ensure events table has proper RLS policies configured
  - [ ] Validate that generateRepeats function is creating proper event objects
  - [ ] Test event creation directly through Supabase client 

### TypeScript Fixes
- [x] Fix TypeScript errors in components:
  - [x] Fix property 'toString()' error on 'never' type by using String() conversion
  - [x] Fix Button components using incorrect props (title vs children)
  - [x] Fix InputField component using incorrect icon props
  - [x] Fix DatePicker props (value/onChange vs date/onDateChange)
  - [x] Fix import statements for DatePicker component
  - [x] Add proper type annotation for date parameter
  - [x] Addressed errors in the expenses.tsx file that prevented clean TypeScript compilation

# Dark Mode Implementation - Remaining Tasks

## High Priority

- [ ] Update TimePicker component to use ThemeContext
- [ ] Update Calendar views with dark mode support
- [ ] Apply theming to Pet cards and pet detail screens
- [ ] Ensure AddEvent screen uses theme-aware styling
- [ ] Update emergency contact screens with theme support
- [ ] Test theme persistence across app restarts
- [ ] Test system theme sync on device theme change

## Medium Priority

- [ ] Add theme support to charts and data visualizations in Expenses
- [ ] Ensure all modals and popups follow theme settings
- [ ] Create dark mode versions of any app illustrations or graphics
- [ ] Add transition animation when switching themes
- [ ] Optimize theme switch performance (minimize re-renders)
- [ ] Add theme presets for custom color schemes beyond light/dark

## Low Priority

- [ ] Create theme documentation for developers
- [ ] Add theme preview in settings
- [ ] Consider scheduled theme changes (auto dark mode at night)
- [ ] Add high contrast theme option for accessibility
- [ ] Review and improve a11y features for both themes
- [ ] Implement themed splash screen

## Testing 

- [ ] Test on various Android devices
- [ ] Test on various iOS devices
- [ ] Test with VoiceOver and TalkBack screen readers
- [ ] Verify color contrast meets WCAG AA guidelines in both themes
- [ ] Test theme persistence after app updates

## Refactoring

- [ ] Review hardcoded colors in remaining components
- [ ] Standardize shadow implementation across platforms
- [ ] Extract common themed styles into reusable hooks/utilities
- [ ] Consider using React.memo for performance-critical components 