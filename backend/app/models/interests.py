from sqlalchemy import Column, Index, String, DateTime, ForeignKey, Table, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text

from backend.app.database import Base

interests = Table(
    "interests",
    Base.metadata,
    Column(
        UUID(as_uuid=True),
        ForeignKey("recruitments.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )
)

# create table interests (
#   recruitment_id uuid not null references recruitments(id) on delete cascade,
#   user_id uuid not null references users(id) on delete cascade,
#   created_at timestamptz not null default now(),
#   primary key (recruitment_id, user_id)
# );