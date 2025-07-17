from fastapi import APIRouter, Request, HTTPException   
from os import getenv
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import get_db_connection, get_user_id
from openai import OpenAI

load_dotenv()

router = APIRouter()

@router.get("/generate/schedule")
def generate_schedule(request: Request):
    user_id = get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in. Please log in again")
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT * FROM schedules WHERE user_id = %s", (user_id,))
    schedule = cursor.fetchone()
    if not schedule:
        raise HTTPException(status_code=401, detail="No schedule found. Please create a schedule first.")

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=getenv("OPENROUTER_API_KEY")
    )

    completion = client.chat.completions.create(
        extra_body={},
        model="moonshotai/kimi-k2:free",
        messages=[
            {
                "role": "user",
                "content": "What is the meaning of life?"
            }
        ]
    )
    return completion.choices[0].message.content