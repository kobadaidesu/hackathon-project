from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.database import get_db
from app.schemas.users import UserProfileUpdate, UserProfileResponse
from app.services import user_service

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

@router.get("/{user_id}/posts")
def get_user_posts(user_id: str):
    # 対象ユーザーの投稿一覧を取得する処理を実装
    return {"message": f"Posts for user_id: {user_id}"}

@router.get("/{user_id}/recruitments")
def get_user_recruitments(user_id: str):
    # 対象ユーザーの募集一覧を取得する処理を実装
    return {"message": f"Recruitments for user_id: {user_id}"}
