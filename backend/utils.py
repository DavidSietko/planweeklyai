from jose import exceptions, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "superjwtsecret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")