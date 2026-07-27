from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.tech_tags import user_technologies

class Users(Base):
    __tablename__ = "users"

    # auth.usersへの外部キーはDB側(schema.sql)で定義済み。
    # auth.usersはSupabase管理でBase.metadataに存在しないため、ここでは張らない
    # (張るとNoReferencedTableErrorでマッパー設定が落ちる)
    id = Column(UUID(as_uuid=True), primary_key=True)
    display_name = Column(String(30))
    bio = Column(String(300))
    icon_url = Column(String)
    learning_stage = Column(String(30))
    github_url = Column(String(200))
    contact_url = Column(String(200))
    experience_points = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    technologies = relationship("TechTag", secondary=user_technologies, back_populates="users")

# create table users (
#   id uuid primary key references auth.users(id) on delete cascade,
#   display_name varchar(30),
#   bio varchar(300),
#   icon_url text,
#   learning_stage varchar(30),
#   github_url varchar(200),
#   contact_url varchar(200),
#   experience_points int not null default 0,
#   created_at timestamptz not null default now(),
#   updated_at timestamptz not null default now()
# );