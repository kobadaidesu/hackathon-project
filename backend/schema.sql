-- エンジニア版Instagram スキーマ定義
-- SupabaseのSQL Editorに全文貼り付けて実行する
-- 冪等にしてあるので再実行OK(ただしデータは全部消えるので注意)

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists messages cascade;
drop table if exists nice_challenges cascade;
drop table if exists interests cascade;
drop table if exists user_technologies cascade;
drop table if exists post_tech_tags cascade;
drop table if exists recruitment_tech_tags cascade;
drop table if exists posts cascade;
drop table if exists recruitments cascade;
drop table if exists tech_tags cascade;
drop table if exists users cascade;


-- ユーザー。auth.usersと1:1で、行はトリガーで自動作成される
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(30),
  bio varchar(300),
  icon_url text,
  learning_stage varchar(30),
  github_url varchar(200),
  contact_url varchar(200),
  experience_points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 技術タグは固定マスタ(選択式)。追加はこのファイルを直す
create table tech_tags (
  id serial primary key,
  name varchar(30) unique not null
);

insert into tech_tags (name) values
  ('React'), ('TypeScript'), ('JavaScript'), ('Next.js'), ('Vue.js'),
  ('Node.js'), ('Python'), ('FastAPI'), ('Django'), ('Go'),
  ('Rust'), ('Java'), ('Kotlin'), ('Swift'), ('Flutter'),
  ('PHP'), ('Ruby'), ('C++'), ('SQL'), ('Supabase'),
  ('AWS'), ('Docker'), ('Git'), ('Linux'), ('Unity'),
  ('機械学習'), ('AtCoder');

create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  -- 画像は任意。文章だけの投稿を許す(migrations/002_post_image_optional.sql)
  image_url text,
  content varchar(300) not null,
  category varchar(30) not null,
  created_at timestamptz not null default now()
);

create index idx_posts_created_at on posts (created_at desc);
create index idx_posts_user_created on posts (user_id, created_at desc);

create table recruitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title varchar(50) not null,
  description varchar(500) not null,
  desired_learning_stage varchar(30),
  beginner_welcome boolean not null default false,
  status varchar(10) not null default 'open',
  created_at timestamptz not null default now()
);

create index idx_recruitments_created_at on recruitments (created_at desc);

-- 中間テーブル
create table user_technologies (
  user_id uuid not null references users(id) on delete cascade,
  tech_tag_id int not null references tech_tags(id) on delete cascade,
  primary key (user_id, tech_tag_id)
);

create table post_tech_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tech_tag_id int not null references tech_tags(id) on delete cascade,
  primary key (post_id, tech_tag_id)
);

create table recruitment_tech_tags (
  recruitment_id uuid not null references recruitments(id) on delete cascade,
  tech_tag_id int not null references tech_tags(id) on delete cascade,
  primary key (recruitment_id, tech_tag_id)
);

-- ナイス挑戦と興味あり。複合PKで二重送信を防ぐ(重複時はAPIが409を返す)
create table nice_challenges (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table interests (
  recruitment_id uuid not null references recruitments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recruitment_id, user_id)
);

-- ダイレクトメッセージ。
-- 会話は「2人の組み合わせ」から導出するので conversations テーブルは持たない。
-- read_at が null のものが未読。
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  body varchar(1000) not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- 特定の相手とのやりとりを新着順に引くため
create index idx_messages_pair on messages (sender_id, receiver_id, created_at desc);
-- 未読件数の集計用。部分インデックスなので既読が増えても太らない
create index idx_messages_unread on messages (receiver_id) where read_at is null;

-- auth.usersに登録が入ったらpublic.usersにも行を作る
-- security definerを付けないと権限エラーで動かないので注意
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLSは全テーブル有効化のみ(ポリシーなし=anonからの直アクセス全拒否)
-- データアクセスはFastAPI経由のみの想定
alter table users enable row level security;
alter table tech_tags enable row level security;
alter table posts enable row level security;
alter table recruitments enable row level security;
alter table user_technologies enable row level security;
alter table post_tech_tags enable row level security;
alter table recruitment_tech_tags enable row level security;
alter table nice_challenges enable row level security;
alter table interests enable row level security;
alter table messages enable row level security;