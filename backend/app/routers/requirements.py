from fastapi import APIRouter

router = APIRouter(prefix="/api/requirements", tags=["Requirements"])

@router.get("?limit=20")
def get_requirements(limit: int = 20):
    # タイムライン新着順。cursor対応はv4仕様のまま維持(フロント初期は未使用)
    return {"message": f"List of requirements with limit: {limit}"}

@router.post("/")
def create_requirement():
    # 募集作成処理を実装
    return {"message": "Requirement created"}

@router.get("/{requirement_id}")
def get_requirement(requirement_id: int):
    # 募集詳細を取得する処理を実装
    return {"message": f"Requirement details for requirement_id: {requirement_id}"}

@router.patch("/{requirement_id}")
def update_requirement(requirement_id: int):
    # 募集更新処理を実装
    return {"message": f"Requirement with id {requirement_id} updated"}

@router.post("/{requirement_id}/interest")
def add_interest(requirement_id: int):
    # 募集に対して「興味あり」を追加する処理を実装
    return {"message": f"Interest added to requirement with id {requirement_id}"}

@router.delete("/{requirement_id}/interest")
def remove_interest(requirement_id: int):
    # 募集に対して「興味あり」を削除する処理を実装
    return {"message": f"Interest removed from requirement with id {requirement_id}"}

@router.get("/{requirement_id}/interests")
def get_interests(requirement_id: int):
    # 募集に対して「興味あり」をしたユーザー一覧を取得する処理を実装
    return {"message": f"List of users interested in requirement with id {requirement_id}"}