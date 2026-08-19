from fastapi import APIRouter, HTTPException, status
from database import users_collection
from schemas import (
    CustomerRegisterSchema,
    AdminRegisterSchema,
    CustomerLoginSchema,
    AdminLoginSchema,
)
from security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# --- HELPER FUNCTION ---

def serialize_user(user_dict: dict) -> dict:
    """Formats MongoDB document into a frontend-safe JSON object."""
    return {
        "id": str(user_dict.get("_id", "")),
        "name": user_dict.get("name", ""),
        "email": user_dict.get("email", ""),
        "role": user_dict.get("role", "customer"),
        "empId": user_dict.get("empId"),
        "department": user_dict.get("department"),
    }


# --- CUSTOMER ENDPOINTS ---

@router.post("/register/customer", status_code=status.HTTP_201_CREATED)
async def register_customer(data: CustomerRegisterSchema):
    existing_user = await users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user_dict = {
        "role": "customer",
        "name": data.name,
        "email": data.email,
        "phone": getattr(data, "phone", None),
        "password": hash_password(data.password),
    }
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id

    formatted_user = serialize_user(user_dict)

    token = create_access_token({
        "sub": data.email,
        "role": "customer",
        "name": data.name,
    })

    return {
        "token": token,
        "user": formatted_user,
    }


@router.post("/login/customer")
async def login_customer(data: CustomerLoginSchema):
    user = await users_collection.find_one({"email": data.email, "role": "customer"})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    formatted_user = serialize_user(user)

    token = create_access_token({
        "sub": user["email"],
        "role": "customer",
        "name": user["name"],
    })

    return {
        "token": token,
        "user": formatted_user,
    }


# --- ADMIN ENDPOINTS ---

@router.post("/register/admin", status_code=status.HTTP_201_CREATED)
async def register_admin(data: AdminRegisterSchema):
    existing_admin = await users_collection.find_one({"empId": data.empId})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already registered",
        )

    admin_dict = {
        "role": "admin",
        "name": data.name,
        "empId": data.empId,
        "department": data.department,
        "email": data.email,
        "password": hash_password(data.password),
    }
    result = await users_collection.insert_one(admin_dict)
    admin_dict["_id"] = result.inserted_id

    formatted_user = serialize_user(admin_dict)

    token = create_access_token({
        "sub": data.empId,
        "role": "admin",
        "name": data.name,
    })

    return {
        "token": token,
        "user": formatted_user,
    }


@router.post("/login/admin")
async def login_admin(data: AdminLoginSchema):
    user = await users_collection.find_one({"empId": data.empId, "role": "admin"})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or password",
        )

    formatted_user = serialize_user(user)

    token = create_access_token({
        "sub": user["empId"],
        "role": "admin",
        "name": user["name"],
    })

    return {
        "token": token,
        "user": formatted_user,
    }