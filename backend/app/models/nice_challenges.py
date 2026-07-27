from sqlalchemy import Column, DateTime, ForeignKey, Table, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text

from app.database import Base

nice_challenges = Table(
    "nice_challenges",
    Base.metadata,
    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        "post_id",
        UUID(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        "created_at",
        DateTime,
        nullable=False,
        server_default=func.now()
    )
)

# create table nice_challenges (
#   post_id uuid not null references posts(id) on delete cascade,
#   user_id uuid not null references users(id) on delete cascade,
#   created_at timestamptz not null default now(),
#   primary key (post_id, user_id)
# );