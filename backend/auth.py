from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
import google_auth_oauthlib.flow
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from jose import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

router = APIRouter()

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar"
]
REDIRECT_URI = "http://localhost:8000/auth/google/callback"
JWT_SECRET = os.getenv("JWT_SECRET", "superjwtsecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = 60 * 24 * 7


def get_db_connection():
    return psycopg2.connect(
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port=os.getenv("port"),
        dbname=os.getenv("dbname")
    )

def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

@router.get("/auth/google/login")
def google_login(request: Request):
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'secrets/client_secret.json',
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    # Store state in session
    request.session['state'] = state
    return RedirectResponse(authorization_url)

@router.get("/auth/google/callback")
def google_callback(request: Request):
    state = request.session.get('state')
    returned_state = request.query_params.get("state")

    if not state or state != returned_state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'secrets/client_secret.json',
        scopes=SCOPES,
        state=state
    )
    flow.redirect_uri = REDIRECT_URI

    # Reconstruct the full URL the user was redirected to
    authorization_response = str(request.url)
    flow.fetch_token(authorization_response=authorization_response)

    credentials = flow.credentials

    id_token_value = getattr(credentials, 'id_token', None)
    if not id_token_value:
        return {"error": "No id_token returned from Google. Cannot authenticate user."}

    id_info = id_token.verify_oauth2_token(
        id_token_value,
        requests.Request(),
        credentials.client_id,
        clock_skew_in_seconds=10  # Allow 10 seconds of clock skew
    )

    google_sub = id_info["sub"]
    user_email = id_info["email"]
    granted_scopes = credentials.scopes  # Store as list for Postgres text[]
    token_expiry = credentials.expiry

    # Store/update in DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE google_sub = %s", (google_sub,))
        existing_user = cursor.fetchone()

        if existing_user:
            # Update token info
            cursor.execute("""
                UPDATE users SET 
                    access_token = %s,
                    refresh_token = %s,
                    token_expiry = %s,
                    granted_scopes = %s
                WHERE google_sub = %s
            """, (
                credentials.token,
                credentials.refresh_token,
                token_expiry,
                granted_scopes,
                google_sub
            ))
            user_id = existing_user['id']
        else:
            # Create new user
            cursor.execute("""
                INSERT INTO users (
                    google_sub, email, access_token, refresh_token, token_expiry, granted_scopes
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                google_sub,
                user_email,
                credentials.token,
                credentials.refresh_token,
                token_expiry,
                granted_scopes
            ))
            insert_result = cursor.fetchone()
            if insert_result is None:
                conn.rollback()
                cursor.close()
                conn.close()
                return {"error": "Failed to insert new user."}
            user_id = insert_result["id"]

        conn.commit()
        cursor.close()
        conn.close()

        # Delete session data after successful login
        request.session.clear()

        # Create JWT access token for the user
        jwt_expiry = timedelta(days=7)
        token = create_token({"user_id": user_id, "email": user_email}, expires_delta=jwt_expiry)

        response = RedirectResponse(url=f"{os.getenv('BASE_URL')}/dashboard")
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=int(jwt_expiry.total_seconds())
        )
        return response

    except Exception as e:
        print("DB Error:", e)
        return {"error": "Failed to process user info"}