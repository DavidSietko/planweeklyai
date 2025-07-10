from fastapi import APIRouter
from fastapi import Request
from fastapi import HTTPException
from utils import get_user_id, get_token

router = APIRouter()

@router.get("/schedule")
def get_schedule(request: Request):
    cookie_token = get_token(request)
    user_id = get_user_id(cookie_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"message": "Hello, World!"}

