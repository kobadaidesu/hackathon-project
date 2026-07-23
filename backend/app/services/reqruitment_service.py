from fastapi import UploadFile, HTTPException

def create_recruitment(user_id: str, content: str, tech_tags: list):
    # 募集作成処理を実装
    
    # ファイルの保存やデータベースへの登録などの処理を行う
    return {"message": "Recruitment created"}