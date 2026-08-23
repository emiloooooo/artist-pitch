-- Storage for the "Melde mich an" shortcut in the Haftpflicht chat
-- (js/funnel.js -> POST /api/signup -> this table).
--
-- Project: nimmersatt-hermes (ref nrjeqwedzsrltykidpml, eu-west-1).
-- A visitor who does not want to answer the whole funnel leaves name + email
-- here and NIMMERSATT / the insurer gets back to them by hand. No tariff data,
-- no risk answers, no bank data.
--
-- Rerunnable: every statement is idempotent.

create table if not exists public.insurance_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  lang        text not null default 'de',
  ref         text,                                       -- the NIM-xxxxxx the visitor sees in the chat
  source      text not null default 'artist-pitch/insurance-chat',
  status      text not null default 'new',                -- worked by hand in the Supabase table editor
  note        text,
  constraint insurance_signups_lang_check   check (lang in ('de', 'en')),
  constraint insurance_signups_status_check check (status in ('new', 'contacted', 'done', 'discarded')),
  constraint insurance_signups_email_check  check (position('@' in email) > 1)
);

comment on table public.insurance_signups is
  'Sign-ups from the Haftpflicht chat on nimmersatt-pitch.vercel.app. Written by /api/signup with the service_role key. Contacted by hand.';

-- The only two reads that happen: newest first, and open items.
create index if not exists insurance_signups_created_at_idx on public.insurance_signups (created_at desc);
create index if not exists insurance_signups_open_idx on public.insurance_signups (created_at desc) where status = 'new';

-- RLS on, deliberately WITHOUT policies: anon and authenticated get nothing at
-- all. The only writer is the serverless function with the service_role key,
-- which bypasses RLS; the only reader is the Supabase dashboard. Personal data
-- of applicants has no business being readable through PostgREST.
alter table public.insurance_signups enable row level security;
revoke all on table public.insurance_signups from anon, authenticated;
