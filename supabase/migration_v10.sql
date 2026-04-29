-- migration_v10: add is_featured to property_listings

alter table property_listings
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_property_listings_user_featured
  on property_listings(user_id, is_featured);

create index if not exists idx_property_listings_org_featured
  on property_listings(org_id, is_featured);
