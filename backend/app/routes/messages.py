from __future__ import annotations

import uuid
from asyncio import to_thread
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import CreateMessageRequest, MessageResponse
from ..services.message_service import add_message, get_messages
from ..services.storage_service import save_image

router = APIRouter(prefix="/boards", tags=["messages"])


@router.post("/{board_id}/messages", response_model=MessageResponse)
async def add_message_route(
    board_id: uuid.UUID,
    author_name: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    image_url = None

    if image and image.filename:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

        file_bytes = await image.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")

        try:
            image_url = await to_thread(save_image, file_bytes, str(board_id))
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Unable to process uploaded image.") from exc

    payload = CreateMessageRequest(
        author_name=author_name,
        content=content,
        image_url=image_url,
    )
    return add_message(db, board_id, payload)


@router.get("/{board_id}/messages", response_model=List[MessageResponse])
def get_messages_route(board_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_messages(db, board_id)
