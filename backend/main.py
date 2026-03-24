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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],['http://task-management-app-po2p.vercel.app/'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth globals
SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-12345")
ALGORITHM = "HS256"
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str

class TaskModel(BaseModel):
    title: str
    description: Optional[str] = ""
    completed: bool = False

class TaskDB(TaskModel):
    id: str = Field(default_factory=str)
    user_id: str

# Helpers
def task_helper(task) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description", ""),
        "completed": task.get("completed", False),
        "user_id": str(task.get("user_id", ""))
    }

# Routes
@app.get("/")
async def root():
    return {"message": "API is running"}

@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = {"name": user.name, "email": user.email, "password": hashed_password}
    result = await users_collection.insert_one(user_dict)
    
    user_id = str(result.inserted_id)
    token = create_access_token({"sub": user_id})
    return {"id": user_id, "name": user.name, "email": user.email, "token": token}

@app.post("/login", response_model=UserResponse)
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    user_id = str(db_user["_id"])
    token = create_access_token({"sub": user_id})
    return {"id": user_id, "name": db_user["name"], "email": db_user["email"], "token": token}

@app.get("/tasks", response_model=List[TaskDB])
async def get_tasks(user_id: str = Depends(get_current_user)):
    tasks = []
    async for task in tasks_collection.find({"user_id": user_id}):
        tasks.append(task_helper(task))
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskDB)
async def get_task(task_id: str, user_id: str = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id), "user_id": user_id})
    if task:
        return task_helper(task)
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/tasks", response_model=TaskDB)
async def create_task(task: TaskModel, user_id: str = Depends(get_current_user)):
    task_dict = task.dict()
    task_dict["user_id"] = user_id
    result = await tasks_collection.insert_one(task_dict)
    new_task = await tasks_collection.find_one({"_id": result.inserted_id})
    return task_helper(new_task)

@app.put("/tasks/{task_id}", response_model=TaskDB)
async def update_task(task_id: str, task: TaskModel, user_id: str = Depends(get_current_user)):
    result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id), "user_id": user_id}, {"$set": task.dict()}
    )
    if result.matched_count == 1:
        updated_task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
        return task_helper(updated_task)
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user)):
    result = await tasks_collection.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
    if result.deleted_count == 1:
        return {"detail": "Task deleted"}
    raise HTTPException(status_code=404, detail="Task not found")
