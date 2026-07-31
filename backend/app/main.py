from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import get_current_user_id
from app.routers import messages, nice, posts, recruitments, tech_tags, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # 開発(http)と本番(https)を並べて1本の正規表現で受ける。
    # Starletteは fullmatch で判定するので、両端を ^...$ で閉じている。
    #
    # 【開発】ポートは問わない。
    # 5173が埋まっているとViteは5174で起動するため、決め打ちにすると
    # ブラウザ側でプリフライトが弾かれて「Failed to fetch」になる。
    # localhost に加えて 127.0.0.1 とプライベートIP(RFC1918)も許可する。
    # 実機確認でスマホから開くと Origin が http://192.168.x.x:5173 になり、
    # localhost 決め打ちだと全リクエストがプリフライトで落ちるため。
    # グローバルIPは意図的に入れていない(httpで外から叩けるようにしない)。
    #
    # 【本番】Vercelはコミットごとにプレビュー用の別サブドメインを発行する
    # (例: xxx-git-feature-abc-user.vercel.app)。URLを1本に決め打ちすると
    # 本番だけ動いてプレビューが全滅するので、サブドメインは総当たりで受ける。
    # ここを絞りたい場合はプロジェクト名を頭に付ける(READMEのデプロイ節を参照)。
    # 独自ドメインを当てたときは、その分岐をここに足す必要がある。
    allow_origin_regex=(
        r"^(?:"
        r"http://(?:localhost"
        r"|127\.0\.0\.1"
        r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
        r"|192\.168\.\d{1,3}\.\d{1,3}"
        r"|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}"
        r"):\d+"
        r"|https://[a-z0-9-]+\.vercel\.app"
        r")$"
    ),
    # 許可はすべて上の正規表現側で表現しているので、こちらは空のままでよい
    allow_origins=[],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ローカル開発でSupabase Authを使わず動かす場合 ---
# 下2行のコメントを外すと、全APIがテストユーザーとしてログイン済み扱いになる
# TEST_USER_ID = "2b373d44-179a-449a-8589-fc..."  # ←控えたUUIDのフル文字列に置き換え
# app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID


app.include_router(users.router)
app.include_router(posts.router)
app.include_router(nice.router)
app.include_router(recruitments.router)
app.include_router(tech_tags.router)
app.include_router(messages.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/me-check")
def me_check(user_id: str = Depends(get_current_user_id)):
    return {"userId": user_id}