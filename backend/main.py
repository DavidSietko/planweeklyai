from fastapi import FastAPI, Request, Response
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
import google_auth_oauthlib.flow
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "supersecret"))

SCOPES = [
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
    # Store credentials in session or database as needed
    request.session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return RedirectResponse(url="/")
