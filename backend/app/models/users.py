from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from backend.app.database import Base

class Users(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True)
    display_name = Column(String(30))
    bio = Column(String(300))
    icon_url = Column(String)
    learning_stage = Column(String(30))
    github_url = Column(String(200))
    contact_url = Column(String(200))
    experience_points = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

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