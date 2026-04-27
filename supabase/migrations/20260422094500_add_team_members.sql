-- Team members table for SaaS role/user management
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    business_id UUID NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (
        role IN ('member', 'manager', 'admin')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    UNIQUE (business_id, email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can read team members" ON public.team_members FOR
SELECT TO authenticated USING (
        business_id IN (
            SELECT id
            FROM public.businesses
            WHERE
                user_id = auth.uid ()
        )
        OR public.is_admin (auth.uid ())
    );

CREATE POLICY "Business owners can insert team members" ON public.team_members FOR INSERT TO authenticated
WITH
    CHECK (
        business_id IN (
            SELECT id
            FROM public.businesses
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Business owners can update team members" ON public.team_members FOR
UPDATE TO authenticated USING (
    business_id IN (
        SELECT id
        FROM public.businesses
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Business owners can delete team members" ON public.team_members FOR DELETE TO authenticated USING (
    business_id IN (
        SELECT id
        FROM public.businesses
        WHERE
            user_id = auth.uid ()
    )
);

CREATE OR REPLACE FUNCTION public.handle_team_member_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_team_member_updated_at();