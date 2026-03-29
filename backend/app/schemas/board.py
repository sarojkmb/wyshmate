from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import Field

from .base import ApiModel


class CreateBoardRequest(ApiModel):
    title: Optional[str] = None
    occasion: str
    theme: Optional[str] = None
    recipient_name: str = Field(alias="recipientName")


class UpdateBoardThemeRequest(ApiModel):
    theme: str


class PublicBoardResponse(ApiModel):
    id: UUID
    title: Optional[str] = None
    occasion: str
    theme: str
    recipient_name: str = Field(alias="recipientName")


class CreateBoardResponse(PublicBoardResponse):
    admin_token: str = Field(alias="adminToken")


class AdminBoardResponse(CreateBoardResponse):
    pass


class BoardRecord(CreateBoardResponse):
    created_at: datetime = Field(alias="createdAt")
