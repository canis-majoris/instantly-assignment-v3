-- Add isDeleted column for soft delete functionality
ALTER TABLE emails ADD COLUMN is_deleted INTEGER DEFAULT 0 NOT NULL;
