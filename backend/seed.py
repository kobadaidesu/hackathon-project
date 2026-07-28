"""デモ用データ投入スクリプト(手動実行: python seed.py)

発表でそのまま見せられる内容にしてある。捨てる前提のダミーではない。

前提:
  - schema.sql が適用済みで tech_tags がシード済みであること
  - Supabase Auth 経由でユーザーが1人以上登録済みであること
    (users 行はトリガーで自動作成される。このスクリプトはauth.usersを作れない)

何度実行しても同じ状態になる(投稿・募集・ナイス・興味ありは毎回作り直す)。
ユーザーのプロフィールは既存の行を更新するだけで、行の追加・削除はしない。
"""

import sys

from sqlalchemy import text

from app.database import SessionLocal

# 既存ユーザーに順番に割り当てるプロフィール。
# 実在しそうな内容にしてあるのでデモでもそのまま使える。
USER_PROFILES = [
    {
        "display_name": "たなか",
        "bio": "Reactを勉強中です。毎日ちょっとずつ手を動かしています。",
        "learning_stage": "learning_basics",
        "experience_points": 30,
        "tech": ["React", "TypeScript", "Git"],
    },
    {
        "display_name": "さとう",
        "bio": "個人開発でWebアプリを作っています。バックエンド寄り。",
        "learning_stage": "personal_development",
        "experience_points": 120,
        "tech": ["Python", "FastAPI", "Supabase", "Docker"],
    },
    {
        "display_name": "すずき",
        "bio": "チーム開発に挑戦したいです。ハッカソン参加歴3回。",
        "learning_stage": "want_team_development",
        "experience_points": 80,
        "tech": ["TypeScript", "Next.js", "AWS"],
    },
    {
        "display_name": "やまだ",
        "bio": "プログラミングを始めたばかりです。よろしくお願いします!",
        "learning_stage": "want_to_start",
        "experience_points": 0,
        "tech": ["JavaScript"],
    },
]

# (投稿者のインデックス, 本文, カテゴリ, 技術タグ)
POSTS = [
    (0, "useEffectの依存配列でハマってましたが、やっと理解できました。無限ループの原因が自分でした。", "solved", ["React"]),
    (1, "FastAPIのDependsで認証を共通化しました。ルーターがすっきりして気持ちいい。", "learning", ["Python", "FastAPI"]),
    (2, "ハッカソン用のアプリ、タイムライン画面ができました。あとは投稿機能。", "work_in_progress", ["TypeScript", "Next.js"]),
    (3, "環境構築で1日溶けました…Node のバージョン違いって怖い。", "environment", ["JavaScript"]),
    (0, "TypeScriptの型パズルに挑戦中。Genericsがまだ手強いです。", "learning", ["TypeScript"]),
    (1, "SupabaseのRLSを有効にしたらAPIが全部403に。ポリシー書き忘れてました。", "error", ["Supabase"]),
    (2, "はじめてDockerでローカル環境を統一しました。もう「自分の環境だと動く」と言わなくて済む。", "new_technology", ["Docker"]),
    (0, "今日の学習: Reactのカスタムフック。ロジックを切り出すと一気に読みやすくなりますね。", "learning", ["React"]),
    (1, "個人開発のアイデア出し中。エンジニア向けの学習記録アプリを作りたい。", "idea", ["Python"]),
    (3, "Gitのブランチ運用をやっと理解しました。conflictも怖くない…はず。", "solved", ["Git"]),
]

# (募集者のインデックス, タイトル, 概要, 技術タグ, 希望学習段階, 初心者歓迎, ステータス)
RECRUITMENTS = [
    (
        1,
        "学習記録アプリを一緒に作りませんか",
        "エンジニア向けの学習記録アプリを作っています。フロントを触ってくれる方を探しています。週2〜3時間くらいのゆるいペースで進めたいです。",
        ["React", "TypeScript", "FastAPI"],
        "learning_basics",
        True,
        "open",
    ),
    (
        2,
        "ハッカソン用のチームメンバー募集",
        "来月のハッカソンに向けてチームを組みたいです。アイデア出しから一緒にやりましょう。デザインができる方も歓迎です。",
        ["Next.js", "Supabase"],
        "want_team_development",
        False,
        "open",
    ),
    (
        0,
        "もくもく会を一緒にやる人募集(募集終了)",
        "週末にオンラインでもくもく会をやっています。人数が集まったので一旦締め切りました。ありがとうございました!",
        ["Git"],
        None,
        True,
        "closed",
    ),
]

