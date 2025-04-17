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
5. [x] Migrate existing data from Firebase to Supabase
   - [x] Export data from Firebase
   - [x] Transform data to match Supabase schema
   - [x] Import data into Supabase
6. [x] Update all Firebase database queries to Supabase
   - [x] Update event creation
   - [x] Update event retrieval
   - [x] Update event updates
   - [x] Update event deletion
   - [x] Update real-time subscriptions
7. [x] Update all Firebase authentication logic
8. [x] Remove Firebase dependencies
9. [x] Test all features with Supabase
10. [x] Update environment variables and configuration

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
   - [x] Pets component
   - [x] Shopping List component
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
- [x] Add delete functionality for all items that can be added (checklist completed, already implemented in all pages)
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
- [x] Implement Pet Health Records feature:
  - [x] Create database schema for pet health records
  - [x] Create UI components for displaying health records
  - [x] Implement record management functionality
  - [x] Add Health Records tab to pet details screen
  - [x] Implement add/edit/delete operations for health records
  - [x] Configure real-time synchronization with Supabase

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

## Web Version Tasks
- [x] Fix window undefined error when running web version
  - [x] Implement SSR-compatible AsyncStorage for Supabase auth
  - [x] Test web version deployment
- [ ] Implement responsive design for web version
- [ ] Add web-specific optimizations 

## Current Priorities (To Finish the App)

1. Remove Firebase Dependencies
   - [x] Identify and remove all remaining Firebase imports and code
   - [x] Check for any Firebase-specific functionality that needs replacement
   - [x] Remove Firebase packages from package.json
   - [x] Update all screens to use only Supabase

2. Testing Checklist
   - [ ] Authentication flows
     - [ ] Email/password signup
     - [ ] Email/password login
     - [ ] Google OAuth
     - [ ] Password reset
     - [ ] Session management
   - [ ] Data CRUD operations
     - [ ] Verify all screens after Firebase removal

3. iOS Deployment Tasks
   - [ ] Resolve module map and sandbox permission issues
   - [ ] Complete iOS build and deployment to device
   - [ ] Test app functionality on iOS device
   
4. Component Documentation & Polish
   - [ ] Create component documentation
   - [ ] Add unit tests for components
   - [ ] Implement accessibility features
   - [ ] Add dark mode support
   - [ ] Create user onboarding flow
   - [ ] Add performance monitoring

5. Final Debugging
   - [ ] Check Supabase database connection and permissions
   - [ ] Verify user authentication is working properly
   - [ ] Refresh the Supabase schema cache if needed
   - [ ] Ensure all database operations work with the latest schema

## Summary of Completion Status
- [x] UI migration and improvements (~95% complete)
- [x] Database schema migration (100% complete)
- [x] Authentication system migration (100% complete)
- [x] Real-time functionality (100% complete)
- [x] Data migration (No valuable data to migrate - 100% complete)
- [x] Firebase dependency removal (100% complete)
- [ ] Testing (50% complete)
- [ ] iOS deployment (30% complete)
- [ ] Documentation (20% complete)
- [ ] Accessibility features (10% complete)
- [ ] Component tests (0% complete)

Overall completion: ~90% 

## Pet Features Implementation

### Phase 4: Weight Tracking
- [ ] Create Weight Tab UI in pet-details.tsx:
  - [ ] Add tab implementation in renderTabContent()
  - [ ] Create state management for weight entries
  - [ ] Implement loading/empty states
  - [ ] Add sorting and filtering options

- [ ] Create WeightEntryForm component (components/pet-weight/WeightEntryForm.tsx):
  - [ ] Implement form with date picker, weight input, and unit selection
  - [ ] Add validation for required fields
  - [ ] Create functionality to save weights to Supabase
  - [ ] Add proper error and success handling

- [ ] Create WeightHistoryChart component (components/pet-weight/WeightHistoryChart.tsx):
  - [ ] Research and select appropriate charting library
  - [ ] Implement line chart for weight history
  - [ ] Add customization options (time ranges, data points)
  - [ ] Ensure responsive design and accessibility

- [ ] Create WeightLogItem component (components/pet-weight/WeightLogItem.tsx):
  - [ ] Design list item for individual weight entries
  - [ ] Implement edit and delete functionality
  - [ ] Add visual indicators for weight changes

- [ ] Implement real-time synchronization:
  - [ ] Add Supabase subscription for weight entries
  - [ ] Implement handlers for INSERT, UPDATE, DELETE events
  - [ ] Ensure proper error handling for subscription

