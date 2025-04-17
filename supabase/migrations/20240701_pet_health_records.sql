-- Create pet vaccinations table
CREATE TABLE IF NOT EXISTS pet_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    expiration_date DATE,
    administered_by TEXT,
    lot_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet medications table
CREATE TABLE IF NOT EXISTS pet_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    time_of_day TEXT,
    prescribed_by TEXT,
    pharmacy TEXT,
    refills INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet vet visits table
CREATE TABLE IF NOT EXISTS pet_vet_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_name TEXT,
    clinic_name TEXT,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    cost DECIMAL(10, 2),
    follow_up_date DATE,
    reminder BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet_id ON pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_date ON pet_vaccinations(date);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_expiration_date ON pet_vaccinations(expiration_date);

CREATE INDEX IF NOT EXISTS idx_pet_medications_pet_id ON pet_medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_medications_start_date ON pet_medications(start_date);
CREATE INDEX IF NOT EXISTS idx_pet_medications_end_date ON pet_medications(end_date);

CREATE INDEX IF NOT EXISTS idx_pet_vet_visits_pet_id ON pet_vet_visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vet_visits_date ON pet_vet_visits(date);
CREATE INDEX IF NOT EXISTS idx_pet_vet_visits_follow_up_date ON pet_vet_visits(follow_up_date);

-- Add trigger to update the updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pet_vaccinations_updated_at
BEFORE UPDATE ON pet_vaccinations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_medications_updated_at
BEFORE UPDATE ON pet_medications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_vet_visits_updated_at
BEFORE UPDATE ON pet_vet_visits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add row level security (RLS) policies
ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_vet_visits ENABLE ROW LEVEL SECURITY;

-- Allow users to select, insert, update, and delete their own pet health records
CREATE POLICY select_own_pet_vaccinations ON pet_vaccinations 
    FOR SELECT
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY insert_own_pet_vaccinations ON pet_vaccinations 
    FOR INSERT
    WITH CHECK (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY update_own_pet_vaccinations ON pet_vaccinations 
    FOR UPDATE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY delete_own_pet_vaccinations ON pet_vaccinations 
    FOR DELETE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY select_own_pet_medications ON pet_medications 
    FOR SELECT
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY insert_own_pet_medications ON pet_medications 
    FOR INSERT
    WITH CHECK (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY update_own_pet_medications ON pet_medications 
    FOR UPDATE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY delete_own_pet_medications ON pet_medications 
    FOR DELETE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY select_own_pet_vet_visits ON pet_vet_visits 
    FOR SELECT
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY insert_own_pet_vet_visits ON pet_vet_visits 
    FOR INSERT
    WITH CHECK (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY update_own_pet_vet_visits ON pet_vet_visits 
    FOR UPDATE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY delete_own_pet_vet_visits ON pet_vet_visits 
    FOR DELETE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())); 