from fastapi import APIRouter

router = APIRouter(prefix="/api/recruitments", tags=["Recruitments"])

@router.get("?limit=20")
def get_recruitments(limit: int = 20):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return {"message": f"List of recruitments with limit: {limit}"}

@router.post("/")
def create_recruitment():
    # 募集作成処理を実装
    return {"message": "Recruitment created"}

@router.get("/{recruitment_id}")
def get_recruitment(recruitment_id: int):
    # 募集詳細を取得する処理を実装
    return {"message": f"Recruitment details for recruitment_id: {recruitment_id}"}

@router.patch("/{recruitment_id}")
def update_recruitment(recruitment_id: int):
    # 募集更新処理を実装
    return {"message": f"Recruitment with id {recruitment_id} updated"}

@router.post("/{recruitment_id}/interest")
def add_interest(recruitment_id: int):
    # 募集に対して「興味あり」を追加する処理を実装
    return {"message": f"Interest added to recruitment with id {recruitment_id}"}

@router.delete("/{recruitment_id}/interest")
def remove_interest(recruitment_id: int):
    # 募集に対して「興味あり」を削除する処理を実装
    return {"message": f"Interest removed from recruitment with id {recruitment_id}"}

@router.get("/{recruitment_id}/interests")
def get_interests(recruitment_id: int):
    # 募集に対して「興味あり」をしたユーザー一覧を取得する処理を実装
    return {"message": f"List of users interested in recruitment with id {recruitment_id}"}