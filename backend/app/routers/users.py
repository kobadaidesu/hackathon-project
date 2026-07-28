from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.schemas.posts import PostListResponse
from app.schemas.recruitments import RecruitmentListResponse
from app.schemas.users import UserProfileUpdate, UserProfileResponse
from app.services import post_service, recruitment_service, user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserProfileResponse)
def get_current_user(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # ユーザー情報を取得する処理を実装
    return user_service.get_user_profile(db_session=db, user_id=current_user_id)

@router.patch("/me", response_model=UserProfileResponse)
def update_current_user(
    update_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # ユーザー情報を更新する処理を実装
    return user_service.update_user_profile(
        db_session=db, 
        user_id=current_user_id, 
        update_data=update_data
    )

@router.post("/me/icon")
def upload_user_icon():
    # ユーザーアイコンをアップロードする処理を実装
    return {"message": "User icon uploaded"}

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    # 対象ユーザーのプロフィール情報を取得する処理を実装
    return user_service.get_user_profile(db_session=db, user_id=user_id)

@router.get("/{user_id}/posts", response_model=PostListResponse)
def get_user_posts(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # プロフィール画面の投稿一覧。isNicedByMeは「見ている人」基準なので
    # current_user_idとuser_idの両方を渡す
    return post_service.get_posts(
        db_session=db, current_user_id=current_user_id, limit=limit, user_id=user_id
    )

@router.get("/{user_id}/recruitments", response_model=RecruitmentListResponse)
def get_user_recruitments(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    # 対象ユーザーが出した募集一覧
    return recruitment_service.get_recruitments(
        db_session=db, current_user_id=current_user_id, limit=limit, user_id=user_id
    )
