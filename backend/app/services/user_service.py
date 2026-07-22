from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import user as user_model       # DBモデル（SQLAlchemy）を読み込む
from schemas.users import UserUpdate

def get_user_profile(db_session: Session, user_id: str):
    # ユーザープロフィール取得処理を実装
    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_profile(db_session: Session, user_id: str, update_data: UserUpdate):
    # ユーザープロフィール更新処理を実装
    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)

    for key, value in update_dict.items():
        setattr(user, key, value)

    db_session.commit()
    db_session.refresh(user)
    return user