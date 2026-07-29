-- 画像なしでも投稿できるようにする: posts.image_url を NULL 許容へ
--
-- schema.sql は drop から始まる冪等スクリプトなので、既にデータが入っている
-- DBに対しては再実行できない(全部消える)。既存DBへはこのファイルを
-- SupabaseのSQL Editorに貼って実行する。
--
-- 制約をゆるめるだけで既存行には触れない(既存の投稿はすべて画像URLを持っている)。
-- 戻すときは、先に画像なしの投稿を消してから:
--   delete from posts where image_url is null;
--   alter table posts alter column image_url set not null;

alter table posts alter column image_url drop not null;
