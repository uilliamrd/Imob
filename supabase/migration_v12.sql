-- Suporte a documentos anexados em empreendimentos
-- Ex: tabela de preços em PDF, memorial descritivo, plantas, etc.

alter table developments
  add column if not exists documents jsonb not null default '[]';

comment on column developments.documents is
  'Array de documentos: [{name: string, url: string, type: string}]';
