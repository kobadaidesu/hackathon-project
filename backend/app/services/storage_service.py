"""Supabase Storage への画像アップロード。

supabase-py は入れず、Storage の REST API を httpx で直接叩く
(httpx は既に依存にあるため追加インストールが不要)。

SUPABASE_SERVICE_KEY を使うので、必ずバックエンドからのみ実行する。
このキーはRLSを無視できる全権キーなので、フロントには渡さない。
"""

import logging
import uuid

import httpx
from fastapi import HTTPException, UploadFile

from app.config import settings
from app.constants import MAX_IMAGE_SIZE_BYTES

logger = logging.getLogger(__name__)

# 受け付けるContent-Typeと、保存時に付ける拡張子
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def upload_image(file: UploadFile, bucket: str, prefix: str) -> str:
    """画像を検証してアップロードし、公開URLを返す。

    prefix にはユーザーIDを渡す想定。パスが user_id/uuid.ext になるので
    ファイル名の衝突が起きず、誰の画像かも追える。
    """
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)
    if extension is None:
        raise HTTPException(
            status_code=400,
            detail="画像はJPEG / PNG / WebPのいずれかを選んでください",
        )

    # 全部読み込む前にサイズを確認する(巨大なファイルをメモリに載せないため)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size == 0:
        raise HTTPException(status_code=400, detail="ファイルが空です")
    if file_size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400, detail="ファイルサイズは5MB以下にしてください"
        )

    path = f"{prefix}/{uuid.uuid4()}.{extension}"
    upload_url = f"{settings.supabase_url}/storage/v1/object/{bucket}/{path}"

    try:
        response = httpx.post(
            upload_url,
            content=file.file.read(),
            headers={
                # sb_secret_ 形式のキーはJWTではないため、apikeyヘッダも必要。
                # Authorizationだけだと "Invalid Compact JWS" で弾かれる
                "Authorization": f"Bearer {settings.supabase_service_key}",
                "apikey": settings.supabase_service_key,
                "Content-Type": file.content_type,
                # 同じパスが既にあれば上書きする(UUIDなので通常は起きない)
                "x-upsert": "true",
            },
            timeout=30.0,
        )
    except httpx.HTTPError as exc:
        logger.error("Storageへの接続に失敗: %s", exc)
        raise HTTPException(
            status_code=502, detail="画像のアップロードに失敗しました"
        ) from exc

    if response.status_code >= 400:
        # Supabase側のメッセージはそのまま返さずログに残す(内部情報のため)
        logger.error(
            "Storageアップロードが失敗: status=%s body=%s",
            response.status_code,
            response.text[:500],
        )
        raise HTTPException(
            status_code=502, detail="画像のアップロードに失敗しました"
        )

    # バケットはpublicなので、この形式のURLがそのまま公開URLになる
    return f"{settings.supabase_url}/storage/v1/object/public/{bucket}/{path}"
