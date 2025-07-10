from jose import exceptions, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import HTTPException
from dotenv import load_dotenv
import os
import psycopg2
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Request

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "superjwtsecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = 60 * 24 * 7

def get_token(request: Request):    
    return request.cookies.get("token")


# data must be a dictionary with the following keys: user_id, email
def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# returns the user_id from the token, from field user_id
def get_user_id(token: str | None):
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    payload = decode_token(token)
    return payload.get("user_id")


# returns the email from the token, from field email
def get_email(token: str | None):
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
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