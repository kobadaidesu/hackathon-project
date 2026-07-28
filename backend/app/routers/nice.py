from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user_id
from app.schemas.posts import NiceResponse
from app.services import post_service

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.post("/{post_id}/nice", response_model=NiceResponse)
def add_nice(
    post_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    # レスポンスに更新後のniceCount / isNicedByMeを入れる。
    # フロントは自分で+1せず、返ってきた値をそのままstateに入れる
    return post_service.toggle_nice(
        db_session=db, post_id=post_id, current_user_id=current_user_id
    )


@router.delete("/{post_id}/nice", response_model=NiceResponse)
def remove_nice(
    post_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return post_service.remove_nice(
        db_session=db, post_id=post_id, current_user_id=current_user_id
    )
