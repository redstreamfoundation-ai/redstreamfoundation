-- Add source tracking to distinguish chatbot submissions from regular form submissions
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';

ALTER TABLE public.blood_requests
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';

CREATE INDEX IF NOT EXISTS idx_donors_source ON public.donors(source);
CREATE INDEX IF NOT EXISTS idx_blood_requests_source ON public.blood_requests(source);