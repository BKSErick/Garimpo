-- Add product_description and icp_description to campaigns
-- These fields come from the "Produto" and "Público (ICP)" steps of the Garimpar flow
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS product_description TEXT,
  ADD COLUMN IF NOT EXISTS icp_description TEXT;
