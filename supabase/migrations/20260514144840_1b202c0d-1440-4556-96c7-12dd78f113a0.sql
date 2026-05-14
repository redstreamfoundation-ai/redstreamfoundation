-- Add columns to blood_requests
ALTER TABLE public.blood_requests
  ADD COLUMN IF NOT EXISTS patient_name text,
  ADD COLUMN IF NOT EXISTS requisition_url text;

-- Storage bucket for requisition slips (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blood-requisitions', 'blood-requisitions', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for the bucket
CREATE POLICY "Users upload own requisitions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blood-requisitions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users view own requisitions"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'blood-requisitions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own requisitions"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'blood-requisitions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins view all requisitions"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'blood-requisitions'
  AND public.has_role(auth.uid(), 'admin')
);
