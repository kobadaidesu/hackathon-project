from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import Field

from app.schemas.base import ApiSchema
from app.schemas.users import LearningStage, UserSummary


class RecruitmentStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class RecruitmentCreate(ApiSchema):
    title: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=1, max_length=500)
    technology_ids: list[int] = Field(default_factory=list)
    preferred_learning_stage: LearningStage | None = None
    beginner_friendly: bool = False


class RecruitmentUpdate(ApiSchema):
    title: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    technology_ids: list[int] | None = None
    preferred_learning_stage: LearningStage | None = None
    beginner_friendly: bool | None = None
    status: RecruitmentStatus | None = None


class RecruitmentResponse(ApiSchema):
    id: UUID
    owner: UserSummary
    title: str
    description: str
    technologies: list[str] = Field(default_factory=list)
    preferred_learning_stage: LearningStage | None = None
    beginner_friendly: bool
    status: RecruitmentStatus
    interest_count: int = Field(ge=0)
    is_interested_by_me: bool
    created_at: datetime


class InterestResponse(ApiSchema):
    interest_count: int = Field(ge=0)
    is_interested_by_me: bool
