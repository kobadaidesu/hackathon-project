from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import tech_tags as tech_model
from app.schemas.tech_tags import TechTagListResponse

router = APIRouter(prefix="/api/tech-tags", tags=["Tech Tags"])


@router.get("", response_model=TechTagListResponse)
def get_tech_tags(db: Session = Depends(get_db)):
    """技術タグの固定マスタを返す。

    投稿作成・プロフィール設定・募集作成の選択肢に使う。
    マスタなので認証は不要。追加はschema.sqlを直す。
    """
    tags = (
        db.query(tech_model.TechTag).order_by(tech_model.TechTag.id).all()
    )
    return TechTagListResponse(items=tags)
