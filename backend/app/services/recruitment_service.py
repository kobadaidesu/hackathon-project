from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.recruitments import (
    InterestResponse,
    InterestedUserListResponse,
    RecruitmentCreate,
    RecruitmentListResponse,
    RecruitmentResponse,
    RecruitmentStatus,
    RecruitmentUpdate,
)
from app.schemas.users import UserSummary
from app.services.user_service import _get_character_stage
from app.models import users as user_model, tech_tags as tech_model, recruitments as recruitment_model
from app.models.interests import interests

def create_recruitment(db_session: Session, current_user_id: str, recruitment_create: RecruitmentCreate):
    # 募集作成処理を実装
    user = db_session.query(user_model.Users).filter(user_model.Users.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(recruitment_create.technology_ids)).all()
    if recruitment_create.technology_ids and len(tags) != len(recruitment_create.technology_ids):
        raise HTTPException(status_code=400, detail="無効な技術タグが含まれています")

    new_recruitment = recruitment_model.Recruitment(
        user_id=current_user_id,
        title=recruitment_create.title,
        description=recruitment_create.description,
        # DBとAPIで名前が違う項目はここで変換する(schemas/README.md)
        desired_learning_stage=recruitment_create.preferred_learning_stage,
        beginner_welcome=recruitment_create.beginner_friendly,
        status=RecruitmentStatus.OPEN.value,
    )
    new_recruitment.technologies = tags

    db_session.add(new_recruitment)
    db_session.commit()
    db_session.refresh(new_recruitment)

    # 作成直後なので興味ありは必ず0件
    return _to_get_recruitment(new_recruitment, current_user_id, {}, set())