- [ ] Add unit conversion and analytics:
  - [ ] Implement unit conversion between lbs and kg
  - [ ] Add weight trends analysis (gain/loss over time)
  - [ ] Create weight goals feature

### Phase 5: Pet Care Reminders (Future)
- [ ] Create Care Tab UI in pet-details.tsx
- [ ] Create components for care reminders management
- [ ] Implement CRUD operations with Supabase
- [ ] Add reminder notifications functionality
- [ ] Implement recurring reminder patterns

### Phase 6: Feeding Schedule (Future)
- [ ] Create Feeding Tab UI in pet-details.tsx
- [ ] Create components for feeding schedule management
- [ ] Implement CRUD operations with Supabase
- [ ] Add reminder notifications for feeding times
- [ ] Implement recurring schedule patterns

### Phase 7: Activity Tracker (Future)
- [ ] Create Activity Tab UI in pet-details.tsx
- [ ] Create components for activity tracking
- [ ] Implement CRUD operations with Supabase
- [ ] Add activity visualization components
- [ ] Implement activity goals and statistics

## Current Priorities (To Finish the App)

1. ~~Implement Pet Health Records Feature (Phase 3)~~
   - [x] Create health records components
   - [x] Implement CRUD for vaccinations
   - [x] Implement CRUD for medications 
   - [x] Implement CRUD for vet visits
   - [x] Connect with reminder system

2. Implement Weight Tracking Feature (Phase 4)
   - [ ] Complete all tasks outlined in the Pet Features Implementation section
   - [ ] Test with different pet types and weights
   - [ ] Ensure proper data visualization

3. Complete Dark Mode Implementation
   - [ ] Update TimePicker component to use ThemeContext
   - [ ] Update Calendar views with dark mode support
   - [ ] Apply theming to Pet cards and pet detail screens
   - [ ] Ensure AddEvent screen uses theme-aware styling
   - [ ] Update emergency contact screens with theme support
   - [ ] Test theme persistence across app restarts
   - [ ] Test system theme sync on device theme change

4. iOS Deployment Tasks
   - [ ] Resolve module map and sandbox permission issues
   - [ ] Complete iOS build and deployment to device
   - [ ] Test app functionality on iOS device
    
5. Documentation & Testing
   - [ ] Create component documentation
   - [ ] Add unit tests for components
   - [ ] Implement accessibility features
   - [ ] Test authentication flows
   - [ ] Verify all screens after Firebase removal

## Breed Information
- [ ] Add breed-specific care guidelines
- [ ] Include common health concerns for specific breeds
- [ ] Provide age-appropriate care recommendations

## Pet Gallery
- [ ] Create dedicated photo collection for each pet
- [ ] Organize photos by date/event
- [ ] Allow adding captions and tags

## Pet Care Reminders
- [ ] Set up grooming schedule and reminders
- [ ] Create reminders for nail trimming, teeth cleaning, etc.
- [ ] Add flea/tick treatment schedule

## Pet Social Features
- [ ] Share pet profiles with other app users
- [ ] Find pet playdates or pet-friendly events
- [ ] Connect with other owners of similar pets

## QR Code/ID Tags
- [ ] Generate QR codes with pet and owner information
- [ ] Create printable ID tags
- [ ] Include emergency contact information 

## TypeScript Issues

- [x] Fix TypeScript errors in emergency.tsx component
  - [x] Review and correct type definitions for emergency contacts
  - [x] Fix type issues with Supabase real-time subscription handlers
  - [x] Ensure proper typing for form state management
  - [x] Address TS errors in modal handling for emergency contacts
  - [x] Validate proper typing for event handlers
- [ ] Set up comprehensive type testing for the emergency contacts feature
- [ ] Document type structure for emergency contacts in code comments 

## Next Steps
- [ ] Implement reports and health record summaries
- [x] Add reminders for upcoming vaccinations and medications
- [x] Create data export functionality for vet visits
- [x] Add photo attachments to health records
- [ ] Implement health record sharing with veterinarians
- [x] Add medication schedules with notification reminders
- [x] Create recurring medication tracking 

# To-Do List

## High Priority
- [x] Update package versions to match expected versions:
  - [x] @react-native-picker/picker@2.11.0 -> 2.9.0
  - [x] expo@52.0.37 -> ~52.0.46
  - [x] expo-constants@17.0.7 -> ~17.0.8
  - [x] expo-device@7.0.2 -> ~7.0.3
  - [x] expo-file-system@18.0.11 -> ~18.0.12
  - [x] expo-modules-core@2.2.2 -> ~2.2.3
  - [x] expo-notifications@0.29.13 -> ~0.29.14
  - [x] expo-router@4.0.17 -> ~4.0.20
  - [x] expo-splash-screen@0.29.21 -> ~0.29.24
  - [x] expo-symbols@0.2.1 -> ~0.2.2
  - [x] expo-system-ui@4.0.7 -> ~4.0.9
  - [x] react-native@0.76.6 -> 0.76.9
  - [x] jest-expo@52.0.5 -> ~52.0.6

