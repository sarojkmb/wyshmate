from __future__ import annotations

import uuid
from asyncio import to_thread
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import CreateMessageRequest, MessageResponse
from ..services.message_service import add_message, get_messages
from ..services.storage_service import normalize_content_type, save_image, save_video

router = APIRouter(prefix="/boards", tags=["messages"])


@router.post("/{board_id}/messages", response_model=MessageResponse)
async def add_message_route(
    board_id: uuid.UUID,
    author_name: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(default=None),
    video: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    image_url = None
    video_url = None

    if image and image.filename:
        normalized_image_type = normalize_content_type(image.content_type or "")
        if not normalized_image_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

        file_bytes = await image.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")

        try:
            image_asset = await to_thread(
                save_image,
                file_bytes=file_bytes,
                board_id=str(board_id),
                content_type=normalized_image_type,
            )
            image_url = image_asset.url
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Unable to process uploaded image.") from exc

    if video and video.filename:
        normalized_video_type = normalize_content_type(video.content_type or "")
        if not normalized_video_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be a video.")

        file_bytes = await video.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded video is empty.")

        try:
            video_asset = await to_thread(
                save_video,
                file_bytes=file_bytes,
                board_id=str(board_id),
                content_type=normalized_video_type,
            )
            video_url = video_asset.url
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Unable to process uploaded video.") from exc

    payload = CreateMessageRequest(
        author_name=author_name,
        content=content,
        image_url=image_url,
        video_url=video_url,
    )
    return add_message(db, board_id, payload)


@router.get("/{board_id}/messages", response_model=List[MessageResponse])
def get_messages_route(board_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_messages(db, board_id)
