-- Add company_id column to profiles for multi-company admin access
ALTER TABLE public.profiles 
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Create index for better query performance
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);

-- Update Pedro Tavera's profile to link to POMBAL
UPDATE public.profiles 
SET company_id = '0d47fd05-b7e6-49a1-985a-70b65305e695'
WHERE user_id = '0fc54d43-4104-4cdf-9811-6841a07e2beb';