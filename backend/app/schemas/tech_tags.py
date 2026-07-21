from pydantic import Field

from app.schemas.base import ApiSchema


class TechTagResponse(ApiSchema):
    id: int = Field(gt=0)
    name: str
