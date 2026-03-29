from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    AdminBoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    PublicBoardResponse,
    UpdateBoardThemeRequest,
)
from ..services.board_service import create_board, get_admin_board, get_board, update_board_theme

router = APIRouter(prefix="/boards", tags=["boards"])


@router.post("", response_model=CreateBoardResponse)
def create_board_route(
    payload: CreateBoardRequest,
    db: Session = Depends(get_db),
):
    return create_board(db, payload)


@router.get("/{board_id}", response_model=PublicBoardResponse)
def get_board_route(board_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_board(db, board_id)


@router.get("/{board_id}/admin", response_model=AdminBoardResponse)
def get_admin_board_route(
    board_id: uuid.UUID,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    return get_admin_board(db, board_id, token)


@router.patch("/{board_id}/theme", response_model=AdminBoardResponse)
def update_board_theme_route(
    board_id: uuid.UUID,
    payload: UpdateBoardThemeRequest,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    return update_board_theme(db, board_id, token, payload.theme)
