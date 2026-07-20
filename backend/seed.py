"""デモ用ダミーデータ投入スクリプト(手動実行: python seed.py)

TODO: 投稿・募集のダミーデータを追加する
テストユーザーはAuth経由で作成済み(トリガーでusers行あり)
"""

from app.database import SessionLocal


def main():
    db = SessionLocal()
    try:
        print("seed: まだ何もしません(TODO)")
    finally:
        db.close()


if __name__ == "__main__":
    main()