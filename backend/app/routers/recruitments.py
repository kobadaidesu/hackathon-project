from fastapi import APIRouter, Form, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.services import recruitment_service
from app.schemas.recruitments import RecruitmentCreate, RecruitmentUpdate

router = APIRouter(prefix="/api/recruitments", tags=["Recruitments"])

@router.get("")
def get_recruitments(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
    limit: int = 20
):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return recruitment_service.get_recruitments(db_session=db, current_user_id=current_user_id, limit=limit)

@router.post("")
def create_recruitment(
    recruitment_create: RecruitmentCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集作成処理を実装
    return recruitment_service.create_recruitment(db_session=db, current_user_id=current_user_id, recruitment_create=recruitment_create)

@router.get("/{recruitment_id}")
def get_recruitment(
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集詳細を取得する処理を実装
    return recruitment_service.get_recruitment(db_session=db, current_user_id=current_user_id, recruitment_id=recruitment_id)

@router.patch("/{recruitment_id}")
def update_recruitment(
    recruitment_update: RecruitmentUpdate,
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集更新処理を実装
    return recruitment_service.update_recruitment(db_session=db, current_user_id=current_user_id, recruitment_id=recruitment_id, recruitment_update=recruitment_update)

@router.post("/{recruitment_id}/interest")
def add_interest(recruitment_id: str):
    # 募集に対して「興味あり」を追加する処理を実装
    return {"message": f"Interest added to recruitment with id {recruitment_id}"}

@router.delete("/{recruitment_id}/interest")
def remove_interest(recruitment_id: str):
    # 募集に対して「興味あり」を削除する処理を実装
    return {"message": f"Interest removed from recruitment with id {recruitment_id}"}

@router.get("/{recruitment_id}/interests")
def get_interests(recruitment_id: str):
    # 募集に対して「興味あり」をしたユーザー一覧を取得する処理を実装
    return {"message": f"List of users interested in recruitment with id {recruitment_id}"}