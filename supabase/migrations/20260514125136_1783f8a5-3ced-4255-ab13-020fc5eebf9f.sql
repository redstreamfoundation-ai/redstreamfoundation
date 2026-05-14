-- Extend donors with chat-collected fields
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS id_proof_url text;

-- Private bucket for ID proof uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('donor-id-proofs', 'donor-id-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users manage files inside their own user-id folder
CREATE POLICY "Donors upload own id proof"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'donor-id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Donors view own id proof"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'donor-id-proofs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Donors update own id proof"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'donor-id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Donors delete own id proof"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'donor-id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);