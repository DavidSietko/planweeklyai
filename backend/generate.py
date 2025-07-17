from fastapi import APIRouter, Request, HTTPException   
from os import getenv
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import get_db_connection, get_user_id, refresh_access_token
from openai import OpenAI
import requests
from datetime import datetime, timedelta, timezone
import pytz
import json

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
    if user["token_expiry"] < datetime.now(timezone.utc):
        token = refresh_access_token(user["refresh_token"])
        if not token:
            raise HTTPException(status_code=401, detail="Failed to refresh access token. Please log in again.")
        access_token = token["access_token"]
        cursor.execute("UPDATE users SET access_token = %s, token_expiry = %s WHERE id = %s", (access_token, token["expires_in"], user_id))
    conn.commit()
    
    time_zone = schedule["time_zone"]
    calendar = get_google_calendar_events(access_token, time_zone)
    events = extract_events(calendar)

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=getenv("OPENROUTER_API_KEY")
    )

    # Prepare data for the AI prompt
    user_schedule_json = json.dumps(schedule, default=str)
    google_events_json = json.dumps(events, default=str)

    prompt = f"""
You are an AI scheduling assistant. The user has designed a preferred weekly schedule with tasks and mandatory tasks, and already has some events in their Google Calendar for this week.

Your job is to generate a new weekly schedule for the user, in JSON format, that:
- Includes all mandatory tasks at their specified times.
- Schedules as many preferred tasks as possible, respecting their frequency, preferred time of day, and priority.
- Avoids conflicts with existing Google Calendar events (do not overlap).
- Fills the week as efficiently as possible, but does not double-book any time slots.
- All times should be in the user's time zone: {time_zone}.

Here is the user's designed schedule (in JSON):
{user_schedule_json}

Here are the user's existing Google Calendar events for this week (in JSON):
{google_events_json}

Output only STRICTLY a JSON array of Google Calendar event objects .NOTHING ELSE, each with: summary, description (if any), location (if any), start (with dateTime and timeZone), and end (with dateTime and timeZone).
"""

    completion = client.chat.completions.create(
        extra_body={},
        model="moonshotai/kimi-k2:free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    response_text = completion.choices[0].message.content
    print("AI response:", repr(response_text))
    if not response_text:
        raise HTTPException(status_code=500, detail="Failed to generate schedule. Please try again.")

    events = json.loads(response_text)

    print(f"events: {events}")
    return events

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
