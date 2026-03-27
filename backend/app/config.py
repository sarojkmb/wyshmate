from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Tuple
from urllib.parse import quote_plus


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("WYSHMATE_APP_NAME", "wyshmate-api")
    db_host: str = os.getenv("WYSHMATE_DB_HOST", "localhost")
    db_port: int = int(os.getenv("WYSHMATE_DB_PORT", "5432"))
    db_name: str = os.getenv("WYSHMATE_DB_NAME", "wyshmate")
    db_user: str = os.getenv("WYSHMATE_DB_USER", "")
    db_password: str = os.getenv("WYSHMATE_DB_PASSWORD", "")
    cors_origins: Tuple[str, ...] = ("*",)

    @property
    def database_url(self) -> str:
        credentials = ""
        if self.db_user:
            credentials = quote_plus(self.db_user)
            if self.db_password:
                credentials = f"{credentials}:{quote_plus(self.db_password)}"
            credentials = f"{credentials}@"

        return (
            f"postgresql+psycopg://{credentials}"
            f"{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
