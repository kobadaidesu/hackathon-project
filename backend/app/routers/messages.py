from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user_id
from app.schemas.messages import (
    ConversationListResponse,
    MessageCreate,
    MessageListResponse,
    MessageResponse,
    UnreadCountResponse,
)
from app.services import message_service

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.get("", response_model=ConversationListResponse)
def get_conversations(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    # 相手ごとに最新1件と未読数をまとめた一覧(新着順)
    return message_service.get_conversations(
        db_session=db, current_user_id=current_user_id
    )


# /{user_id} より先に定義すること。
# 逆にすると user_id="unread-count" として解釈される(users.pyの /me と同じ理由)
@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    # ヘッダーのバッジ用
    return message_service.count_unread(db_session=db, current_user_id=current_user_id)


@router.get("/{user_id}", response_model=MessageListResponse)
def get_messages_with(
    user_id: str,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    # 取得と同時に、相手からの未読を既読にする
    return message_service.get_messages_with(
        db_session=db,
        current_user_id=current_user_id,
        partner_id=user_id,
        limit=limit,
    )


@router.post("/{user_id}", response_model=MessageResponse)
def send_message(
    user_id: str,
    message_create: MessageCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return message_service.send_message(
        db_session=db,
        current_user_id=current_user_id,
        partner_id=user_id,
        message_create=message_create,
    )
