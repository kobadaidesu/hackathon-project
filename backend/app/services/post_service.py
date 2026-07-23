from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, File, Form
from app.schemas.users import UserSummary, CharacterStage
from models import posts as post_model, nice_challenges as nice_model, users as user_model, tech_tags as tech_model  # DBモデル（SQLAlchemy）を読み込む
from schemas.posts import PostCategory, PostResponse, CreatePostRequest, ExpResult
from app.constants import XP_PER_POST, EVOLUTION_THRESHOLD

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
        author=UserSummary(id=new_post.user.id, display_name=user.display_name, icon_url=user.icon_url, character_stage=exp_result.character_stage),
        image_url=new_post.image_url,
        content=new_post.content,
        category=new_post.category,
        technology_tags=tags,
        nice_count=0,
        is_niced_by_me=False,  # 投稿作成時点では自分の投稿にいいねはできないのでFalse
        created_at=new_post.created_at
    )

    return post_response, exp_result

def get_posts(db_session: Session, limit: int = 20):
    # 投稿取得処理を実装
    posts = db_session.query(post_model.Post).limit(limit).all()
    return posts

def delete_post(db_session: Session, post_id: str):
    # 投稿削除処理を実装
    # データベースから投稿を削除する処理を行う
    post = db_session.query(post_model.Post).filter(post_model.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_session.delete(post)
    db_session.commit()

    return {"message": f"Post with id {post_id} deleted"}

def toggle_nice(db_session: Session, post_id: str, user_id: str):
    # 投稿のいいね処理を実装
    post = db_session.query(post_model.Post).filter(post_model.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot nice your own post")

    existing_nice = db_session.query(nice_model.Nice).filter_by(post_id=post_id, user_id=user_id).first()
    if existing_nice:
        raise HTTPException(status_code=400, detail="Already niced this post")

    new_nice = nice_model.Nice(post_id=post_id, user_id=user_id)
    db_session.add(new_nice)

    db_session.commit()

    return {"message": f"Nice added for post with id {post_id}"}

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

def _calc_exp_and_evolve(db_session: Session, user: user_model.Users):
    # 投稿に対していいねがされたときの経験値計算と進化処理を実装
    # ここでは仮の処理として、経験値を10増加させる例を示す
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_level = user.experience_points // EVOLUTION_THRESHOLD
    
    user.experience_points += XP_PER_POST  # 経験値を追加
    db_session.commit()

    # 進化条件のチェック（例: 経験値が100以上で進化）
    new_level = user.experience_points // EVOLUTION_THRESHOLD

    is_evolved = (old_level != new_level)

    if new_level == 0:
        character_stage = CharacterStage.Egg  # 進化後のステージに変更
    else:
        character_stage = CharacterStage.Chick  # 進化後のステージに変更
    # elif new_level == 2:
    #     character_stage = CharacterStage.Stage3  # 進化後のステージに変更
    # else:
    #     character_stage = CharacterStage.Stage4  # 進化後のステージに変更

    exp_result = ExpResult(
        gained=XP_PER_POST,
        total=user.experience_points,
        evolved=is_evolved,
        character_stage=character_stage
    )

    return exp_result