from fastapi import APIRouter

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.post("{post_id}/nice")
def add_nice(post_id: int):
    # 投稿に対して「いいね」を追加する処理を実装
    return {"message": f"Nice added to post with id {post_id}"}

@router.delete("{post_id}/nice")
def remove_nice(post_id: int):
    # 投稿に対して「いいね」を削除する処理を実装
    return {"message": f"Nice removed from post with id {post_id}"}