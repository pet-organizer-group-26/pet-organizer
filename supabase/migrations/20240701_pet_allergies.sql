-- Create pet allergies table
CREATE TABLE IF NOT EXISTS pet_allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    reaction TEXT,
    diagnosed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_allergies_pet_id ON pet_allergies(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_allergies_severity ON pet_allergies(severity);

-- Add trigger to update the updated_at timestamp
CREATE TRIGGER update_pet_allergies_updated_at
BEFORE UPDATE ON pet_allergies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add row level security (RLS) policies
ALTER TABLE pet_allergies ENABLE ROW LEVEL SECURITY;

-- Allow users to select, insert, update, and delete their own pet allergies
CREATE POLICY select_own_pet_allergies ON pet_allergies 
    FOR SELECT
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY insert_own_pet_allergies ON pet_allergies 
    FOR INSERT
    WITH CHECK (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY update_own_pet_allergies ON pet_allergies 
    FOR UPDATE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));

CREATE POLICY delete_own_pet_allergies ON pet_allergies 
    FOR DELETE
    USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())); 