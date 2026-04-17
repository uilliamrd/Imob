-- migration_v15: plan field on organizations

alter table organizations
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'starter', 'pro', 'enterprise'));

comment on column organizations.plan is 'Plano contratado pela organização: free | starter | pro | enterprise';
