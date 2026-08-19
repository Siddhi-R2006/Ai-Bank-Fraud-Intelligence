from pydantic import BaseModel, Field
from typing import Optional


class ReportCreate(BaseModel):
    email: str
    fraud_type: str = Field(..., alias="fraud_type")
    channel: str = Field("Mobile", description="Source channel: Mobile, Web, ATM, or Branch")
    amount: float = 0.0
    title: str
    description: str
    city: str = "Dombivli, Maharashtra"
    age: int = Field(..., ge=1, le=120)
    status: Optional[str] = "Submitted"

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "customer@example.com",
                "fraud_type": "Phishing",
                "channel": "Mobile",
                "amount": 5000.0,
                "title": "Fraudulent UPI request received",
                "description": "Received a suspicious SMS claiming my account was locked.",
                "city": "Dombivli, Maharashtra",
                "age": 24,
                "status": "Submitted"
            }
        }