## Medium Priority
- [ ] Add Firebase support if needed
  - [ ] Create required Firebase configuration files
  - [ ] Re-add Firebase configuration to app.config.js once files are available

## Completed
- [x] Fix imports in AddRecordModal.tsx
  - [x] Create Button component
  - [x] Fix DatePicker usage and imports
- [x] Fix Firebase configuration errors by removing missing file references 

## Pet Feature Enhancements
- [x] Phase 1: Database Schema ✅
  - [x] Create main pets table with RLS policies
  - [x] Create all feature-specific tables with proper relationships
  - [x] Set up indexes for performance
- [x] Phase 2: Update Existing Pets Screen
  - [x] Migrate from local state to Supabase
  - [x] Implement CRUD operations with database
  - [x] Add real-time synchronization
  - [x] Enhance pet profiles with additional fields
  - [x] Create placeholder for detailed pet view
- [x] Phase 3: Pet Health Records (PRIORITY)
  - [x] Create pet details screen with tabbed interface
  - [x] Set up foundation for feature tabs
  - [x] Create components for health records:
    - [x] VaccinationItem component
    - [x] MedicationItem component
    - [x] VetVisitItem component
    - [x] AddRecordModal component
  - [x] Implement vaccinations functionality:
    - [x] Display vaccination records
    - [x] Add new vaccinations
    - [x] Edit vaccination details
    - [x] Delete vaccination records
    - [x] Set vaccination reminders
  - [x] Implement medications tracking:
    - [x] Display medication records
    - [x] Add new medications
    - [x] Edit medication details
    - [x] Delete medication records
    - [x] Set medication reminders
  - [x] Implement vet visits logging:
    - [x] Display vet visit records
    - [x] Add new vet visits
    - [x] Edit vet visit details
    - [x] Delete vet visit records
    - [x] Set follow-up reminders
  - [x] Add reminder settings for health records
  - [x] Integrate with calendar for health-related events

## Pet Features Implementation

### Phase 4: Weight Tracking
- [ ] Create Weight Tab UI in pet-details.tsx:
  - [ ] Add tab implementation in renderTabContent()
  - [ ] Create state management for weight entries
  - [ ] Implement loading/empty states
  - [ ] Add sorting and filtering options

- [ ] Create WeightEntryForm component (components/pet-weight/WeightEntryForm.tsx):
  - [ ] Implement form with date picker, weight input, and unit selection
  - [ ] Add validation for required fields
  - [ ] Create functionality to save weights to Supabase
  - [ ] Add proper error and success handling

- [ ] Create WeightHistoryChart component (components/pet-weight/WeightHistoryChart.tsx):
  - [ ] Research and select appropriate charting library
  - [ ] Implement line chart for weight history
  - [ ] Add customization options (time ranges, data points)
  - [ ] Ensure responsive design and accessibility

- [ ] Create WeightLogItem component (components/pet-weight/WeightLogItem.tsx):
  - [ ] Design list item for individual weight entries
  - [ ] Implement edit and delete functionality
  - [ ] Add visual indicators for weight changes

- [ ] Implement real-time synchronization:
  - [ ] Add Supabase subscription for weight entries
  - [ ] Implement handlers for INSERT, UPDATE, DELETE events
  - [ ] Ensure proper error handling for subscription

- [ ] Add unit conversion and analytics:
  - [ ] Implement unit conversion between lbs and kg
  - [ ] Add weight trends analysis (gain/loss over time)
  - [ ] Create weight goals feature

### Phase 5: Pet Care Reminders (Future)
- [ ] Create Care Tab UI in pet-details.tsx
- [ ] Create components for care reminders management
- [ ] Implement CRUD operations with Supabase
- [ ] Add reminder notifications functionality
- [ ] Implement recurring reminder patterns

### Phase 6: Feeding Schedule (Future)
- [ ] Create Feeding Tab UI in pet-details.tsx
- [ ] Create components for feeding schedule management
- [ ] Implement CRUD operations with Supabase
- [ ] Add reminder notifications for feeding times
- [ ] Implement recurring schedule patterns

