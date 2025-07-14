from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware
from auth import router as auth_router
from schedule import router as schedule_router
import os

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "supersecret"))
app.include_router(auth_router)
app.include_router(schedule_router)