def update_recruitment(db_session: Session, current_user_id: str, recruitment_id: str, recruitment_update: RecruitmentUpdate):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")
    
    # current_user_idはJWTから来る文字列、user_idはUUIDオブジェクトなので
    # そのまま比較すると常に不一致になる
    if str(current_user_id) != str(recruitment.user_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this recruitment")

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

    ids = [recruitment.id]
    return _to_get_recruitment(
        recruitment,
        current_user_id,
        _fetch_interest_counts(db_session, ids),
        _fetch_my_interests(db_session, ids, current_user_id),
    )

def delete_recruitment(db_session: Session, current_user_id: str, recruitment_id: str):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    if str(recruitment.user_id) != str(current_user_id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this recruitment")

    db_session.delete(recruitment)
    db_session.commit()
    
    return {"message": f"Recruitment with id {recruitment_id} deleted"}

def get_recruitment(db_session: Session, current_user_id: str, recruitment_id: str):
    recruitment = db_session.query(recruitment_model.Recruitment).filter(recruitment_model.Recruitment.id == recruitment_id).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    ids = [recruitment.id]
    return _to_get_recruitment(
        recruitment,
        current_user_id,
        _fetch_interest_counts(db_session, ids),
        _fetch_my_interests(db_session, ids, current_user_id),
    )


def get_recruitments(
    db_session: Session,
    current_user_id: str,
    limit: int = 20,
    user_id: str | None = None,
) -> RecruitmentListResponse:
    """募集一覧。user_idを渡すとその人が出した募集だけに絞る(プロフィール画面用)"""
    query = db_session.query(recruitment_model.Recruitment)
    if user_id is not None:
        query = query.filter(recruitment_model.Recruitment.user_id == user_id)

    recruitments = (
        query.order_by(recruitment_model.Recruitment.created_at.desc())
        .limit(limit)
        .all()
    )
    if not recruitments:
        return RecruitmentListResponse(items=[])

    # 募集ごとに興味ありを引くとN+1になるので、まとめて1回ずつで集計する
    ids = [recruitment.id for recruitment in recruitments]
    counts = _fetch_interest_counts(db_session, ids)
    mine = _fetch_my_interests(db_session, ids, current_user_id)

    return RecruitmentListResponse(
        items=[
            _to_get_recruitment(recruitment, current_user_id, counts, mine)
            for recruitment in recruitments
        ]
    )


def _fetch_interest_counts(db_session: Session, recruitment_ids: list) -> dict:
    """興味ありの件数。interestsテーブルの行数を数える(集計値なので列は無い)"""
    rows = (
        db_session.query(interests.c.recruitment_id, func.count())
        .filter(interests.c.recruitment_id.in_(recruitment_ids))
        .group_by(interests.c.recruitment_id)
        .all()
    )
    return dict(rows)


def _fetch_my_interests(db_session: Session, recruitment_ids: list, current_user_id: str) -> set:
    """自分が興味ありを送った募集のID。見る人によって変わるので列には持てない"""
    rows = (
        db_session.query(interests.c.recruitment_id)
        .filter(
            interests.c.recruitment_id.in_(recruitment_ids),
            interests.c.user_id == current_user_id,
        )
        .all()
    )
    return {row[0] for row in rows}


def _to_get_recruitment(
    recruitment: recruitment_model.Recruitment,
    current_user_id: str,
    interest_counts: dict,
    my_interest_ids: set,
):
    owner_user = recruitment.user

    return RecruitmentResponse(
        id=recruitment.id,
        # UserSummaryの項目はavatar_url / learning_stage。
        # 余分なキーはPydanticに無視され、静かにNoneになるので注意
        owner=UserSummary(
            id=owner_user.id,
            display_name=owner_user.display_name,
            avatar_url=owner_user.icon_url,
            learning_stage=owner_user.learning_stage,
        ),
        title=recruitment.title,
        description=recruitment.description,
        technologies=[tag.name for tag in recruitment.technologies],
        # DBとAPIで名前が違う項目はここで変換する(schemas/README.md)
        preferred_learning_stage=recruitment.desired_learning_stage,
        beginner_friendly=recruitment.beginner_welcome,
        status=recruitment.status,
        # 0件の募集はGROUP BYの結果に出てこないのでgetで既定値0を使う
        interest_count=interest_counts.get(recruitment.id, 0),
        is_interested_by_me=recruitment.id in my_interest_ids,
        created_at=recruitment.created_at,
    )


def toggle_interest(db_session: Session, recruitment_id: str, current_user_id: str) -> InterestResponse:
    """興味ありを送る。複合PKで二重送信は防げるが、先に確認して409を返す"""
    recruitment = db_session.query(recruitment_model.Recruitment).filter(
        recruitment_model.Recruitment.id == recruitment_id
    ).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    if str(recruitment.user_id) == str(current_user_id):
        raise HTTPException(status_code=400, detail="自分の募集には興味ありを送れません")

    already = db_session.execute(
        interests.select().where(
            interests.c.recruitment_id == recruitment_id,
            interests.c.user_id == current_user_id,
        )
    ).first()
    if already:
        raise HTTPException(status_code=409, detail="既に興味ありを送っています")

    db_session.execute(
        interests.insert().values(
            recruitment_id=recruitment_id, user_id=current_user_id
        )
    )
    db_session.commit()

    return InterestResponse(
        interest_count=_count_interests(db_session, recruitment_id),
        is_interested_by_me=True,
    )


def remove_interest(db_session: Session, recruitment_id: str, current_user_id: str) -> InterestResponse:
    """興味ありの取り消し。既に取り消し済みでも成功として扱う(冪等)"""
    recruitment = db_session.query(recruitment_model.Recruitment).filter(
        recruitment_model.Recruitment.id == recruitment_id
    ).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    db_session.execute(
        interests.delete().where(
            interests.c.recruitment_id == recruitment_id,
            interests.c.user_id == current_user_id,
        )
    )
    db_session.commit()

    return InterestResponse(
        interest_count=_count_interests(db_session, recruitment_id),
        is_interested_by_me=False,
    )


def get_interested_users(db_session: Session, recruitment_id: str, current_user_id: str) -> InterestedUserListResponse:
    """興味ありを送ったユーザー一覧。募集者本人のみ閲覧できる"""
    recruitment = db_session.query(recruitment_model.Recruitment).filter(
        recruitment_model.Recruitment.id == recruitment_id
    ).first()
    if not recruitment:
        raise HTTPException(status_code=404, detail="Recruitment not found")

    if str(recruitment.user_id) != str(current_user_id):
        raise HTTPException(status_code=403, detail="この募集の興味あり一覧は閲覧できません")

    users = (
        db_session.query(user_model.Users)
        .join(interests, interests.c.user_id == user_model.Users.id)
        .filter(interests.c.recruitment_id == recruitment_id)
        .all()
    )

    return InterestedUserListResponse(
        items=[
            UserSummary(
                id=user.id,
                display_name=user.display_name,
                avatar_url=user.icon_url,
                learning_stage=user.learning_stage,
            )
            for user in users
        ]
    )


def _count_interests(db_session: Session, recruitment_id) -> int:
    return (
        db_session.query(func.count())
        .select_from(interests)
        .filter(interests.c.recruitment_id == recruitment_id)
        .scalar()
    )