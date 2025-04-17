-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets' 
ORDER BY ordinal_position;

-- Check if any rows exist in the pets table
SELECT COUNT(*) FROM pets;

-- If rows exist, check the first few records
SELECT * FROM pets LIMIT 5; 