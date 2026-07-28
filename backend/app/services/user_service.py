from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models import users as user_model, tech_tags as tech_model  # DBモデル（SQLAlchemy）を読み込む
from app.schemas.users import UserProfileUpdate, UserProfileResponse, CharacterStage, NextEvolution
from app.constants import EVOLUTION_THRESHOLD, AVATAR_BUCKET
from app.services import storage_service

def get_user_profile(db_session: Session, user_id: str):
    # ユーザープロフィール取得処理を実装
    user = db_session.query(user_model.Users).filter(user_model.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return _to_get_user_profile(user=user)

def update_user_profile(db_session: Session, user_id: str, update_data: UserProfileUpdate):
    # ユーザープロフィール更新処理を実装
    user = db_session.query(user_model.Users).filter(user_model.Users.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # mode="json"を付けないとHttpUrl型のgithub_url/contact_urlがUrlオブジェクトのまま返り、
    # Stringカラムへの代入で落ちる
    update_dict = update_data.model_dump(exclude_unset=True, mode="json")

    # 技術タグはIDの配列で受け取り、中間テーブルごと張り替える
    if "technology_ids" in update_dict:
        tech_ids = update_dict.pop("technology_ids")
        tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(tech_ids)).all()
        user.technologies = tags

    # アイコンはUserProfileUpdateに項目が無く、POST /api/users/me/icon が担当する
    update_dict.pop("avatar_url", None)

    for key, value in update_dict.items():
        setattr(user, key, value)

    db_session.commit()
    db_session.refresh(user)

    return _to_get_user_profile(user=user)

def update_user_icon(db_session: Session, user_id: str, image_file: UploadFile):
    """アイコンをStorageへ上げ、users.icon_urlを差し替える"""
    user = db_session.query(user_model.Users).filter(user_model.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 古い画像はStorageに残るが、容量を圧迫する規模ではないので消していない
    user.icon_url = storage_service.upload_image(
        image_file, bucket=AVATAR_BUCKET, prefix=str(user_id)
    )
    db_session.commit()
    db_session.refresh(user)

    return _to_get_user_profile(user=user)

# いつか他人で処理が必要になった時用
# def get_ohter_user_profile(db_session: Session, current_user_id: str, target_user_id: str):
#     target_user = db_session.query(user_model.Users).filter(user_model.Users.id == target_user_id).first()
#     if not target_user:
#         raise HTTPException(status_code=404, detail="Target User not found")

#     return _to_get_user_profile(target_user)

def _to_get_user_profile(user: user_model.Users):
    tags = [tag.name for tag in user.technologies]
    
    character_stage = _get_character_stage(user.experience_points)
    
    current_level_exp = user.experience_points % EVOLUTION_THRESHOLD
    required = EVOLUTION_THRESHOLD - current_level_exp
    # NextEvolution.progress_percentは0〜100の整数
    progress_percent = int(current_level_exp / EVOLUTION_THRESHOLD * 100)

    next_evolution = NextEvolution(
        required=required,
        progress_percent=progress_percent
    )
    
    is_completed = bool(user.display_name) # 要検討？
    
    user_profile_response = UserProfileResponse(
        id=user.id,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.icon_url,
        learning_stage=user.learning_stage,
        technologies=tags,
        github_url=user.github_url,
        contact_url=user.contact_url,
        experience_points=user.experience_points,
        character_stage=character_stage,
        next_evolution=next_evolution,
        profile_completed=is_completed
    )
    
    return user_profile_response

def _get_character_stage(exp: int) -> CharacterStage:
    level = exp // EVOLUTION_THRESHOLD
    if level == 0:
        return CharacterStage.EGG
    else:
        return CharacterStage.CHICK
    # レベル上限が解放されたら、ここに追記する