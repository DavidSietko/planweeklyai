from fastapi import APIRouter
from fastapi import Request
from fastapi import HTTPException
from utils import get_user_id, get_token, get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime, time, timezone
import json
from typing import List, Dict, Any

router = APIRouter()

def parse_time_string(time_str: str) -> time:
    """Convert time string (HH:MM) to time object"""
    try:
        hours, minutes = map(int, time_str.split(':'))
        return time(hours, minutes)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail=f"Invalid time format: {time_str}. Expected HH:MM")

def format_time_for_db(time_str: str) -> time:
    """Convert frontend time string to PostgreSQL time type"""
    return parse_time_string(time_str)

def format_active_days_for_db(active_days: List[str]) -> str:
    """Convert active days list to JSONB string - matches frontend Day enum values"""
    # Frontend sends: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    # We store as JSONB array of uppercase strings
    return json.dumps(active_days)

def format_tasks_for_db(tasks: List[Dict[str, Any]]) -> str:
    """Convert tasks list to JSONB string - matches frontend Task interface"""
    # Frontend Task structure:
    # {
    #   id: string,
    #   summary: string,
    #   duration: { hours: number, minutes: number },
    #   onWeekends: boolean,
    #   preferredTime?: "morning" | "afternoon" | "evening" | "night",
    #   frequency: number,
    #   color?: string,
    #   priority?: 'low' | 'medium' | 'high'
    # }
    return json.dumps(tasks)

def format_mandatory_tasks_for_db(mandatory_tasks: List[Dict[str, Any]]) -> str:
    """Convert mandatory tasks list to JSONB string - matches frontend MandatoryTask interface"""
    # Frontend MandatoryTask structure:
    # {
    #   id: string,
    #   summary: string,
    #   startTime: string, // "HH:MM"
    #   endTime: string,   // "HH:MM"
    #   startDay: Day,
    #   endDay: Day,
    #   color?: string,
    #   location?: string
    # }
    return json.dumps(mandatory_tasks)

def get_current_timestamp() -> datetime:
    """Get current UTC timestamp for timestamptz fields"""
    return datetime.now(timezone.utc)

def time_to_str(val):
    if isinstance(val, time):
        return val.strftime("%H:%M")
    if isinstance(val, str):
        return val
    return ""

@router.get("/schedule/get")
def get_schedule(request: Request):
    cookie_token = get_token(request)
    if not cookie_token:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")
    user_id = get_user_id(cookie_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="There was an error logging in. Please log in again.")
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # check if user_id matches a valid user in the database
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please log in.")

    cursor.execute("SELECT * FROM schedules WHERE user_id = %s", (user_id,))
    schedule = cursor.fetchone()
    if not schedule:
        # create a new schedule with proper PostgreSQL types matching frontend structure
        cursor.execute("""INSERT INTO schedules (
    user_id, name, start_time, end_time, active_days, tasks, mandatory_tasks, created_at, updated_at )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
    (
        user_id, 
        "My Schedule",
        time(9, 0),
        time(17, 0),
        format_active_days_for_db(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
        format_tasks_for_db([]),
        format_mandatory_tasks_for_db([]),
        get_current_timestamp(),
        get_current_timestamp()
    ))
        conn.commit()
        cursor.execute("SELECT * FROM schedules WHERE user_id = %s", (user_id,))
        schedule = cursor.fetchone()
    
    cursor.close()
    conn.close()
    if schedule:
        schedule["start_time"] = time_to_str(schedule["start_time"])
        schedule["end_time"] = time_to_str(schedule["end_time"])
    return schedule

@router.post("/schedule/save")
async def save_schedule(request: Request):
    cookie_token = get_token(request)
    user_id = get_user_id(cookie_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")#

    data = await request.json()
    name = data.get("name")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    active_days = data.get("active_days")
    tasks = data.get("tasks")
    mandatory_tasks = data.get("mandatory_tasks")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""UPDATE schedules SET name = %s, start_time = %s, end_time = %s, active_days = %s, tasks = %s, mandatory_tasks = %s, updated_at = %s WHERE user_id = %s""",
    (name, 
    start_time, 
    end_time, 
    format_active_days_for_db(active_days),
    format_tasks_for_db(tasks),
    format_mandatory_tasks_for_db(mandatory_tasks),
    get_current_timestamp(), user_id))

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Schedule saved successfully"}




