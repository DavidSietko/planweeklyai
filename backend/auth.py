from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import google_auth_oauthlib.flow
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from psycopg2.extras import RealDictCursor
from datetime import timedelta
from utils import get_db_connection, create_token, get_token, get_user_id
router = APIRouter()

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar"
]

@router.get("/auth/login")
def login(request: Request):
    user_id = get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found. Please log in again.")
    else:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="User not found. Please log in again.")
        else:
            return {"message": "Login successful"}

@router.get("/auth/google/login")
def google_login(request: Request):
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'secrets/client_secret.json',
        scopes=SCOPES
    )
    flow.redirect_uri = os.getenv("REDIRECT_URI")

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
    # Handle Google OAuth errors (like access_denied)
    error_param = request.query_params.get("error")
    if error_param:
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL')}/login?error=calendar_access_required"
        )
    
    state = request.session.get('state')
    returned_state = request.query_params.get("state")

    if not state or state != returned_state:
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL')}/login?error=calendar_access_required",
        )

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        'secrets/client_secret.json',
        scopes=SCOPES,
        state=state
    )
    flow.redirect_uri = os.getenv("REDIRECT_URI")

    # Reconstruct the full URL the user was redirected to
    authorization_response = str(request.url)
    flow.fetch_token(authorization_response=authorization_response)

    credentials = flow.credentials

    id_token_value = getattr(credentials, 'id_token', None)
    if not id_token_value:
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL')}/login?error=server_error",
        )

    id_info = id_token.verify_oauth2_token(
        id_token_value,
        requests.Request(),
        credentials.client_id,
        clock_skew_in_seconds=10  # Allow 10 seconds of clock skew
    )

    user_email = id_info["email"]
    granted_scopes = credentials.scopes  # Store as list for Postgres text[]
    token_expiry = credentials.expiry

    # Store/update in DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        existing_user = cursor.fetchone()

        if existing_user:
            # Update token info
            cursor.execute("""
                UPDATE users SET 
                    access_token = %s,
                    refresh_token = %s,
                    token_expiry = %s,
                    granted_scopes = %s
                WHERE id = %s
            """, (
                credentials.token,
                credentials.refresh_token,
                token_expiry,
                granted_scopes,
                existing_user['id']
            ))
            user_id = existing_user['id']
        else:
            # Create new user
            cursor.execute("""
                INSERT INTO users (
                    email, access_token, refresh_token, token_expiry, granted_scopes
                ) VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
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
                return RedirectResponse(
                    url=f"{os.getenv('FRONTEND_URL')}/login?error=server_error",)
            user_id = insert_result["id"]

        conn.commit()
        cursor.close()
        conn.close()

        # Delete session data after successful login
        request.session.clear()

        # Create JWT access token for the user
        jwt_expiry = timedelta(days=7)
        token = create_token({"user_id": user_id, "email": user_email}, expires_delta=jwt_expiry)

        # Always redirect to dashboard - calendar permissions will be checked when needed
        response = RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/dashboard")
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
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL')}/login?error=server_error")



@router.get("/auth/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    
    # Delete the token cookie
    response.set_cookie(
        key="token",
        value="",
        expires=0,
        max_age=0,
        httponly=True,
        secure=True,
        samesite="lax"
    )
    
    return response

@router.delete("/auth/delete/account")
def delete_account(request: Request):
    user_id = get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Looks like you are not logged in. Please log in before deleting your account.")
    
    # Delete user from database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE user_id = %s", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()
    
    response = JSONResponse(content={"message": "Account deleted successfully"})
    
    # Delete the token cookie
    response.set_cookie(
        key="token",
        value="",
        expires=0,
        max_age=0,
        httponly=True,
        secure=True,
        samesite="lax"
    )
    
    return response
