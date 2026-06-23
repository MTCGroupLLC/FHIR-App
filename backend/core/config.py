from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-key"
    environment: str = "development"
    endpoint_rate_limit: int = 2
    max_concurrent_queries: int = 50
    endpoint_timeout: int = 10
    smart_client_id: str = "drls-public"
    smart_redirect_uri: str = "http://localhost:3000/auth/callback"

    class Config:
        env_file = ".env"


settings = Settings()