# (投稿インデックス, ナイスを送るユーザーのインデックス)
NICES = [(0, 1), (0, 2), (0, 3), (1, 0), (1, 2), (2, 0), (5, 1), (6, 3), (7, 1)]

# (募集インデックス, 興味ありを送るユーザーのインデックス)
INTERESTS = [(0, 0), (0, 2), (0, 3), (1, 0)]

# DMのデモ用。(送信者, 受信者, 本文, 既読か)
# 「興味あり → DMで会話開始」の導線が見えるように、募集者(さとう)と
# 興味ありを送った人(たなか)のやりとりを中心にしてある。
# 未読ありと既読済みを混ぜて、バッジの見え方を両方確認できるようにする。
MESSAGES = [
    (0, 1, "募集拝見しました！学習記録アプリ面白そうですね", True),
    (1, 0, "ありがとうございます！フロント触れる方を探してました", True),
    (0, 1, "Reactなら少し書けます。週2〜3時間くらいなら出せそうです", True),
    (1, 0, "ちょうどいいペースです。今週末に一度話しませんか？", False),
    (1, 0, "Discordでも大丈夫です", False),
    (2, 0, "ハッカソンの件、もしよければ一緒にどうですか", False),
    (0, 3, "環境構築の件、Nodeのバージョン揃えると直りますよ", True),
]


