from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, File, Form
from app.schemas.users import UserSummary, CharacterStage
from models import posts as post_model, nice_challenges as nice_model, users as user_model, tech_tags as tech_model  # DBモデル（SQLAlchemy）を読み込む
from app.schemas.posts import PostCategory, PostResponse, CreatePostResponse, ExpResult, NiceResponse
from app.constants import XP_PER_POST, EVOLUTION_THRESHOLD
from user_service import _get_character_stage

# 作成時の画像の受け取りのためにバラバラで受け取るようにする
def create_post(content: str, category: PostCategory, user_id: str, technology_ids: list[int], image_file: UploadFile = None, db_session: Session = None):
    # 投稿作成処理を実装
    image_url = None
    if image_file:
        image_url = _validate_and_upload_image(image_file)

    tags = db_session.query(tech_model.TechTag).filter(tech_model.TechTag.id.in_(technology_ids)).all()
    if technology_ids and len(tags) != len(technology_ids):
        raise HTTPException(status_code=400, detail="無効な技術タグが含まれています")

    user = db_session.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_post = post_model.Post(
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
        author=UserSummary(id=user.id, display_name=user.display_name, icon_url=user.icon_url, character_stage=exp_result.character_stage),
        image_url=new_post.image_url,
        content=new_post.content,
        category=new_post.category,
        technology_tags=tags,
        nice_count=0,
        is_niced_by_me=False,  # 投稿作成時点では自分の投稿にいいねはできないのでFalse
        created_at=new_post.created_at
    )

    create_post_response = CreatePostResponse(
        post=post_response,
        exp_result=exp_result
    )

    return create_post_response

def get_posts(db_session: Session, current_user_id: str, limit: int = 20):
    # 投稿取得処理を実装
    posts = db_session.query(post_model.Post).limit(limit).all()

    posts_response = []
    for post in posts:
        tags = [tag.name for tag in post.technologies]  # タグ名のリストを作成
        character_stage = _get_character_stage(post.user.experience_points)
        nice_challenges = db_session.query(nice_model.Nice).filter_by(post_id=post.id).all()
        is_niced_by_me = any(nice.user_id == current_user_id for nice in nice_challenges)
        post_response = PostResponse(
            id=post.id,
            author=UserSummary(id=post.user.id, display_name=post.user.display_name, icon_url=post.user.icon_url, character_stage=character_stage),
            image_url=post.image_url,
            content=post.content,
            category=post.category,
            technology_tags=tags,
            nice_count=len(nice_challenges),
            is_niced_by_me=is_niced_by_me,
            created_at=post.created_at
        )
        posts_response.append(post_response)

    return posts_response

def delete_post(db_session: Session, post_id: str, current_user_id: str):
    # 投稿削除処理を実装
    # データベースから投稿を削除する処理を行う
    post = db_session.query(post_model.Post).filter(post_model.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db_session.delete(post)
    db_session.commit()

    return {"message": f"Post with id {post_id} deleted"}

def toggle_nice(db_session: Session, post_id: str, current_user_id: str):
    # 投稿のいいね処理を実装
    post = db_session.query(post_model.Post).filter(post_model.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot nice your own post")

    nice_challenges = db_session.query(nice_model.Nice).filter_by(post_id=post.id).all()
    is_niced_by_me = any(nice.user_id == current_user_id for nice in nice_challenges)
    if is_niced_by_me:
        raise HTTPException(status_code=409, detail="Already niced this post")

    new_nice = nice_model.Nice(post_id=post_id, user_id=current_user_id)
    db_session.add(new_nice)
    db_session.commit()

    nice_response = NiceResponse(
        nice_count=len(nice_challenges) + 1,
        is_niced_by_me=True
    )

    return nice_response

def _validate_and_upload_image(file: UploadFile) -> str:
    # 画像ファイルのバリデーション処理を実装
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid image file type")
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)  # 次の保存処理のためにカーソルを先頭に戻す
    
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="ファイルサイズは5MB以下にしてください")

    # 画像ファイルの保存処理を実装（supabase）

    return "https://dummy.url/uploaded-image.png" # 仮置き

def _calc_exp_and_evolve(db_session: Session, user: user_model.User) -> ExpResult:
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