from pydantic import Field

from app.schemas.base import ApiSchema


class TechTagResponse(ApiSchema):
    id: int = Field(gt=0)
    name: str


class TechTagListResponse(ApiSchema):
    """一覧は必ず {"items": [...]} で包む(フロントのtechTagApi.tsがこの形を前提にしている)"""

    items: list[TechTagResponse] = Field(default_factory=list)
