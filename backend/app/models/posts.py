from sqlalchemy import Column, Index, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.tech_tags import post_tech_tags

class Posts(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=True)  # 画像は任意(文章だけの投稿を許す)
    content = Column(String(300), nullable=False)
    category = Column(String(30), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    technologies = relationship("TechTag", secondary=post_tech_tags, back_populates="posts")
    user = relationship("Users")

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