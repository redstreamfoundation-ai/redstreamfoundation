
-- Roles enum + table (separate from profiles to prevent privilege escalation)
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Donor profile
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  locality TEXT NOT NULL,
  pincode TEXT NOT NULL,
  profession TEXT,
  last_donation_date DATE,
  verified BOOLEAN NOT NULL DEFAULT false,
  reliability_score INT NOT NULL DEFAULT 95,
  total_donations INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability prefs
CREATE TABLE public.donor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weekdays BOOLEAN NOT NULL DEFAULT true,
  weekends BOOLEAN NOT NULL DEFAULT true,
  slot_morning BOOLEAN NOT NULL DEFAULT true,
  slot_afternoon BOOLEAN NOT NULL DEFAULT true,
  slot_evening BOOLEAN NOT NULL DEFAULT true,
  slot_night BOOLEAN NOT NULL DEFAULT false,
  emergency_only BOOLEAN NOT NULL DEFAULT false,
  radius_km INT NOT NULL DEFAULT 8,
  active BOOLEAN NOT NULL DEFAULT true,
  notify_push BOOLEAN NOT NULL DEFAULT true,
  notify_sms BOOLEAN NOT NULL DEFAULT true,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
  quiet_hours BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blood requests
CREATE TYPE public.urgency_level AS ENUM ('critical', 'within-2h', 'within-24h', 'planned');
CREATE TYPE public.request_status AS ENUM ('pending', 'matching', 'fulfilled', 'cancelled');

CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL,
  component TEXT NOT NULL DEFAULT 'Whole Blood',
  units INT NOT NULL DEFAULT 1,
  urgency urgency_level NOT NULL,
  hospital TEXT NOT NULL,
  locality TEXT NOT NULL,
  patient_age TEXT,
  attendant_name TEXT NOT NULL,
  attendant_phone TEXT NOT NULL,
  proof_uploaded BOOLEAN NOT NULL DEFAULT false,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donor responses to requests
CREATE TYPE public.match_decision AS ENUM ('accepted', 'declined', 'later');

CREATE TABLE public.request_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision match_decision NOT NULL,
  available_in_hours INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, donor_user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_roles policies (admin-only management; users can read their own)
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Donors policies
CREATE POLICY "Donors view own profile" ON public.donors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all donors" ON public.donors
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors insert own profile" ON public.donors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Donors update own profile" ON public.donors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Donors delete own profile" ON public.donors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Availability policies
CREATE POLICY "Donors manage own availability" ON public.donor_availability
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all availability" ON public.donor_availability
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Blood requests policies
CREATE POLICY "Authenticated view active requests" ON public.blood_requests
  FOR SELECT TO authenticated USING (status IN ('pending', 'matching'));
CREATE POLICY "Creator views own requests" ON public.blood_requests
  FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Admins view all requests" ON public.blood_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated create requests" ON public.blood_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator updates own request" ON public.blood_requests
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Admins update any request" ON public.blood_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Request matches policies
CREATE POLICY "Donor views own matches" ON public.request_matches
  FOR SELECT TO authenticated USING (auth.uid() = donor_user_id);
CREATE POLICY "Request creator views matches" ON public.request_matches
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.blood_requests r
    WHERE r.id = request_id AND r.created_by = auth.uid()
  ));
CREATE POLICY "Admins view all matches" ON public.request_matches
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Donor creates own match" ON public.request_matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_user_id);
CREATE POLICY "Donor updates own match" ON public.request_matches
  FOR UPDATE TO authenticated USING (auth.uid() = donor_user_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_donors_updated BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_availability_updated BEFORE UPDATE ON public.donor_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX idx_donors_blood_group ON public.donors(blood_group);
CREATE INDEX idx_donors_locality ON public.donors(locality);
CREATE INDEX idx_matches_request ON public.request_matches(request_id);
CREATE INDEX idx_matches_donor ON public.request_matches(donor_user_id);
