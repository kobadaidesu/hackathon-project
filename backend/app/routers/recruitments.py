from fastapi import APIRouter, Form, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.services import recruitment_service
from app.schemas.recruitments import (
    InterestedUserListResponse,
    InterestResponse,
    RecruitmentCreate,
    RecruitmentListResponse,
    RecruitmentResponse,
    RecruitmentUpdate,
)

router = APIRouter(prefix="/api/recruitments", tags=["Recruitments"])

@router.get("", response_model=RecruitmentListResponse)
def get_recruitments(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
    limit: int = 20
):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return recruitment_service.get_recruitments(db_session=db, current_user_id=current_user_id, limit=limit)

@router.post("", response_model=RecruitmentResponse)
def create_recruitment(
    recruitment_create: RecruitmentCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集作成処理を実装
    return recruitment_service.create_recruitment(db_session=db, current_user_id=current_user_id, recruitment_create=recruitment_create)

@router.get("/{recruitment_id}", response_model=RecruitmentResponse)
def get_recruitment(
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集詳細を取得する処理を実装
    return recruitment_service.get_recruitment(db_session=db, current_user_id=current_user_id, recruitment_id=recruitment_id)

@router.patch("/{recruitment_id}", response_model=RecruitmentResponse)
def update_recruitment(
    recruitment_update: RecruitmentUpdate,
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集更新処理を実装
    return recruitment_service.update_recruitment(db_session=db, current_user_id=current_user_id, recruitment_id=recruitment_id, recruitment_update=recruitment_update)

@router.post("/{recruitment_id}/interest", response_model=InterestResponse)
def add_interest(
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # レスポンスに更新後のinterestCount / isInterestedByMeを入れる。
    # フロントは自分で+1せず、返ってきた値をそのままstateに入れる
    return recruitment_service.toggle_interest(
        db_session=db, recruitment_id=recruitment_id, current_user_id=current_user_id
    )

@router.delete("/{recruitment_id}/interest", response_model=InterestResponse)
def remove_interest(
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    return recruitment_service.remove_interest(
        db_session=db, recruitment_id=recruitment_id, current_user_id=current_user_id
    )

@router.get("/{recruitment_id}/interests", response_model=InterestedUserListResponse)
def get_interests(
    recruitment_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 募集者本人のみ閲覧可
    return recruitment_service.get_interested_users(
        db_session=db, recruitment_id=recruitment_id, current_user_id=current_user_id
    )