import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import motor.motor_asyncio
from bson import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# MongoDB connection
MONGO_URI = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client["task_management_db"]
tasks_collection = db["tasks"]
users_collection = db["users"]

# FastAPI app
app = FastAPI()

# CORS setup
FRONTEND_URL = os.getenv("FRONTEND_URL")

origins = [
    "http://localhost:4200",
]

if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-12345")
ALGORITHM = "HS256"
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str


class ProfileUpdate(BaseModel):
    name: str
    email: str


class TaskModel(BaseModel):
    title: str
    description: Optional[str] = ""
    completed: bool = False
    priority: str = "Low"
    pinned: bool = False


class TaskDB(TaskModel):
    id: str = Field(default_factory=str)
    user_id: str
    created_at: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    pinned: Optional[bool] = None


# Helpers
def task_helper(task) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description", ""),
        "completed": task.get("completed", False),
        "priority": task.get("priority", "Low"),
        "pinned": task.get("pinned", False),
        "user_id": str(task.get("user_id", "")),
        "created_at": task["_id"].generation_time.isoformat(),
    }


# Routes
@app.get("/")
async def root():
    return {"message": "API is running"}
