from __future__ import annotations

import io
import uuid
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

from ..config import settings

MAX_IMAGE_WIDTH = 800
IMAGE_QUALITY = 70
MAX_VIDEO_BYTES = 40 * 1024 * 1024

IMAGE_EXTENSION_BY_TYPE = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "jpg",
    "image/webp": "jpg",
}

VIDEO_EXTENSION_BY_TYPE = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
}


def normalize_content_type(content_type: str) -> str:
    return content_type.split(";", 1)[0].strip().lower()


@dataclass(frozen=True)
class StoredMedia:
    url: str
    relative_path: str
    media_type: str


class MediaStorage:
    def save_image(self, *, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
        raise NotImplementedError

    def save_video(self, *, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
        raise NotImplementedError


class LocalMediaStorage(MediaStorage):
    def __init__(self, upload_root: str):
        self.upload_root = Path(upload_root)

    def _build_public_url(self, relative_path: str) -> str:
        base = settings.public_base_url.rstrip("/")
        return f"{base}/uploads/{relative_path}"

    def _board_folder(self, board_id: str, media_kind: str) -> Path:
        folder = self.upload_root / "boards" / board_id / media_kind
        folder.mkdir(parents=True, exist_ok=True)
        return folder

    def save_image(self, *, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
        folder = self._board_folder(board_id, "images")
        file_name = f"{uuid.uuid4()}.jpg"
        relative_path = f"boards/{board_id}/images/{file_name}"
        destination = folder / file_name
        destination.write_bytes(_resize_and_compress_image(file_bytes))
        return StoredMedia(
            url=self._build_public_url(relative_path),
            relative_path=relative_path,
            media_type="image",
        )

    def save_video(self, *, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
        extension = VIDEO_EXTENSION_BY_TYPE.get(normalize_content_type(content_type))
        if not extension:
            raise ValueError("Unsupported video content type.")

        if len(file_bytes) > MAX_VIDEO_BYTES:
            raise ValueError("Uploaded video exceeds the size limit.")

        folder = self._board_folder(board_id, "videos")
        file_name = f"{uuid.uuid4()}.{extension}"
        relative_path = f"boards/{board_id}/videos/{file_name}"
        destination = folder / file_name
        destination.write_bytes(file_bytes)
        return StoredMedia(
            url=self._build_public_url(relative_path),
            relative_path=relative_path,
            media_type="video",
        )


def _resize_and_compress_image(file_bytes: bytes) -> bytes:
    with Image.open(io.BytesIO(file_bytes)) as source_image:
        image = source_image.convert("RGB")

        if image.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / image.width
            image = image.resize(
                (MAX_IMAGE_WIDTH, max(1, int(image.height * ratio))),
                Image.Resampling.LANCZOS,
            )

        output = io.BytesIO()
        image.save(output, format="JPEG", quality=IMAGE_QUALITY, optimize=True)
        return output.getvalue()


storage: MediaStorage = LocalMediaStorage(settings.upload_root)


def save_image(*, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
    return storage.save_image(file_bytes=file_bytes, board_id=board_id, content_type=content_type)


def save_video(*, file_bytes: bytes, board_id: str, content_type: str) -> StoredMedia:
    return storage.save_video(file_bytes=file_bytes, board_id=board_id, content_type=content_type)
