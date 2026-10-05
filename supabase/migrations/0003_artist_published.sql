-- Per-person public gate for the gallery roster.
-- Named collaborators stay unpublished until each one approves.

alter table artists
  add column if not exists published boolean not null default false;

update artists
  set published = true
  where slug = 'project-sixxx';

update artists
  set published = false
  where slug in (
    'christian-boye-larsen',
    'eliot-kohek',
    'murray-brothers',
    'jesse-levitt',
    'rob-borbas',
    'slot-open-01',
    'slot-open-02'
  );
