from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )


class CreateBoardRequest(ApiModel):
    title: Optional[str] = None
    occasion: str
    recipient_name: str


class PublicBoardResponse(ApiModel):
    id: UUID
    title: Optional[str] = None
    occasion: str
    recipient_name: str


class CreateBoardResponse(PublicBoardResponse):
    admin_token: str


class AdminBoardResponse(CreateBoardResponse):
    pass


class BoardRecord(CreateBoardResponse):
    created_at: datetime


class CreateMessageRequest(ApiModel):
    author_name: str
    content: str


class MessageResponse(ApiModel):
    id: UUID
    board: BoardRecord
    author_name: str
    content: str
    created_at: datetime
