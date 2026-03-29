from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import Board
from ..schemas import CreateBoardRequest

THEME_ALIASES = {
    "birthday": "confetti-pop",
    "farewell": "soft-harbor",
    "celebration": "golden-glow",
    "confetti-pop": "confetti-pop",
    "soft-harbor": "soft-harbor",
    "golden-glow": "golden-glow",
    "midnight-spark": "midnight-spark",
}


def _derive_theme(occasion: str) -> str:
    normalized = occasion.strip().lower()
    if normalized == "birthday":
        return "confetti-pop"
    if normalized == "farewell":
        return "soft-harbor"
    return "golden-glow"


def normalize_theme(theme: str | None, occasion: str) -> str:
    normalized = (theme or "").strip().lower()
    if not normalized:
        return _derive_theme(occasion)
    return THEME_ALIASES.get(normalized, _derive_theme(occasion))


def create_board(db: Session, payload: CreateBoardRequest) -> Board:
    theme = normalize_theme(payload.theme, payload.occasion)
    board = Board(
        title=payload.title,
        occasion=payload.occasion,
        theme=theme,
        recipient_name=payload.recipient_name,
        admin_token=str(uuid.uuid4()),
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def get_board(db: Session, board_id: uuid.UUID) -> Board:
    board = db.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


def get_admin_board(db: Session, board_id: uuid.UUID, token: str) -> Board:
    board = get_board(db, board_id)
    if board.admin_token != token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")
    return board


def update_board_theme(db: Session, board_id: uuid.UUID, token: str, theme: str) -> Board:
    board = get_admin_board(db, board_id, token)
    board.theme = normalize_theme(theme, board.occasion)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board
