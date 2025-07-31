from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware
from auth import router as auth_router
from schedule import router as schedule_router
from generate import router as generate_router
from sync import router as sync_router
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "supersecret"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(schedule_router)
app.include_router(generate_router)
app.include_router(sync_router)
