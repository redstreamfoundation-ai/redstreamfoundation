-- Donation intents (Support the Mission)
CREATE TABLE public.donation_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER NOT NULL CHECK (amount > 0 AND amount <= 10000000),
  email TEXT,
  name TEXT,
  message TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit donation intent"
  ON public.donation_intents FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    amount > 0
    AND amount <= 10000000
    AND (email IS NULL OR length(email) <= 254)
    AND (name IS NULL OR length(name) <= 120)
    AND (message IS NULL OR length(message) <= 1000)
  );

CREATE POLICY "Admins view all donation intents"
  ON public.donation_intents FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_donation_intents_created_at ON public.donation_intents (created_at DESC);

-- Contact form messages (footer)
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 254
    AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
    AND length(message) BETWEEN 1 AND 2000
  );

CREATE POLICY "Admins view all contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages (created_at DESC);