from sqlalchemy import Column, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


# 中間テーブルだが、件数の集計と行の追加・削除をサービス層から直接扱うため
# Core の Table ではなく ORM クラスとして定義する。
# (relationship の secondary としては使っていない)
class NiceChallenge(Base):
    __tablename__ = "nice_challenges"

    post_id = Column(
        UUID(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

# create table nice_challenges (
#   post_id uuid not null references posts(id) on delete cascade,
#   user_id uuid not null references users(id) on delete cascade,
#   created_at timestamptz not null default now(),
#   primary key (post_id, user_id)
# );