-- Ristorante Si Chef — schema database
-- Esegui con: npm run db:setup
-- Idempotente: puoi rilanciarlo senza perdere dati.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- admin
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  name          text not null default 'Admin',
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists login_attempts (
  id         bigserial primary key,
  ip         text not null default '',
  email      text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_created_idx on login_attempts (created_at desc);

-- ---------------------------------------------------------------- allergeni
create table if not exists allergens (
  code        text primary key,
  name        text not null,
  short_name  text not null,
  emoji       text not null default '•',
  description text not null default '',
  sort_order  int not null default 0
);

insert into allergens (code, name, short_name, emoji, description, sort_order) values
  ('gluten',      'Cereali contenenti glutine', 'Glutine',   '🌾', 'Grano, segale, orzo, avena e derivati.', 1),
  ('crustaceans', 'Crostacei',                  'Crostacei', '🦐', 'Gamberi, granchi, aragoste e derivati.', 2),
  ('eggs',        'Uova',                       'Uova',      '🥚', 'Uova e prodotti a base di uova.', 3),
  ('fish',        'Pesce',                      'Pesce',     '🐟', 'Pesce e prodotti a base di pesce.', 4),
  ('peanuts',     'Arachidi',                   'Arachidi',  '🥜', 'Arachidi e derivati.', 5),
  ('soy',         'Soia',                       'Soia',      '🫘', 'Soia e prodotti a base di soia.', 6),
  ('milk',        'Latte',                      'Latte',     '🥛', 'Latte e prodotti lattiero-caseari (incluso lattosio).', 7),
  ('nuts',        'Frutta a guscio',            'Frutta a guscio', '🌰', 'Mandorle, nocciole, noci, pistacchi, anacardi.', 8),
  ('celery',      'Sedano',                     'Sedano',    '🥬', 'Sedano e derivati.', 9),
  ('mustard',     'Senape',                     'Senape',    '🌭', 'Senape e prodotti a base di senape.', 10),
  ('sesame',      'Sesamo',                     'Sesamo',    '🫓', 'Semi di sesamo e derivati.', 11),
  ('sulphites',   'Solfiti',                    'Solfiti',   '🍷', 'Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg.', 12),
  ('lupin',       'Lupini',                     'Lupini',    '🌼', 'Lupini e prodotti a base di lupini.', 13),
  ('molluscs',    'Molluschi',                  'Molluschi', '🦑', 'Vongole, cozze, calamari, polpi e derivati.', 14)
on conflict (code) do update set
  name = excluded.name, short_name = excluded.short_name, emoji = excluded.emoji,
  description = excluded.description, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------- categorie
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tagline     text not null default '',
  description text not null default '',
  kind        text not null default 'food' check (kind in ('food', 'drink')),
  emoji       text not null default '',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- piatti
create table if not exists menu_items (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references categories(id) on delete cascade,
  name           text not null,
  description    text not null default '',
  price          numeric(8,2) not null default 0,
  image_url      text not null default '',
  is_available   boolean not null default true,
  is_featured    boolean not null default false,
  is_vegan       boolean not null default false,
  is_vegetarian  boolean not null default false,
  is_gluten_free boolean not null default false,
  is_spicy       boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists menu_items_category_idx on menu_items (category_id, sort_order);

create table if not exists menu_item_allergens (
  item_id      uuid not null references menu_items(id) on delete cascade,
  allergen_code text not null references allergens(code) on delete cascade,
  primary key (item_id, allergen_code)
);

-- ---------------------------------------------------------------- prenotazioni
create table if not exists reservations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null default '',
  phone        text not null,
  party_size   int not null check (party_size between 1 and 30),
  date         date not null,
  time         text not null,
  area         text not null default 'sala' check (area in ('sala', 'dehor', 'veranda', 'privato')),
  occasion     text not null default '',
  notes        text not null default '',
  status       text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes  text not null default '',
  source       text not null default 'sito',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists reservations_date_idx on reservations (date, time);
create index if not exists reservations_created_idx on reservations (created_at desc);

create table if not exists closed_dates (
  date   date primary key,
  reason text not null default ''
);

-- ---------------------------------------------------------------- orari
create table if not exists opening_hours (
  day_of_week  int primary key check (day_of_week between 0 and 6),
  label        text not null,
  lunch_open   text,
  lunch_close  text,
  dinner_open  text,
  dinner_close text,
  is_closed    boolean not null default false
);

insert into opening_hours (day_of_week, label, lunch_open, lunch_close, dinner_open, dinner_close, is_closed) values
  (1, 'Lunedì',    '10:30', '14:30', '17:30', '22:30', false),
  (2, 'Martedì',   '10:30', '14:30', '17:30', '22:30', false),
  (3, 'Mercoledì', '10:30', '14:30', '17:30', '22:30', false),
  (4, 'Giovedì',   '10:30', '14:30', '17:30', '22:30', false),
  (5, 'Venerdì',   '10:30', '14:30', '17:30', '22:30', false),
  (6, 'Sabato',    '10:30', '14:30', '17:30', '23:00', false),
  (0, 'Domenica',  '10:30', '14:30', '17:30', '23:00', false)
on conflict (day_of_week) do update set
  label = excluded.label, lunch_open = excluded.lunch_open, lunch_close = excluded.lunch_close,
  dinner_open = excluded.dinner_open, dinner_close = excluded.dinner_close, is_closed = excluded.is_closed;

-- ---------------------------------------------------------------- ordini
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  name           text not null,
  email          text not null default '',
  phone          text not null,
  fulfilment     text not null default 'pickup' check (fulfilment in ('pickup', 'delivery')),
  address        text not null default '',
  pickup_time    text not null default '',
  notes          text not null default '',
  subtotal       numeric(8,2) not null default 0,
  delivery_fee   numeric(8,2) not null default 0,
  total          numeric(8,2) not null default 0,
  status         text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')),
  admin_notes    text not null default '',
  source         text not null default 'sito',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status, created_at desc);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name         text not null,
  price        numeric(8,2) not null default 0,
  quantity     int not null default 1 check (quantity between 1 and 50)
);
create index if not exists order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------- fedeltà
create table if not exists loyalty_members (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  email       text not null unique,
  phone       text not null default '',
  birthday    date,
  points      int not null default 0 check (points >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists loyalty_created_idx on loyalty_members (created_at desc);

create table if not exists loyalty_transactions (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references loyalty_members(id) on delete cascade,
  points     int not null,
  reason     text not null default '',
  order_id   uuid references orders(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_tx_member_idx on loyalty_transactions (member_id, created_at desc);

-- ---------------------------------------------------------------- messaggi
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null default '',
  phone      text not null default '',
  subject    text not null default '',
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on contact_messages (created_at desc);

-- ---------------------------------------------------------------- eventi
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  subtitle     text not null default '',
  description  text not null default '',
  image_url    text not null default '',
  event_date   date,
  event_time   text not null default '',
  badge        text not null default '',
  cta_label    text not null default 'Prenota',
  is_published boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- promo
create table if not exists promos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  badge        text not null default '',
  day_of_week  int,
  image_url    text not null default '',
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- gallery
create table if not exists gallery_images (
  id           uuid primary key default gen_random_uuid(),
  url          text not null,
  caption      text not null default '',
  is_published boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- settings
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- newsletter
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);
