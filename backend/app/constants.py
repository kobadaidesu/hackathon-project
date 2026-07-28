XP_PER_POST=10
DAILY_XP_CAP=50
EVOLUTION_THRESHOLD=100  # デモ用に30へ調整可

# --- 画像アップロード ---
# バケットはSupabaseのダッシュボードで作成済み(どちらもpublic)
POST_IMAGE_BUCKET = "post-images"
AVATAR_BUCKET = "avatars"
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024