USE sanraw_db;

-- Add checking if column exists before adding is complex in pure MySQL without procedures, 
-- but straightforward ALTER statements are usually fine if we know the state.
-- If you are unsure, you can run these lines one by one.

ALTER TABLE user ADD COLUMN recovery_email VARCHAR(255) DEFAULT NULL;
ALTER TABLE user ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';
