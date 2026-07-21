from fastapi import UploadFile, HTTPException

def create_post(user_id: str, content: str, tech_tags: list, image_file: UploadFile = None):
    # 投稿作成処理を実装
    image_content_type = _validate_image_file(image_file) if image_file else None

    # ファイルの保存やデータベースへの登録などの処理を行う

    return {"message": "Post created"}

def delete_post(post_id: str):
    # 投稿削除処理を実装
    # データベースから投稿を削除する処理を行う

    return {"message": f"Post with id {post_id} deleted"}

def _validate_image_file(file: UploadFile) -> str:
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