-- Make stock column nullable since it's now optional in the form
ALTER TABLE products 
ALTER COLUMN stock DROP NOT NULL,
ALTER COLUMN stock SET DEFAULT 0;