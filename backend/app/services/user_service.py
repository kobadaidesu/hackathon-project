from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from models import user as user_model, tech_tags as tech_model       # DBモデル（SQLAlchemy）を読み込む
from schemas.users import UserProfileUpdate, UserProfileResponse, CharacterStage, NextEvolution
from app.constants import EVOLUTION_THRESHOLD

def get_user_profile(db_session: Session, user_id: str):
    # ユーザープロフィール取得処理を実装
    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return _to_get_user_profile(user=user)

def update_user_profile(db_session: Session, user_id: str, update_data: UserProfileUpdate):
    # ユーザープロフィール更新処理を実装
    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)

    # 二つは例外処理
    if "technology_ids" in update_dict:
        tech_ids = update_dict.pop("technology_ids") 
        tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(tech_ids)).all()
        user.technologies = tags

    if "avatar_url" in update_dict:
        new_icon = update_dict.pop("avatar_url")
        user.icon_url = new_icon

    for key, value in update_dict.items():
        setattr(user, key, value)

    db_session.commit()
    db_session.refresh(user)

    tags = [tag.name for tag in user.technologies]
    
    character_stage = _get_character_stage(user.experience_points)
    
    current_level_exp = user.experience_points % EVOLUTION_THRESHOLD
    required = EVOLUTION_THRESHOLD - current_level_exp
    progress_percent = current_level_exp/EVOLUTION_THRESHOLD
    
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

def update_user_icon(db_session: Session, user_id: str, image_file: UploadFile = None):
    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()

# いつか他人で処理が必要になった時用
# def get_ohter_user_profile(db_session: Session, current_user_id: str, target_user_id: str):
#     target_user = db_session.query(user_model.User).filter(user_model.User.id == target_user_id).first()
#     if not target_user:
#         raise HTTPException(status_code=404, detail="Target User not found")

#     return _to_get_user_profile(target_user)

def _to_get_user_profile(user: user_model.User):
    tags = [tag.name for tag in user.technologies]
    
    character_stage = _get_character_stage(user.experience_points)
    
    current_level_exp = user.experience_points % EVOLUTION_THRESHOLD
    required = EVOLUTION_THRESHOLD - current_level_exp
    progress_percent = current_level_exp/EVOLUTION_THRESHOLD
    
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
        return CharacterStage.Egg
    else:
        return CharacterStage.Chick
    # レベル上限が解放されたら、ここに追記する