def main() -> None:
    db = SessionLocal()
    try:
        user_ids = [
            row[0]
            for row in db.execute(
                text("select id from users order by created_at")
            ).fetchall()
        ]
        if not user_ids:
            print(
                "users が0件です。先にSupabase Auth経由でアカウントを作ってください"
                "(トリガーでusers行が自動作成されます)。"
            )
            sys.exit(1)

        tag_ids = {
            name: tag_id
            for tag_id, name in db.execute(
                text("select id, name from tech_tags")
            ).fetchall()
        }

        print(f"users: {len(user_ids)}件 / tech_tags: {len(tag_ids)}件")

        # --- 作り直す(冪等にするため既存のデモデータを消す) ---
        # posts/recruitments を消せば nice_challenges と interests は
        # ON DELETE CASCADE で一緒に消える
        db.execute(text("delete from posts"))
        db.execute(text("delete from recruitments"))
        db.execute(text("delete from messages"))

        # --- ユーザーのプロフィール(既存行の更新のみ) ---
        for user_id, profile in zip(user_ids, USER_PROFILES):
            db.execute(
                text(
                    "update users set display_name=:n, bio=:b, learning_stage=:s,"
                    " experience_points=:xp, updated_at=now() where id=:i"
                ),
                {
                    "n": profile["display_name"],
                    "b": profile["bio"],
                    "s": profile["learning_stage"],
                    "xp": profile["experience_points"],
                    "i": user_id,
                },
            )
            db.execute(
                text("delete from user_technologies where user_id=:i"), {"i": user_id}
            )
            for tag_name in profile["tech"]:
                if tag_name in tag_ids:
                    db.execute(
                        text(
                            "insert into user_technologies (user_id, tech_tag_id)"
                            " values (:u, :t)"
                        ),
                        {"u": user_id, "t": tag_ids[tag_name]},
                    )
        updated = min(len(user_ids), len(USER_PROFILES))
        print(f"プロフィールを更新: {updated}件")

        # --- 投稿 ---
        post_ids = []
        for index, (author, content, category, techs) in enumerate(POSTS):
            if author >= len(user_ids):
                continue
            # 画像はプレースホルダ。Supabase Storage実装後は実URLに変わる
            image_url = f"https://picsum.photos/seed/post{index}/600/450"
            post_id = db.execute(
                text(
                    "insert into posts (user_id, image_url, content, category, created_at)"
                    " values (:u, :img, :c, :cat, now() - (:n || ' hours')::interval)"
                    " returning id"
                ),
                {
                    "u": user_ids[author],
                    "img": image_url,
                    "c": content,
                    "cat": category,
                    # 新着順が分かるように投稿時刻をずらす
                    "n": str(index * 3),
                },
            ).scalar()
            post_ids.append(post_id)
            for tag_name in techs:
                if tag_name in tag_ids:
                    db.execute(
                        text(
                            "insert into post_tech_tags (post_id, tech_tag_id)"
                            " values (:p, :t)"
                        ),
                        {"p": post_id, "t": tag_ids[tag_name]},
                    )
        print(f"投稿を作成: {len(post_ids)}件")

        # --- 募集 ---
        recruitment_ids = []
        for index, (owner, title, desc, techs, stage, beginner, status) in enumerate(
            RECRUITMENTS
        ):
            if owner >= len(user_ids):
                continue
            recruitment_id = db.execute(
                text(
                    "insert into recruitments (user_id, title, description,"
                    " desired_learning_stage, beginner_welcome, status, created_at)"
                    " values (:u, :t, :d, :s, :b, :st,"
                    " now() - (:n || ' hours')::interval) returning id"
                ),
                {
                    "u": user_ids[owner],
                    "t": title,
                    "d": desc,
                    "s": stage,
                    "b": beginner,
                    "st": status,
                    "n": str(index * 5),
                },
            ).scalar()
            recruitment_ids.append(recruitment_id)
            for tag_name in techs:
                if tag_name in tag_ids:
                    db.execute(
                        text(
                            "insert into recruitment_tech_tags (recruitment_id, tech_tag_id)"
                            " values (:r, :t)"
                        ),
                        {"r": recruitment_id, "t": tag_ids[tag_name]},
                    )
        print(f"募集を作成: {len(recruitment_ids)}件")

        # --- ナイス挑戦(0件・複数件の見え方を両方確認できるようにばらけさせる) ---
        nice_count = 0
        for post_index, user_index in NICES:
            if post_index >= len(post_ids) or user_index >= len(user_ids):
                continue
            db.execute(
                text(
                    "insert into nice_challenges (post_id, user_id) values (:p, :u)"
                    " on conflict do nothing"
                ),
                {"p": post_ids[post_index], "u": user_ids[user_index]},
            )
            nice_count += 1
        print(f"ナイス挑戦を作成: {nice_count}件")

        # --- 興味あり ---
        interest_count = 0
        for recruitment_index, user_index in INTERESTS:
            if recruitment_index >= len(recruitment_ids) or user_index >= len(user_ids):
                continue
            db.execute(
                text(
                    "insert into interests (recruitment_id, user_id) values (:r, :u)"
                    " on conflict do nothing"
                ),
                {"r": recruitment_ids[recruitment_index], "u": user_ids[user_index]},
            )
            interest_count += 1
        print(f"興味ありを作成: {interest_count}件")

        # --- ダイレクトメッセージ ---
        message_count = 0
        for index, (sender, receiver, body, is_read) in enumerate(MESSAGES):
            if sender >= len(user_ids) or receiver >= len(user_ids):
                continue
            db.execute(
                text(
                    "insert into messages (sender_id, receiver_id, body, read_at, created_at)"
                    " values (:s, :r, :b,"
                    "   case when :read then now() - (:n || ' minute')::interval else null end,"
                    "   now() - (:n || ' minute')::interval)"
                ),
                {
                    "s": user_ids[sender],
                    "r": user_ids[receiver],
                    "b": body,
                    "read": is_read,
                    # 会話の順序が分かるように送信時刻をずらす
                    "n": str((len(MESSAGES) - index) * 20),
                },
            )
            message_count += 1
        print(f"メッセージを作成: {message_count}件")

        db.commit()
        print("seed: 完了")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
