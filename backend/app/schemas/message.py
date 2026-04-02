from __future__ import annotations

from typing import Optional
from datetime import datetime
from uuid import UUID

from pydantic import Field

from .base import ApiModel
from .board import BoardRecord


class CreateMessageRequest(ApiModel):
    author_name: str = Field(alias="authorName")
    content: str
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    video_url: Optional[str] = Field(default=None, alias="videoUrl")


class MessageResponse(ApiModel):
    id: UUID
    board: BoardRecord
    author_name: str = Field(alias="authorName")
    content: str
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    video_url: Optional[str] = Field(default=None, alias="videoUrl")
    created_at: datetime = Field(alias="createdAt")
