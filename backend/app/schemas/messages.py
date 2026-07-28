from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import ApiSchema
from app.schemas.users import UserSummary


class MessageCreate(ApiSchema):
    body: str = Field(min_length=1, max_length=1000)


class MessageResponse(ApiSchema):
    id: UUID
    # 自分の発言か相手の発言かはフロントで sender_id と自分のIDを比べて判定する
    sender_id: UUID
    body: str
    created_at: datetime


class MessageListResponse(ApiSchema):
    """特定の相手とのやりとり(古い順)"""

    partner: UserSummary
    items: list[MessageResponse] = Field(default_factory=list)


class ConversationResponse(ApiSchema):
    """会話一覧の1行。相手ごとに最新の1件と未読数をまとめたもの"""

    partner: UserSummary
    last_message: str
    last_message_at: datetime
    unread_count: int = Field(ge=0)


class ConversationListResponse(ApiSchema):
    items: list[ConversationResponse] = Field(default_factory=list)


class UnreadCountResponse(ApiSchema):
    """ヘッダーのバッジ用。未読メッセージの総数"""

    unread_count: int = Field(ge=0)
