from fastapi import FastAPI, Request, Response
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
import google_auth_oauthlib.flow
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "supersecret"))

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar"
]
REDIRECT_URI = "http://localhost:8000/auth/google/callback"


def get_db_connection():
    return psycopg2.connect(
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port=os.getenv("port"),
        dbname=os.getenv("dbname")
    )


@app.get("/")
def main():
    return {"message": "Hello, World!"}

@app.get("/auth/google/login")
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

@app.get("/auth/google/callback")
def google_callback(request: Request):
    state = request.session.get('state')
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

    # Extract user info from ID token
    id_token_value = getattr(credentials, 'id_token', None) or getattr(credentials, '_id_token', None)
    if not id_token_value:
        return {"error": "No id_token returned from Google. Cannot authenticate user."}

    id_info = id_token.verify_oauth2_token(
        id_token_value,
        requests.Request(),
        credentials.client_id
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

        # Store user ID in session
        request.session["user_id"] = user_id

    except Exception as e:
        print("DB Error:", e)
        return {"error": "Failed to process user info"}

    return RedirectResponse(url="http://localhost:3000")
