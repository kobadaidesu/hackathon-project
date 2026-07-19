from fastapi import APIRouter

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.get("?limit=20")
def get_posts(limit: int = 20):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return {"message": f"List of posts with limit: {limit}"}

@router.post("/")
def create_post():
    # 投稿作成処理を実装
    return {"message": "Post created"}

@router.delete("/{post_id}")
def delete_post(post_id: int):
    # 投稿削除処理を実装
    return {"message": f"Post with id {post_id} deleted"}