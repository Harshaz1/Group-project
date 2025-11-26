-- Migration to allow anonymous cash sales
ALTER TABLE bill MODIFY customer_name VARCHAR(255) NULL;
