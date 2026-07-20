from sqlalchemy import Column, String, Integer, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from backend.app.database import Base

user_technologies = Table(
    "user_technologies",
    Base.metadata,
    
    Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True, 
        nullable=False
    ),
    Column(
        Integer, 
        ForeignKey("tech_tags.id", ondelete="CASCADE"), 
        primary_key=True, 
        nullable=False
    )
)

post_tech_tags = Table(
    "post_tech_tags",
    Base.metadata,
    Column(
        UUID(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        Integer,
        ForeignKey("tech_tags.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
)

recruitment_tech_tags = Table(
    "recruitment_tech_tags",
    Base.metadata,
    Column(
        UUID(as_uuid=True),
        ForeignKey("recruitments.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    ),
    Column(
        Integer,
        ForeignKey("tech_tags.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
)

class TechTag(Base):
    __tablename__ = "tech_tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(30), unique=True, nullable=False)

# create table tech_tags (
#   id serial primary key,
#   name varchar(30) unique not null
# );

# create table user_technologies (
#   user_id uuid not null references users(id) on delete cascade,
#   tech_tag_id int not null references tech_tags(id) on delete cascade,
#   primary key (user_id, tech_tag_id)
# );

# create table post_tech_tags (
#   post_id uuid not null references posts(id) on delete cascade,
#   tech_tag_id int not null references tech_tags(id) on delete cascade,
#   primary key (post_id, tech_tag_id)
# );

# create table recruitment_tech_tags (
#   recruitment_id uuid not null references recruitments(id) on delete cascade,
#   tech_tag_id int not null references tech_tags(id) on delete cascade,
#   primary key (recruitment_id, tech_tag_id)
# );