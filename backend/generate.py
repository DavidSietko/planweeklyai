from fastapi import APIRouter, Request
from os import getenv
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import get_db_connection
from openai import OpenAI

load_dotenv()

router = APIRouter()

@router.get("/generate/schedule")
def generate_schedule(request: Request):
    user_schedule = request.json()
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