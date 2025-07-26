from curses import OK
from fastapi import APIRouter, Request, HTTPException, status
from dotenv import load_dotenv
import requests
from utils import get_db_connection, get_user_id, refresh_access_token
from datetime import datetime, timedelta, timezone

load_dotenv()

router = APIRouter()

@router.post("/sync/schedule")
async def sync_schedule(request: Request):
    user_id = get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="User not logged in. Please log in again.")

    # Get user's access token from DB
    conn = get_db_connection()
    cursor = conn.cursor()
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

    # Get events from request body
    events = await request.json()
    if not events:
        raise HTTPException(status_code=400, detail="No events provided.")

    # Insert each event into Google Calendar
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    for event in events:
        response = requests.post(url, headers=headers, json=event)
        if not response.ok:
            raise HTTPException(status_code=400, detail="There was an error syncing your schedule. Please try again")

    return {"success"}
    
