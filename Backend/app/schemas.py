from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# --- CUSTOMER SCHEMAS ---

class CustomerRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the customer")
    email: EmailStr = Field(..., description="Valid email address for customer login")
    phone: str = Field(..., min_length=10, max_length=15, description="Contact phone number")
    password: str = Field(..., min_length=6, max_length=128, description="Account password")


class CustomerLoginSchema(BaseModel):
    email: EmailStr = Field(..., description="Registered customer email")
    password: str = Field(..., description="Customer password")


# --- ADMIN / ANALYST SCHEMAS ---

class AdminRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the analyst")
    empId: str = Field(..., min_length=3, max_length=30, description="Unique employee identifier (e.g., EMP-2041)")
    department: str = Field("Cyber Fraud Intelligence", description="Department within fraud operations")
    email: EmailStr = Field(..., description="Work email address")
    password: str = Field(..., min_length=6, max_length=128, description="Analyst password")


class AdminLoginSchema(BaseModel):
    empId: str = Field(..., description="Registered Employee ID")
    password: str = Field(..., description="Analyst password")


# --- FRAUD REPORT SCHEMAS ---

class ReportCreateSchema(BaseModel):
    title: str = Field(..., description="Report title/subject")
    description: str = Field(..., description="Detailed fraud incident description")
    email: EmailStr = Field(..., description="Customer contact email")
    amount: float = Field(0.0, ge=0, description="Amount lost or requested")
    fraud_type: str = Field("Phishing", description="Category: Phishing, UPI Scam, ATO, Deepfake, Mule")
    channel: str = Field("Mobile", description="Source channel: Mobile, Web, ATM, or Branch")
    city: str = Field("Dombivli, Maharashtra", description="Incident location/city")
    age: int = Field(24, ge=1, le=120, description="Age of the victim")
    status: Optional[str] = Field("Submitted", description="Initial case status")


class ReportStatusUpdateSchema(BaseModel):
    status: str = Field(..., description="Updated status: Submitted, Investigating, Resolved")


# --- RESPONSE SCHEMAS ---

class UserResponseSchema(BaseModel):
    id: str
    name: str
    email: str
    role: str
    empId: Optional[str] = None
    department: Optional[str] = None


class AuthResponseSchema(BaseModel):
    token: str
    user: UserResponseSchema