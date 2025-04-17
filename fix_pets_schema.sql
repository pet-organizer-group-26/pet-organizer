-- Add pet_type column to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS pet_type TEXT;

-- Check if there are any records missing pet_type values
-- (This skips the step that was trying to copy from the non-existent 'type' column)

-- Create a function to handle insert/update for backward compatibility
CREATE OR REPLACE FUNCTION handle_pets_type_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if type column exists - if not, just ensure pet_type has a value
  -- In a real trigger we'd dynamically check column existence, but for now we'll
  -- adjust the logic to only rely on pet_type
  
  -- For now, simply ensure NEW.pet_type has a value
  IF NEW.pet_type IS NULL THEN
    -- Set a default value if pet_type is NULL
    NEW.pet_type := 'Other';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to ensure pet_type always has a value
DROP TRIGGER IF EXISTS sync_pets_type_insert ON pets;
CREATE TRIGGER sync_pets_type_insert
BEFORE INSERT ON pets
FOR EACH ROW
EXECUTE FUNCTION handle_pets_type_sync();

DROP TRIGGER IF EXISTS sync_pets_type_update ON pets;
CREATE TRIGGER sync_pets_type_update
BEFORE UPDATE ON pets
FOR EACH ROW
EXECUTE FUNCTION handle_pets_type_sync();

-- Update your Pet TypeScript definition to only use pet_type
-- Example: 
-- type Pet = {
--   id: string;
--   name: string;
--   pet_type: string;  // Use this instead of 'type'
--   // other fields...
-- }; 