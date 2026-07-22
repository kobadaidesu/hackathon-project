from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, File, Form
from models import post as post_model  # DBモデル（SQLAlchemy）を読み込む
from schemas.posts import PostCreate, PostUpdate, PostCategory

# 作成時の画像の受け取りのためにバラバラで受け取るようにする
def create_post(db_session: Session, content: str, category: PostCategory, technology_ids: list[int], image_file: UploadFile = None):
    # 投稿作成処理を実装
    image_url = None
    if image_file:
        image_url = _validate_and_upload_image(image_file)

    new_post = post_model.Post(
        user_id="dummy_user_id", # 後で認証機能から取得します
        content=content,
        category=category,
        image_url=image_url # ①で取得したURLを入れる！
    )

    db_session.add(new_post)
    db_session.commit()
    db_session.refresh(new_post)

    return new_post

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