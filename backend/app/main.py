from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from .config import settings
from .database import Base, engine
from .routes import boards_router, messages_router

upload_root = Path(settings.upload_root)
upload_root.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE boards "
                "ADD COLUMN IF NOT EXISTS theme VARCHAR(255) NOT NULL DEFAULT 'celebration'"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE messages "
                "ADD COLUMN IF NOT EXISTS image_url VARCHAR(1024)"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE messages "
                "ADD COLUMN IF NOT EXISTS video_url VARCHAR(1024)"
            )
        )
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=upload_root), name="uploads")

app.include_router(boards_router)
app.include_router(messages_router)
