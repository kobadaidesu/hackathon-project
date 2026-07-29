from enum import Enum
from uuid import UUID

from pydantic import Field, HttpUrl

from app.schemas.base import ApiSchema


class LearningStage(str, Enum):
    WANT_TO_START = "want_to_start"
    LEARNING_BASICS = "learning_basics"
    BUILDING_SMALL_APP = "building_small_app"
    PERSONAL_DEVELOPMENT = "personal_development"
    WANT_TEAM_DEVELOPMENT = "want_team_development"
    PROFESSIONAL = "professional"


class CharacterStage(str, Enum):
    """経験値 EVOLUTION_THRESHOLD ごとに1段階進む。順序はこの定義順"""

    EGG = "egg"            # レベル0: 殻から顔だけ
    HATCHING = "hatching"  # レベル1: 殻が割れて出てくる
    CHICK = "chick"        # レベル2: 生まれたてのひよこ
    BROWN = "brown"        # レベル3: ちゃいろ
    GREEN = "green"        # レベル4: わかば
    BLUE = "blue"          # レベル5: そらいろ
    GOLD = "gold"          # レベル6: こがね
    PINK = "pink"          # レベル7: ももいろ
    ROOSTER = "rooster"    # レベル8: 覚醒ニワトリ(最終段階)


class NextEvolution(ApiSchema):
    required: int = Field(ge=0)
    progress_percent: int = Field(ge=0, le=100)


class UserSummary(ApiSchema):
    id: UUID
    display_name: str
    avatar_url: str | None = None
    learning_stage: LearningStage | None = None


class UserProfileResponse(ApiSchema):
    id: UUID
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    learning_stage: LearningStage | None = None
    technologies: list[str] = Field(default_factory=list)
    github_url: str | None = None
    contact_url: str | None = None
    experience_points: int = Field(ge=0)
    character_stage: CharacterStage
    next_evolution: NextEvolution | None = None
    profile_completed: bool | None = None


class UserProfileUpdate(ApiSchema):
    display_name: str | None = Field(default=None, min_length=1, max_length=30)
    bio: str | None = Field(default=None, max_length=300)
    learning_stage: LearningStage | None = None
    technology_ids: list[int] | None = None
    github_url: HttpUrl | None = None
    contact_url: HttpUrl | None = None
