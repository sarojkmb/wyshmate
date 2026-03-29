from __future__ import annotations

import io
import uuid
from pathlib import Path

from PIL import Image

from ..config import settings


def build_image_url(relative_path: str) -> str:
    base = settings.public_base_url.rstrip("/")
    return f"{base}/uploads/{relative_path}"


def _resize_and_compress_image(file_bytes: bytes) -> bytes:
    with Image.open(io.BytesIO(file_bytes)) as source_image:
        image = source_image.convert("RGB")

        if image.width > 800:
            ratio = 800 / image.width
            image = image.resize((800, max(1, int(image.height * ratio))), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        image.save(output, format="JPEG", quality=70, optimize=True)
        return output.getvalue()


def save_image(file_bytes: bytes, board_id: str) -> str:
    board_folder = Path(settings.upload_root) / board_id
    board_folder.mkdir(parents=True, exist_ok=True)

    file_name = f"{uuid.uuid4()}.jpg"
    relative_path = f"{board_id}/{file_name}"
    destination = board_folder / file_name

    destination.write_bytes(_resize_and_compress_image(file_bytes))
    return build_image_url(relative_path)
