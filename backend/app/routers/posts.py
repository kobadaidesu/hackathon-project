from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.schemas.posts import CreatePostResponse, PostCategory
from app.database import get_db
from app.dependencies import get_current_user_id
from app.services import post_service

router = APIRouter(prefix="/api/posts", tags=["Posts"])

@router.get("")
def get_posts(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
    limit: int = 20
):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return post_service,get_posts(db_session=db, current_user_id=current_user_id, limit=limit)

@router.post("/", response_model=CreatePostResponse)
def create_post(
    content: str = Form(...),
    category: PostCategory = Form(...),
    technology_ids: list[int] = Form([]),
    image_file: UploadFile = File(None),
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_db)
):
    # 投稿作成処理を実装
    return post_service.create_post(
        content=content,
        category=category,
        user_id=current_user_id,
        technology_ids=technology_ids,
        image_file=image_file,
        db_session=db_session
    )

@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # 投稿削除処理を実装
    post_service.delete_post(db_session=db, post_id=post_id, current_user_id=current_user_id)
    return {"message": f"Post with id {post_id} deleted"}