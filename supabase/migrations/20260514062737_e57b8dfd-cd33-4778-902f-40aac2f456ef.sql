
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending','approved','rejected'));

UPDATE public.donors SET status = 'approved' WHERE verified = true AND status = 'pending';

ALTER TABLE public.blood_requests
  ADD COLUMN IF NOT EXISTS admin_status text NOT NULL DEFAULT 'pending'
  CHECK (admin_status IN ('pending','approved','rejected'));
