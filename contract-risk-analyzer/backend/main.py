import sys
import os
# Add the current directory to sys.path so Vercel can find local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine, get_db, init_db
from routers import auth, upload, analyze, report

app = FastAPI(title="Contract Risk Analyzer API")

@app.on_event("startup")
async def on_startup():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://contractizer.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(report.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Contract Risk Analyzer API"}
