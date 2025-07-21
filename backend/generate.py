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
        token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token["expires_in"])
        cursor.execute("UPDATE users SET access_token = %s, token_expiry = %s WHERE id = %s", (access_token, token_expiry, user_id))
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
You are an advanced AI scheduling assistant tasked with creating an optimal weekly schedule while strictly avoiding all conflicts. The user has provided their ideal weekly schedule template and their existing Google Calendar events.

YOUR PRIMARY OBJECTIVES (IN ORDER OF IMPORTANCE):
1. MUST include ALL mandatory tasks at their exact specified times (no changes allowed)
2. MUST avoid ALL conflicts with existing Google Calendar events (absolute priority)
3. Schedule preferred tasks according to their:
   - Priority (higher first)
   - Preferred time windows
   - Frequency requirements
4. NEVER double-book any time slots
5. Maintain reasonable breaks between tasks when possible

STRICT REQUIREMENTS:
- All times must be in {time_zone} timezone
- Each event must have buffer time (at least 30 minutes between events unless otherwise specified)
- If a preferred task cannot be scheduled without conflict, it should be skipped (do not force it)
- Absolutely NO overlapping events (cross-validate all events against each other and existing events)
- For recurring tasks, ensure ALL instances comply with the rules

INPUT DATA:
1. User's ideal schedule template (JSON):
{user_schedule_json}

2. Existing Google Calendar events this week (JSON):
{google_events_json}

OUTPUT REQUIREMENTS:
- Generate ONLY a valid JSON array of event objects
- Each event MUST include:
  * summary (string)
  * description (string, optional)
  * location (string, optional)
  * start (object with dateTime in ISO8601 and timeZone)
  * end (object with dateTime in ISO8601 and timeZone)
- ONLY include these fields in a given event
- Events should be ordered chronologically in the array
- Include ONLY new events to be added (do not include existing events)
- If no valid schedule can be created without conflicts, return an empty array
- Schedule tasks on the weekend if possible

VALIDATION STEPS YOU MUST PERFORM:
1. First place all mandatory events at their fixed times
2. Then add existing calendar events as immutable blocks
3. For preferred tasks:
   a. Sort by priority (highest first)
   b. For each task, find the first available slot that:
      - Matches preferred time window
      - Doesn't conflict with mandatory/existing events
      - Has sufficient duration
      - Maintains buffer time
4. Double-check no events overlap (start < end of previous event)
5. Verify all timezones are correctly set to {time_zone}

OUTPUT ONLY THE JSON ARRAY. NO EXPLANATIONS, NO COMMENTS, NO APOLOGIES, ONLY VALID JSON.
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
    if not response_text:
        raise HTTPException(status_code=500, detail="Failed to generate schedule. Please try again.")

    events = json.loads(response_text)

    conn.commit()
    conn.close()
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
