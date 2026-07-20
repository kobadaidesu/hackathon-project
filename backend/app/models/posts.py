from sqlalchemy import Column, Index, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text

from backend.app.database import Base

class Posts(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)
    content = Column(String(300), nullable=False)
    category = Column(String(30), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_posts_created_at", created_at.desc()),
        Index("idx_posts_user_created", user_id, created_at.desc()),
    )

# create table posts (
#   id uuid primary key default gen_random_uuid(),
#   user_id uuid not null references users(id) on delete cascade,
#   image_url text not null,
#   content varchar(300) not null,
#   category varchar(30) not null,
#   created_at timestamptz not null default now()
# );

# create index idx_posts_created_at on posts (created_at desc);
# create index idx_posts_user_created on posts (user_id, created_at desc);