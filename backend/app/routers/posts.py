from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.schemas.posts import CreatePostRequest
from backend.app.database import get_db
from backend.app.services import post_service

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.get("?limit=20")
def get_posts(limit: int = 20):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return {"message": f"List of posts with limit: {limit}"}

@router.post("/", response_model=CreatePostRequest)
def create_post(
    content: str = Form(...),
    category: str = Form(...),
    technology_ids: list[int] = Form([]),
    image_file: UploadFile = File(None),
    db_session: Session = Depends(get_db)
):
    current_user_id = "dummy_user_id"  # 仮のユーザーID、実際には認証情報から取得する必要があります
    # 投稿作成処理を実装
    post_response, exp_result = post_service.create_post(
        content=content,
        category=category,
        user_id=current_user_id,
        technology_ids=technology_ids,
        image_file=image_file,
        db_session=db_session
    )
    
    return {
        "post": post_response,
        "exp_result": exp_result
    }

@router.delete("/{post_id}")
def delete_post(post_id: int):
    # 投稿削除処理を実装
    return {"message": f"Post with id {post_id} deleted"}

@router.delete("/{post_id}")
def delete_post(post_id: int):
    # 投稿削除処理を実装
    return {"message": f"Post with id {post_id} deleted"}