### Phase 7: Activity Tracker (Future)
- [ ] Create Activity Tab UI in pet-details.tsx
- [ ] Create components for activity tracking
- [ ] Implement CRUD operations with Supabase
- [ ] Add activity visualization components
- [ ] Implement activity goals and statistics

## Current Priorities (To Finish the App)

1. ~~Implement Pet Health Records Feature (Phase 3)~~
   - [x] Create health records components
   - [x] Implement CRUD for vaccinations
   - [x] Implement CRUD for medications 
   - [x] Implement CRUD for vet visits
   - [x] Connect with reminder system

2. Implement Weight Tracking Feature (Phase 4)
   - [ ] Complete all tasks outlined in the Pet Features Implementation section
   - [ ] Test with different pet types and weights
   - [ ] Ensure proper data visualization

3. Complete Dark Mode Implementation
   - [ ] Update TimePicker component to use ThemeContext
   - [ ] Update Calendar views with dark mode support
   - [ ] Apply theming to Pet cards and pet detail screens
   - [ ] Ensure AddEvent screen uses theme-aware styling
   - [ ] Update emergency contact screens with theme support
   - [ ] Test theme persistence across app restarts
   - [ ] Test system theme sync on device theme change

4. iOS Deployment Tasks
   - [ ] Resolve module map and sandbox permission issues
   - [ ] Complete iOS build and deployment to device
   - [ ] Test app functionality on iOS device
    
5. Documentation & Testing
   - [ ] Create component documentation
   - [ ] Add unit tests for components
   - [ ] Implement accessibility features
   - [ ] Test authentication flows
   - [ ] Verify all screens after Firebase removal

## Breed Information
- [ ] Add breed-specific care guidelines
- [ ] Include common health concerns for specific breeds
- [ ] Provide age-appropriate care recommendations

## Pet Gallery
- [ ] Create dedicated photo collection for each pet
- [ ] Organize photos by date/event
- [ ] Allow adding captions and tags

## Pet Care Reminders
- [ ] Set up grooming schedule and reminders
- [ ] Create reminders for nail trimming, teeth cleaning, etc.
- [ ] Add flea/tick treatment schedule

## Pet Social Features
- [ ] Share pet profiles with other app users
- [ ] Find pet playdates or pet-friendly events
- [ ] Connect with other owners of similar pets

## QR Code/ID Tags
- [ ] Generate QR codes with pet and owner information
- [ ] Create printable ID tags
- [ ] Include emergency contact information 

## TypeScript Issues

- [x] Fix TypeScript errors in emergency.tsx component
  - [x] Review and correct type definitions for emergency contacts
  - [x] Fix type issues with Supabase real-time subscription handlers
  - [x] Ensure proper typing for form state management
  - [x] Address TS errors in modal handling for emergency contacts
  - [x] Validate proper typing for event handlers
- [ ] Set up comprehensive type testing for the emergency contacts feature
- [ ] Document type structure for emergency contacts in code comments 

## Next Steps
- [ ] Implement reports and health record summaries
- [x] Add reminders for upcoming vaccinations and medications
- [x] Create data export functionality for vet visits
- [x] Add photo attachments to health records
- [ ] Implement health record sharing with veterinarians
- [x] Add medication schedules with notification reminders
- [x] Create recurring medication tracking 

# To-Do List

## High Priority
- [x] Update package versions to match expected versions:
  - [x] @react-native-picker/picker@2.11.0 -> 2.9.0
  - [x] expo@52.0.37 -> ~52.0.46
  - [x] expo-constants@17.0.7 -> ~17.0.8
  - [x] expo-device@7.0.2 -> ~7.0.3
  - [x] expo-file-system@18.0.11 -> ~18.0.12
  - [x] expo-modules-core@2.2.2 -> ~2.2.3
  - [x] expo-notifications@0.29.13 -> ~0.29.14
  - [x] expo-router@4.0.17 -> ~4.0.20
  - [x] expo-splash-screen@0.29.21 -> ~0.29.24
  - [x] expo-symbols@0.2.1 -> ~0.2.2
  - [x] expo-system-ui@4.0.7 -> ~4.0.9
  - [x] react-native@0.76.6 -> 0.76.9
  - [x] jest-expo@52.0.5 -> ~52.0.6

## Medium Priority
- [ ] Add Firebase support if needed
  - [ ] Create required Firebase configuration files
  - [ ] Re-add Firebase configuration to app.config.js once files are available

## Completed
- [x] Fix imports in AddRecordModal.tsx
  - [x] Create Button component
  - [x] Fix DatePicker usage and imports
- [x] Fix Firebase configuration errors by removing missing file references 