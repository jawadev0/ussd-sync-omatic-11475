-- Create enum types
CREATE TYPE public.operator_type AS ENUM ('INWI', 'ORANGE', 'IAM');
CREATE TYPE public.ussd_type AS ENUM ('ACTIVATION', 'CHECK', 'TOPUP');
CREATE TYPE public.command_status AS ENUM ('pending', 'executing', 'success', 'failed', 'quota_exceeded');

-- Create devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  sim_count INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sims table
CREATE TABLE public.sims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  carrier operator_type NOT NULL,
  daily_quota INTEGER NOT NULL DEFAULT 20,
  used_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ussd_commands table
CREATE TABLE public.ussd_commands (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  type ussd_type NOT NULL,
  operator operator_type NOT NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  sim_id UUID REFERENCES public.sims(id) ON DELETE CASCADE NOT NULL,
  status command_status NOT NULL DEFAULT 'pending',
  auto_executed BOOLEAN NOT NULL DEFAULT false,
  result TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ussd_commands ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for this app)
CREATE POLICY "Allow all access to devices" ON public.devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sims" ON public.sims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ussd_commands" ON public.ussd_commands FOR ALL USING (true) WITH CHECK (true);

-- Create function to reset daily quota
CREATE OR REPLACE FUNCTION public.reset_sim_daily_quota()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sims
  SET used_today = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_sims_device_id ON public.sims(device_id);
CREATE INDEX idx_ussd_commands_status ON public.ussd_commands(status);
CREATE INDEX idx_ussd_commands_created_at ON public.ussd_commands(created_at);
CREATE INDEX idx_ussd_commands_device_sim ON public.ussd_commands(device_id, sim_id);