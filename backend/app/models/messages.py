from sqlalchemy import Column, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text

from app.database import Base


class Message(Base):
    """ダイレクトメッセージ1件。

    会話は「2人の組み合わせ」から導出するので conversations テーブルは持たない。
    read_at が null のものが未読。
    """

    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sender_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    receiver_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    body = Column(String(1000), nullable=False)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("idx_messages_pair", sender_id, receiver_id, created_at.desc()),
    )

# create table messages (
#   id uuid primary key default gen_random_uuid(),
#   sender_id uuid not null references users(id) on delete cascade,
#   receiver_id uuid not null references users(id) on delete cascade,
#   body varchar(1000) not null,
#   read_at timestamptz,
#   created_at timestamptz not null default now()
# );
