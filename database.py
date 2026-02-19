import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()  # loads .env locally

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME") or ""
DB_USER = os.getenv("DB_USER") or ""
DB_PASS = os.getenv("DB_PASS") or ""

if not DB_NAME or not DB_USER or not DB_PASS:
    raise RuntimeError("Missing DB_NAME / DB_USER / DB_PASS in environment variables")

DB_PASS_ENC = quote_plus(DB_PASS)

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS_ENC}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    f"?charset=utf8mb4"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=280)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
