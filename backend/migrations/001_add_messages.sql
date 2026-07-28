-- DM機能: messages テーブルの追加
--
-- schema.sql は drop から始まる冪等スクリプトなので、既にデータが入っている
-- DBに対しては再実行できない(全部消える)。既存DBへはこのファイルを
-- SupabaseのSQL Editorに貼って実行する。
--
-- 追加のみで既存データには触れない。戻すときは drop table messages;

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  body varchar(1000) not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_pair
  on messages (sender_id, receiver_id, created_at desc);

create index if not exists idx_messages_unread
  on messages (receiver_id) where read_at is null;

-- 他テーブルと同じくRLSは有効化のみ(ポリシーなし = anonからの直アクセス全拒否)。
-- データアクセスはFastAPI経由のみの想定。
alter table messages enable row level security;
