from sqlalchemy import Column, Index, String, DateTime, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.tech_tags import recruitment_tech_tags

class Recruitment(Base):
    __tablename__ = "recruitments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(50), nullable=False)
    description = Column(String(500), nullable=False)
    desired_learning_stage = Column(String(30))
    beginner_welcome = Column(Boolean, nullable=False, server_default="false")
    status = Column(String(10), nullable=False, server_default='open')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    technologies = relationship(
        "TechTag", secondary=recruitment_tech_tags, back_populates="recruitments"
    )
    user = relationship("Users")

    __table_args__ = (
        Index("idx_recruitments_created_at", created_at.desc()),
    )

# create table recruitments (
#   id uuid primary key default gen_random_uuid(),
#   user_id uuid not null references users(id) on delete cascade,
#   title varchar(50) not null,
#   description varchar(500) not null,
#   desired_learning_stage varchar(30),
#   beginner_welcome boolean not null default false,
#   status varchar(10) not null default 'open',
#   created_at timestamptz not null default now()
# );

# create index idx_recruitments_created_at on recruitments (created_at desc);