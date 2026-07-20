from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import get_current_user_id

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # デプロイ時にVercelのURLを追加
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ローカル開発でSupabase Authを使わず動かす場合 ---
# 下2行のコメントを外すと、全APIがテストユーザーとしてログイン済み扱いになる
# TEST_USER_ID = "2b373d44-179a-449a-8589-fc..."  # ←控えたUUIDのフル文字列に置き換え
# app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/me-check")
def me_check(user_id: str = Depends(get_current_user_id)):
    return {"userId": user_id}