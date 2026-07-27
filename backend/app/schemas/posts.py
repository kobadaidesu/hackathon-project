from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import Field

from app.schemas.base import ApiSchema
from app.schemas.users import CharacterStage, UserSummary


class PostCategory(str, Enum):
    LEARNING = "learning"
    WORK_IN_PROGRESS = "work_in_progress"
    SOLVED = "solved"
    ERROR = "error"
    NEW_TECHNOLOGY = "new_technology"
    EVENT = "event"
    ENVIRONMENT = "environment"
    IDEA = "idea"


class PostCreate(ApiSchema):
    content: str = Field(min_length=1, max_length=300)
    category: PostCategory
    technology_ids: list[int] = Field(default_factory=list)


class PostResponse(ApiSchema):
    id: UUID
    author: UserSummary
    image_url: str
    content: str
    category: PostCategory
    technology_tags: list[str] = Field(default_factory=list)
    nice_count: int = Field(ge=0)
    is_niced_by_me: bool
    created_at: datetime


class NiceResponse(ApiSchema):
    nice_count: int = Field(ge=0)
    is_niced_by_me: bool


class ExpResult(ApiSchema):
    gained: int = Field(ge=0)
    total: int = Field(ge=0)
    evolved: bool
    character_stage: CharacterStage


class CreatePostResponse(ApiSchema):
    post: PostResponse
    exp_result: ExpResult


class PostListResponse(ApiSchema):
    """一覧は必ず {"items": [...]} で包む(フロントのpostApi.tsがこの形を前提にしている)"""

    items: list[PostResponse] = Field(default_factory=list)
