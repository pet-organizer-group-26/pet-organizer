# Pet Features Implementation Plan

## Overview
We're implementing five major pet features to enhance the app's functionality beyond basic pet profiles:

1. Pet Health Records
2. Weight/Growth Tracking
3. Pet Care Reminders
4. Feeding Schedule
5. Activity Tracker

## Implementation Phases

### Phase 1: Database Schema (Completed)
- Created main `pets` table with proper RLS policies
- Created feature-specific tables:
  - `pet_vaccinations` for vaccination records
  - `pet_medications` for medication tracking
  - `pet_vet_visits` for veterinary visits
  - `pet_weights` for weight tracking
  - `pet_care_reminders` for grooming and other reminders
  - `pet_feeding_schedules` for feeding routines
  - `pet_activities` for exercise and play tracking
- Added appropriate indexes and relationships

### Phase 2: Update Existing Pets Screen
- Update the existing `app/pets.tsx` to use Supabase instead of local state
- Implement CRUD operations with Supabase client
- Add real-time data synchronization
- Enhance pet profiles with additional fields (birthdate, breed, gender, etc.)
- Create a detailed pet view screen

### Phase 3: Pet Health Records
- Create a new screen `app/pet-health.tsx` for health records management
- Implement tabbed interface with:
  - Vaccinations tab
  - Medications tab
  - Vet Visits tab
- Add CRUD operations for each record type
- Implement date tracking and reminder settings
- Create visualization of health history

#### Components Needed:
- VaccinationItem.tsx
- MedicationItem.tsx
- VetVisitItem.tsx
- AddRecordModal.tsx (reusable for different record types)
- HealthRecordsList.tsx

### Phase 4: Weight Tracking
- Create a new screen `app/pet-weight.tsx` for weight tracking
- Implement weight entry form with date picker
- Create weight history graph using a chart library
- Add weight goal setting functionality
- Include note-taking for weight entries

#### Components Needed:
- WeightEntryForm.tsx
- WeightHistoryChart.tsx
- WeightLogItem.tsx
- WeightGoalSetting.tsx

### Phase 5: Pet Care Reminders
- Create a new screen `app/pet-care.tsx` for care reminders
- Implement different reminder categories (grooming, nail trimming, etc.)
- Add recurring reminder options
- Create notification functionality
- Add completion tracking

#### Components Needed:
- CareReminderItem.tsx
- AddCareReminderModal.tsx
- ReminderFrequencyPicker.tsx
- ReminderHistoryList.tsx

### Phase 6: Feeding Schedule
- Create a new screen `app/pet-feeding.tsx` for feeding schedules
- Implement multiple feeding time settings
- Add food type and amount tracking
- Create recurring schedule functionality
- Implement reminder notifications

#### Components Needed:
- FeedingScheduleItem.tsx
- AddFeedingScheduleModal.tsx
- FeedingTimeList.tsx
- FoodTypePicker.tsx

### Phase 7: Activity Tracker
- Create a new screen `app/pet-activities.tsx` for activity tracking
- Implement activity logging with type, duration, and intensity
- Create activity history view
- Add activity goals
- Implement visualization of activity patterns

#### Components Needed:
- ActivityLogItem.tsx
- AddActivityModal.tsx
- ActivityHistoryList.tsx
- ActivityStatsView.tsx

## Navigation Structure

We'll implement a nested navigation structure:
- Main Pets List Screen
  - Individual Pet Detail Screen (tab-based)
    - Profile Tab
    - Health Records Tab
    - Weight Tab
    - Care Reminders Tab
    - Feeding Tab
    - Activities Tab

## Implementation Order
1. First migrate existing pets to Supabase
2. Implement Pet Detail Screen with tabbed interface
3. Implement Health Records feature
4. Implement Weight Tracking feature
5. Implement Care Reminders feature
6. Implement Feeding Schedule feature
7. Implement Activity Tracker feature

## Common UI Components
- DatePicker
- RecordList
- AddRecordModal
- DeleteConfirmation
- ReminderToggle
- FrequencyPicker
- NotesField

## Integration with Existing App
- Add entries to the app drawer for pets and features
- Add pet-specific events to the calendar
- Show pet reminders on the home screen
- Include pet expenses in the expense tracker
