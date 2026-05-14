import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, settings, deposits, expenses, dashboard, reports
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="UND Cooperative Society API")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://und-wajn.vercel.app")
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(settings.router)
app.include_router(deposits.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "UND Cooperative Society API"}
