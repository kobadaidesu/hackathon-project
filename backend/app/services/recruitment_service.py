from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.schemas.recruitments import RecruitmentCreate, RecruitmentStatus, RecruitmentResponse, RecruitmentUpdate
from app.schemas.users import UserSummary
from app.services.user_service import _get_character_stage
from app.models import users as user_model, tech_tags as tech_model, recruitments as recruitment_model

def create_recruitment(db_session: Session, current_user_id: str, recruitment_create: RecruitmentCreate):
    # 募集作成処理を実装
    user = db_session.query(user_model.User).filter(user_model.User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    character_stage = _get_character_stage(user.experience_points)

    tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(recruitment_create.technology_ids)).all()
    if recruitment_create.technology_ids and len(tags) != len(recruitment_create.technology_ids):
        raise HTTPException(status_code=400, detail="無効な技術タグが含まれています")

    new_recruitment = recruitment_model.Recruitment(
        user_id=current_user_id,
        title=recruitment_create.title,
        description=recruitment_create.description,
        desired_learning_stage=recruitment_create.preferred_learning_stage,
        beginner_welcome=recruitment_create.beginner_friendly,
        status="OPEN"
    )

    new_recruitment.technology = tags
    tags = [tag.name for tag in tags]

    db_session.add(new_recruitment)
    db_session.commit()
    db_session.refresh(new_recruitment)

    recruitment_response = RecruitmentResponse(
        id=new_recruitment.id,
        owner=UserSummary(id=user.id, display_name=user.display_name, icon_url=user.icon_url, character_stage=character_stage),
        title=new_recruitment.title,
        description=new_recruitment.description,
        technologies=tags,
        preferred_learning_stage=new_recruitment.desired_learning_stage,
        beginner_friendly=new_recruitment.beginner_friendly,
        status=RecruitmentStatus.OPEN,
        interest_count=0,
        is_interested_by_me=False,
        created_at=new_recruitment.created_at
    )

    return recruitment_response

def update_recruitment(db_session: Session, current_user_id: str, recruitment_id: str, recruitment_update: RecruitmentUpdate):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")
    
    if current_user_id != recruitment.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    owner_user = recruitment.user

    update_dict = recruitment_update.model_dump(exclude_unset=True)
    
    # 二つは例外処理
    if "technology_ids" in update_dict:
        tech_ids = update_dict.pop("technology_ids") 
        tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(tech_ids)).all()
        recruitment.technologies = tags
    
    if "preferred_learning_stage" in update_dict:
        new_stage = update_dict.pop("preferred_learning_stage")
        recruitment.desired_learning_stage = new_stage

    if "status" in update_dict:
        new_status = update_dict.pop("status")
        recruitment.status = new_status.value

    if "beginner_friendly" in update_dict:
        new_biginner = update_dict.pop("beginner_friendly")
        recruitment.beginner_welcome = new_biginner
    
    for key, value in update_dict.items():
        setattr(recruitment, key, value)

    db_session.commit()
    db_session.refresh(recruitment)

    tags = [tag.name for tag in recruitment.technologies]
    character_stage = _get_character_stage(owner_user.experience_points)

    recruitment_response = RecruitmentResponse(
        id=recruitment.id,
        owner=UserSummary(id=owner_user.id, display_name=owner_user.display_name, icon_url=owner_user.icon_url, character_stage=character_stage),
        title=recruitment.title,
        description=recruitment.description,
        technologies=tags,
        preferred_learning_stage=recruitment.desired_learning_stage,
        beginner_friendly=recruitment.beginner_welcome,
        status=recruitment.status,
        interest_count=0, # どこで取得する
        is_interested_by_me=False, # どこで取得する
        created_at=recruitment.created_at
    )
    
    return recruitment_response

def delete_recruitment(db_session: Session, current_user_id: str, recruitment_id: str):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    if recruitment.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this recruitment")

    db_session.delete(recruitment)
    db_session.commit()
    
    return {"message": f"Recruitment with id {recruitment_id} deleted"}

def get_recruitment(db_session: Session, current_user_id: str, recruitment_id: str):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    return _to_get_recruitment(recruitment, current_user_id)

def get_recruitments(db_session: Session, current_user_id: str, limit: int = 20):
    recruitments = db_session.query(recruitment_model.Recruitment).limit(limit).all()

    return [_to_get_recruitment(recruitment, current_user_id) for recruitment in recruitments]

def _to_get_recruitment(recruitment: recruitment_model.Recruitment, curent_user_id: str):
    owner_user = recruitment.user
    
    tags = [tag.name for tag in recruitment.technologies]
    character_stage = _get_character_stage(owner_user.experience_points)
    
    recruitment_response = RecruitmentResponse(
        id=recruitment.id,
        owner=UserSummary(id=owner_user.id, display_name=owner_user.display_name, icon_url=owner_user.icon_url, character_stage=character_stage),
        title=recruitment.title,
        description=recruitment.description,
        technologies=tags,
        preferred_learning_stage=recruitment.desired_learning_stage,
        beginner_friendly=recruitment.beginner_welcome,
        status=recruitment.status,
        interest_count=0, # どこで取得する
        is_interested_by_me=False, # どこで取得する
        created_at=recruitment.created_at
    )

    return recruitment_response