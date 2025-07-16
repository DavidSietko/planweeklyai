from fastapi import APIRouter, Request
from os import getenv
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import get_db_connection

load_dotenv()

router = APIRouter()

@router.get("/generate/schedule")
def generate_schedule(request: Request):
    return {"message": "Hello, World!"}