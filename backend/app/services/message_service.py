"""ダイレクトメッセージ。

会話は conversations テーブルを持たず、messages の
「送信者と受信者の組み合わせ」から導出する。
"""

from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import messages as message_model, users as user_model
from app.schemas.messages import (
    ConversationListResponse,
    ConversationResponse,
    MessageCreate,
    MessageListResponse,
    MessageResponse,
    UnreadCountResponse,
)
from app.schemas.users import UserSummary

# 相手ごとの最新1件と未読数をまとめて取る。
# DISTINCT ON はPostgres固有だが、相関サブクエリより素直で速い。
#
# 注意: :param::uuid と書くと :: がSQLAlchemyのパラメータ記法と衝突して
# 構文エラーになる。cast(:param as uuid) を使うこと。
_CONVERSATIONS_SQL = text(
    """
    with pairs as (
      select
        case when sender_id = cast(:me as uuid) then receiver_id else sender_id end as partner_id,
        body, created_at, read_at, receiver_id
      from messages
      where sender_id = cast(:me as uuid) or receiver_id = cast(:me as uuid)
    ),
    latest as (
      select distinct on (partner_id) partner_id, body, created_at
      from pairs
      order by partner_id, created_at desc
    ),
    unread as (
      select partner_id, count(*) as unread_count
      from pairs
      where receiver_id = cast(:me as uuid) and read_at is null
      group by partner_id
    )
    select
      l.partner_id, l.body, l.created_at,
      coalesce(n.unread_count, 0) as unread_count,
      u.display_name, u.icon_url, u.learning_stage
    from latest l
    join users u on u.id = l.partner_id
    left join unread n on n.partner_id = l.partner_id
    order by l.created_at desc
    """
)


def get_conversations(db_session: Session, current_user_id: str) -> ConversationListResponse:
    rows = db_session.execute(_CONVERSATIONS_SQL, {"me": str(current_user_id)}).fetchall()

    return ConversationListResponse(
        items=[
            ConversationResponse(
                partner=UserSummary(
                    id=row.partner_id,
                    display_name=row.display_name,
                    # UserSummaryの項目はavatar_url。icon_urlを渡しても無視される
                    avatar_url=row.icon_url,
                    learning_stage=row.learning_stage,
                ),
                last_message=row.body,
                last_message_at=row.created_at,
                unread_count=row.unread_count,
            )
            for row in rows
        ]
    )


def get_messages_with(
    db_session: Session, current_user_id: str, partner_id: str, limit: int = 100
) -> MessageListResponse:
    """相手とのやりとりを古い順で返す。あわせて相手からの未読を既読にする。"""
    partner = _get_user_or_404(db_session, partner_id)

    messages = (
        db_session.query(message_model.Message)
        .filter(
            or_(
                (message_model.Message.sender_id == current_user_id)
                & (message_model.Message.receiver_id == partner_id),
                (message_model.Message.sender_id == partner_id)
                & (message_model.Message.receiver_id == current_user_id),
            )
        )
        .order_by(message_model.Message.created_at.desc())
        .limit(limit)
        .all()
    )
    # 新着からlimit件取ったあと、表示用に古い順へ戻す
    messages.reverse()

    # 開いた時点で相手からの分をまとめて既読にする
    db_session.query(message_model.Message).filter(
        message_model.Message.sender_id == partner_id,
        message_model.Message.receiver_id == current_user_id,
        message_model.Message.read_at.is_(None),
    ).update({message_model.Message.read_at: func.now()}, synchronize_session=False)
    db_session.commit()

    return MessageListResponse(
        partner=UserSummary(
            id=partner.id,
            display_name=partner.display_name,
            avatar_url=partner.icon_url,
            learning_stage=partner.learning_stage,
        ),
        items=[
            MessageResponse(
                id=m.id,
                sender_id=m.sender_id,
                body=m.body,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


def send_message(
    db_session: Session, current_user_id: str, partner_id: str, message_create: MessageCreate
) -> MessageResponse:
    if str(current_user_id) == str(partner_id):
        raise HTTPException(status_code=400, detail="自分自身にはメッセージを送れません")

    _get_user_or_404(db_session, partner_id)

    message = message_model.Message(
        sender_id=current_user_id,
        receiver_id=partner_id,
        body=message_create.body,
    )
    db_session.add(message)
    db_session.commit()
    db_session.refresh(message)

    return MessageResponse(
        id=message.id,
        sender_id=message.sender_id,
        body=message.body,
        created_at=message.created_at,
    )


def count_unread(db_session: Session, current_user_id: str) -> UnreadCountResponse:
    """ヘッダーのバッジ用。部分インデックス idx_messages_unread が効く"""
    count = (
        db_session.query(func.count())
        .select_from(message_model.Message)
        .filter(
            message_model.Message.receiver_id == current_user_id,
            message_model.Message.read_at.is_(None),
        )
        .scalar()
    )
    return UnreadCountResponse(unread_count=count)


def _get_user_or_404(db_session: Session, user_id: str):
    user = (
        db_session.query(user_model.Users)
        .filter(user_model.Users.id == user_id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    return user
