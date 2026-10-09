create type source_type as enum ('hh', 'manual');

create type application_status as enum ('interested', 'applied', 'test_task', 'interview', 'offer', 'rejected', 'withdrawn', 'skipped');

create type search_mode as enum ('all_words', 'any_word');

create table users (
  id  int primary key generated always as identity,
  email text  not null unique,
  password_hash text not null,
  telegram_chat_id bigint,
  created_at timestamptz default now() not null
);

create table companies (
  id int primary key generated always as identity,
  source source_type not null,
  external_id text,
  name text not null,

  unique (source, external_id)
);

create table vacancies (
  id int primary key generated always as identity,
  source source_type not null,
  external_id text,
  owner_id int references users(id) on delete cascade,
  company_id int not null references companies(id),
  title text not null,
  url text not null, 
  city text,
  salary_from int,
  salary_to int,
  currency varchar(3),
  experience text,
  schedule text,
  description text,
  published_at timestamptz,
  first_seen_at timestamptz default now() not null,

  unique(source, external_id)
);

create table user_vacancies (
  user_id int not null references users(id) on delete cascade,
  vacancy_id int not null references vacancies(id) on delete cascade,
  status application_status,
  is_viewed boolean not null default false,
  status_changed_at timestamptz,
  note text,

  primary key (user_id, vacancy_id)
);

create table saved_searches(
  id int primary key generated always as identity,
  user_id int not null references users(id) on delete cascade,
  name text not null,
  mode search_mode not null default 'all_words',
  include_words text[] not null default '{}',
  exclude_words text[] not null default '{}',
  city text,
  experience text,
  is_active boolean not null default true, 
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table search_results (
  search_id int not null references saved_searches(id) on delete cascade,
  vacancy_id int not null references vacancies(id) on delete cascade,
  found_at timestamptz not null default now(),

  primary key (search_id, vacancy_id)
);

create table hidden_companies (
  user_id int not null references users(id) on delete cascade,
  company_id int not null references companies(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (user_id, company_id)
);

