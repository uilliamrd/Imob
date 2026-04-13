-- migration_v6: página customizada para lançamentos

ALTER TABLE developments
  ADD COLUMN IF NOT EXISTS custom_page_html  text,
  ADD COLUMN IF NOT EXISTS custom_page_type  text CHECK (custom_page_type IN ('html', 'json'));
