-- Migration: Add raw_data column to leads table
-- Required by prospector.ts (Instagram/Google search) and firecrawl webhook
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb;
