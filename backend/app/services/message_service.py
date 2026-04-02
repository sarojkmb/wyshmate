from __future__ import annotations

import uuid
from typing import List

from sqlalchemy.orm import Session, selectinload

from ..models import Message
from ..schemas import CreateMessageRequest
from .board_service import get_board


def add_message(db: Session, board_id: uuid.UUID, payload: CreateMessageRequest) -> Message:
    board = get_board(db, board_id)
    message = Message(
        board=board,
        author_name=payload.author_name,
        content=payload.content,
        image_url=payload.image_url,
        video_url=payload.video_url,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    db.refresh(board)
    return message


def get_messages(db: Session, board_id: uuid.UUID) -> List[Message]:
    get_board(db, board_id)
    return (
        db.query(Message)
        .options(selectinload(Message.board))
        .filter(Message.board_id == board_id)
        .order_by(Message.created_at.asc())
        .all()
    )
