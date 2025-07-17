from jose import exceptions, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import HTTPException
from dotenv import load_dotenv
import os
import psycopg2
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Request
from fastapi.responses import RedirectResponse

load_dotenv()

JWT_EXPIRE_MINUTES = 60 * 24 * 7

def get_token(request: Request):    
    return request.cookies.get("token") or None

def get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET environment variable must be set")
    return secret

def get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")

# data must be a dictionary with the following keys: user_id, email
def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    jwt_secret = get_jwt_secret()
    jwt_algorithm = get_jwt_algorithm()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, jwt_secret, algorithm=jwt_algorithm)
    return encoded_jwt

def decode_token(token: str):
    try:
        jwt_secret = get_jwt_secret()
        jwt_algorithm = get_jwt_algorithm()
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token. Please log in again.")

# returns the user_id from the token, from field user_id
def get_user_id(request: Request):
    token = get_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="No token provided. Please log in again.")
    payload = decode_token(token)
    return payload.get("user_id")

# returns the email from the token, from field email
def get_email(token: str | None):
    if not token:
        raise HTTPException(status_code=401, detail="No token provided. Please log in again.s")
    payload = decode_token(token)
    return payload.get("email")

def get_db_connection():
    return psycopg2.connect(
        user=os.getenv("user"),
        password=os.getenv("password"),
        host=os.getenv("host"),
        port=os.getenv("port"),
        dbname=os.getenv("dbname")
    )