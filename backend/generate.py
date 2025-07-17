from fastapi import APIRouter, Request, HTTPException   
from os import getenv
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import get_db_connection, get_user_id
from openai import OpenAI
import requests
from datetime import datetime, timedelta
import pytz

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

    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please log in again.")
    
    access_token = user["access_token"]
    time_zone = schedule["time_zone"]
    calendar = get_google_calendar_events(access_token, time_zone)
    events = extract_events(calendar)
    print(f"events: {events}")
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

def get_google_calendar_events(access_token, time_zone):
    # Calculate start and end of the current week in user's time zone
    tz = pytz.timezone(time_zone)
    now = datetime.now(tz)
    start_of_week = now - timedelta(days=now.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=7)

    time_min = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    time_max = end_of_week.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "singleEvents": True,
        "orderBy": "startTime",
        "maxResults": 2500
    }
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()["items"]

def extract_events(calendar):
    simplified = []
    for event in calendar:
        simplified.append({
            "summary": event.get("summary"),
            "start": {
                "dateTime": event.get("start", {}).get("dateTime"),
                "timeZone": event.get("start", {}).get("timeZone"),
            },
            "end": {
                "dateTime": event.get("end", {}).get("dateTime"),
                "timeZone": event.get("end", {}).get("timeZone"),
            }
        })
    return simplified
