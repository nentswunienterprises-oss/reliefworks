create table if not exists public.document_composer_drafts (
  id serial primary key,
  owner_email text not null,
  name text not null,
  document_type varchar(40) not null,
  markdown text not null,
  composer_state jsonb not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now()
);

create index if not exists idx_document_composer_drafts_owner_email
  on public.document_composer_drafts (owner_email, updated_at desc);
