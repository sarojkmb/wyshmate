from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

from .config import settings
from .database import Base, engine, get_db
from .models import Board, Message
from .schemas import (
    AdminBoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    CreateMessageRequest,
    MessageResponse,
    PublicBoardResponse,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/boards", response_model=CreateBoardResponse)
def create_board(payload: CreateBoardRequest, db: Session = Depends(get_db)) -> Board:
    board = Board(
        title=payload.title,
        occasion=payload.occasion,
        recipient_name=payload.recipient_name,
        admin_token=str(uuid.uuid4()),
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


@app.get("/boards/{board_id}", response_model=PublicBoardResponse)
def get_board(board_id: uuid.UUID, db: Session = Depends(get_db)) -> Board:
    board = db.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@app.get("/boards/{board_id}/admin", response_model=AdminBoardResponse)
def get_admin_board(
    board_id: uuid.UUID,
    token: str = Query(...),
    db: Session = Depends(get_db),
) -> Board:
    board = db.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    if board.admin_token != token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")
    return board


@app.post("/boards/{board_id}/messages", response_model=MessageResponse)
def add_message(
    board_id: uuid.UUID,
    payload: CreateMessageRequest,
    db: Session = Depends(get_db),
) -> Message:
    board = db.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    message = Message(
        board=board,
        author_name=payload.author_name,
        content=payload.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    db.refresh(board)
    return message


@app.get("/boards/{board_id}/messages", response_model=List[MessageResponse])
def get_messages(board_id: uuid.UUID, db: Session = Depends(get_db)) -> List[Message]:
    board = db.get(Board, board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")

    messages = (
        db.query(Message)
        .options(selectinload(Message.board))
        .filter(Message.board_id == board_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages
