from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, File, Form
from app.schemas.users import UserSummary, CharacterStage
from app.models import posts as post_model, nice_challenges as nice_model, users as user_model, tech_tags as tech_model  # DBモデル（SQLAlchemy）を読み込む
from app.schemas.posts import PostCategory, PostResponse, PostListResponse, CreatePostResponse, ExpResult, NiceResponse
from app.constants import XP_PER_POST, EVOLUTION_THRESHOLD, POST_IMAGE_BUCKET
from app.services import storage_service
from app.services.user_service import _get_character_stage

# 作成時の画像の受け取りのためにバラバラで受け取るようにする
def create_post(content: str, category: PostCategory, user_id: str, technology_ids: list[int], image_file: UploadFile = None, db_session: Session = None):
    # 画像は任意。付いていないときだけアップロードを丸ごと飛ばす
    image_url = _validate_and_upload_image(image_file, user_id) if image_file else None

    tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(technology_ids)).all()
    if technology_ids and len(tags) != len(technology_ids):
        raise HTTPException(status_code=400, detail="無効な技術タグが含まれています")

    user = db_session.query(user_model.Users).filter(user_model.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_post = post_model.Posts(
        user_id=user_id,
        content=content,
        category=category,
        image_url=image_url # ①で取得したURLを入れる！
    )

    new_post.technologies = tags
    tags = [tag.name for tag in tags]  # タグ名のリストを作成

    db_session.add(new_post)
    db_session.commit()
    db_session.refresh(new_post)

    exp_result = _calc_exp_and_evolve(db_session, user)

    post_response = PostResponse(
        id=new_post.id,
        # UserSummaryの項目はavatar_url / learning_stage。
        # icon_url等の余分なキーはPydanticに無視され、静かにNoneになるので注意
        author=UserSummary(
            id=user.id,
            display_name=user.display_name,
            avatar_url=user.icon_url,
            learning_stage=user.learning_stage,
        ),
        image_url=new_post.image_url,
        content=new_post.content,
        category=new_post.category,
        technology_tags=tags,
        nice_count=0,
        is_niced_by_me=False,  # 作成直後はまだ誰もナイスを押していないのでFalse
        created_at=new_post.created_at
    )

    create_post_response = CreatePostResponse(
        post=post_response,
        exp_result=exp_result
    )

    return create_post_response

def get_posts(
    db_session: Session,
    current_user_id: str,
    limit: int = 20,
    user_id: str | None = None,
) -> PostListResponse:
    """投稿一覧。user_idを渡すとそのユーザーの投稿だけに絞る(プロフィール画面用)"""
    query = db_session.query(post_model.Posts)
    if user_id is not None:
        query = query.filter(post_model.Posts.user_id == user_id)

    # 新着順
    posts = (
        query.order_by(post_model.Posts.created_at.desc()).limit(limit).all()
    )
    if not posts:
        return PostListResponse(items=[])

    # 投稿ごとにナイスを引くとN+1になるので、対象IDぶんをまとめて1回で集計する
    post_ids = [post.id for post in posts]
    nice_counts = dict(
        db_session.query(nice_model.NiceChallenge.post_id, func.count())
        .filter(nice_model.NiceChallenge.post_id.in_(post_ids))
        .group_by(nice_model.NiceChallenge.post_id)
        .all()
    )
    my_nice_post_ids = {
        row[0]
        for row in db_session.query(nice_model.NiceChallenge.post_id)
        .filter(
            nice_model.NiceChallenge.post_id.in_(post_ids),
            nice_model.NiceChallenge.user_id == current_user_id,
        )
        .all()
    }

    items = [
        PostResponse(
            id=post.id,
            author=UserSummary(
                id=post.user.id,
                display_name=post.user.display_name,
                avatar_url=post.user.icon_url,
                learning_stage=post.user.learning_stage,
            ),
            image_url=post.image_url,
            content=post.content,
            category=post.category,
            technology_tags=[tag.name for tag in post.technologies],
            # 0件の投稿はGROUP BYの結果に出てこないのでgetで既定値0を使う
            nice_count=nice_counts.get(post.id, 0),
            is_niced_by_me=post.id in my_nice_post_ids,
            created_at=post.created_at,
        )
        for post in posts
    ]

    return PostListResponse(items=items)

def delete_post(db_session: Session, post_id: str, current_user_id: str):
    # 投稿削除処理を実装
    # データベースから投稿を削除する処理を行う
    post = db_session.query(post_model.Posts).filter(post_model.Posts.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # current_user_idはJWTから来る文字列、user_idはUUIDオブジェクトなので
    # そのまま比較すると常に不一致になる
    if str(post.user_id) != str(current_user_id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db_session.delete(post)
    db_session.commit()

    return {"message": f"Post with id {post_id} deleted"}

def toggle_nice(db_session: Session, post_id: str, current_user_id: str):
    # 投稿のいいね処理を実装
    post = db_session.query(post_model.Posts).filter(post_model.Posts.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    already_niced = (
        db_session.query(nice_model.NiceChallenge)
        .filter_by(post_id=post.id, user_id=current_user_id)
        .first()
    )
    if already_niced:
        raise HTTPException(status_code=409, detail="Already niced this post")

    db_session.add(nice_model.NiceChallenge(post_id=post_id, user_id=current_user_id))
    db_session.commit()

    return NiceResponse(
        nice_count=_count_nices(db_session, post.id),
        is_niced_by_me=True,
    )


def remove_nice(db_session: Session, post_id: str, current_user_id: str) -> NiceResponse:
    """ナイス挑戦の取り消し。既に取り消し済みでも成功として扱う(冪等)"""
    post = db_session.query(post_model.Posts).filter(post_model.Posts.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    nice = (
        db_session.query(nice_model.NiceChallenge)
        .filter_by(post_id=post_id, user_id=current_user_id)
        .first()
    )
    if nice:
        db_session.delete(nice)
        db_session.commit()

    return NiceResponse(
        nice_count=_count_nices(db_session, post.id),
        is_niced_by_me=False,
    )


def _count_nices(db_session: Session, post_id) -> int:
    return (
        db_session.query(func.count())
        .select_from(nice_model.NiceChallenge)
        .filter(nice_model.NiceChallenge.post_id == post_id)
        .scalar()
    )

def _validate_and_upload_image(file: UploadFile, user_id: str) -> str:
    # 検証とアップロードはstorage_serviceに集約している(アイコンと共通)
    return storage_service.upload_image(
        file, bucket=POST_IMAGE_BUCKET, prefix=str(user_id)
    )

def _calc_exp_and_evolve(db_session: Session, user: user_model.Users) -> ExpResult:
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_stage = _get_character_stage(user.experience_points)
    
    user.experience_points += XP_PER_POST  
    db_session.commit()

    new_stage = _get_character_stage(user.experience_points)

    is_evolved = (old_stage != new_stage)

    return ExpResult(
        gained=XP_PER_POST,
        total=user.experience_points,
        evolved=is_evolved,
        character_stage=new_stage
    )