from fastapi import APIRouter

router = APIRouter(prefix="/api/tech-tags", tags=["Tech Tags"])

@router.get("")
def get_tech_tags():
    # 技術タグ一覧を取得する処理を実装
    return {"message": "List of tech tags"}