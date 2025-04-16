-- Create tables for enhanced pet features

-- Create main pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  birthdate DATE,
  breed TEXT,
  gender TEXT,
  microchip_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for pets table
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for pets table
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

-- Pet Health Records: vaccinations, medications, vet visits
CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  reminder BOOLEAN DEFAULT FALSE,
  reminder_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  reminder BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_vet_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  follow_up_date DATE,
  reminder BOOLEAN DEFAULT FALSE,
  reminder_date DATE,
  notes TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight/Growth Tracking
CREATE TABLE IF NOT EXISTS pet_weights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'lbs',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet Care Reminders
CREATE TABLE IF NOT EXISTS pet_care_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- grooming, nail_trimming, teeth_cleaning, bath, etc.
  date DATE NOT NULL,
  frequency TEXT, -- daily, weekly, monthly, yearly, one-time
  last_completed DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feeding Schedule
CREATE TABLE IF NOT EXISTS pet_feeding_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  food_type TEXT NOT NULL, -- dry, wet, raw, treats, etc.
  amount TEXT NOT NULL,
  unit TEXT NOT NULL, -- cups, grams, oz, etc.
  time_of_day TIME NOT NULL,
  frequency TEXT NOT NULL, -- daily, specific_days
  specific_days TEXT[], -- array of days of week if frequency is specific_days
  notes TEXT,
  reminder BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Tracker
CREATE TABLE IF NOT EXISTS pet_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pet_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- walk, play, training, etc.
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  intensity TEXT, -- low, moderate, high
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for all tables
-- Pet Vaccinations
ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet vaccinations"
  ON pet_vaccinations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet vaccinations"
  ON pet_vaccinations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet vaccinations"
  ON pet_vaccinations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet vaccinations"
  ON pet_vaccinations FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Medications
ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet medications"
  ON pet_medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet medications"
  ON pet_medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet medications"
  ON pet_medications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet medications"
  ON pet_medications FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Vet Visits
ALTER TABLE pet_vet_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet vet visits"
  ON pet_vet_visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet vet visits"
  ON pet_vet_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet vet visits"
  ON pet_vet_visits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet vet visits"
  ON pet_vet_visits FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Weights
ALTER TABLE pet_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet weights"
  ON pet_weights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet weights"
  ON pet_weights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet weights"
  ON pet_weights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet weights"
  ON pet_weights FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Care Reminders
ALTER TABLE pet_care_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet care reminders"
  ON pet_care_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet care reminders"
  ON pet_care_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet care reminders"
  ON pet_care_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet care reminders"
  ON pet_care_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Feeding Schedules
ALTER TABLE pet_feeding_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet feeding schedules"
  ON pet_feeding_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet feeding schedules"
  ON pet_feeding_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet feeding schedules"
  ON pet_feeding_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet feeding schedules"
  ON pet_feeding_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Pet Activities
ALTER TABLE pet_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet activities"
  ON pet_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet activities"
  ON pet_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet activities"
  ON pet_activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet activities"
  ON pet_activities FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet_id ON pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_medications_pet_id ON pet_medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vet_visits_pet_id ON pet_vet_visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_weights_pet_id ON pet_weights(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_care_reminders_pet_id ON pet_care_reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_feeding_schedules_pet_id ON pet_feeding_schedules(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_activities_pet_id ON pet_activities(pet_id);
