from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import random
from bson import ObjectId
from database import db  # Ensure database connection is initialized

router = APIRouter(prefix="/api/reports", tags=["Fraud Reports"])

# --- PYDANTIC SCHEMAS ---

class ReportCreate(BaseModel):
    title: str = Field(..., description="Report title/subject")
    description: str = Field(..., description="Detailed fraud incident description")
    email: EmailStr = Field(..., description="Customer email address")
    amount: float = Field(0.0, ge=0, description="Amount lost or requested")
    fraud_type: str = Field("Phishing", description="Fraud category (e.g., Phishing, UPI Scam, ATO)")
    channel: str = Field("Mobile", description="Incident channel (e.g., Mobile, Web, ATM, Branch)")
    city: str = Field("Dombivli, Maharashtra", description="Customer city/location")
    age: int = Field(..., ge=1, le=120, description="Customer age")
    status: Optional[str] = Field("Submitted", description="Initial report status")

class StatusUpdate(BaseModel):
    status: str = Field(..., description="Updated status string")

# --- ENDPOINTS ---

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(payload: ReportCreate):
    report_id = f"RPT-{random.randint(1000, 9999)}"
    
    try:
        data = payload.model_dump()
    except AttributeError:
        data = payload.dict()

    new_report = {
        "report_id": report_id,
        "title": data["title"],
        "description": data["description"],
        "email": data["email"],
        "amount": data["amount"],
        "fraud_type": data["fraud_type"],
        "channel": data.get("channel", "Mobile"),
        "city": data["city"],
        "age": data["age"],
        "status": data.get("status") or "Submitted",
        "badge_class": "chip-blue",
        "created_at": datetime.utcnow().isoformat(),
    }

    await db.reports.insert_one(new_report)
    new_report["_id"] = str(new_report["_id"])

    # Broadcast real-time threat alert to connected WebSocket clients
    try:
        from main import manager
        alert_payload = {
            "time": datetime.now().strftime("%H:%M:%S"),
            "t": f"Report: {new_report['fraud_type']} - {new_report['title']}",
            "loc": new_report["city"],
            "level": "Critical" if new_report["amount"] >= 50000 else "High"
        }
        await manager.broadcast(alert_payload)
    except Exception as e:
        print(f"WebSocket broadcast warning: {e}")

    return new_report


@router.get("/")
async def get_all_reports(email: Optional[str] = Query(None, description="Filter reports by customer email")):
    query = {}
    if email:
        query["email"] = email

    reports = []
    cursor = db.reports.find(query)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        reports.append(doc)
    return reports


@router.patch("/{report_id}")
@router.patch("/{report_id}/status")
async def update_report_status(report_id: str, payload: StatusUpdate):
    cls_map = {
        "Submitted": "chip-blue",
        "Received": "chip-blue",
        "Under review": "chip-orange",
        "Investigating": "chip-orange",
        "Under Working": "chip-orange",
        "Resolved": "chip-green",
        "Case Completed": "chip-green",
        "Rejected": "chip-red",
    }
    badge_cls = cls_map.get(payload.status, "chip-blue")

    # Build query to match either custom 'report_id' or MongoDB '_id'
    query_conditions = [{"report_id": report_id}]
    if ObjectId.is_valid(report_id):
        query_conditions.append({"_id": ObjectId(report_id)})

    result = await db.reports.update_one(
        {"$or": query_conditions},
        {"$set": {"status": payload.status, "badge_class": badge_cls}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {"message": "Status updated successfully", "status": payload.status}


@router.delete("/{report_id}")
async def delete_report(report_id: str):
    # Build query to match either custom 'report_id' or MongoDB '_id'
    query_conditions = [{"report_id": report_id}]
    if ObjectId.is_valid(report_id):
        query_conditions.append({"_id": ObjectId(report_id)})

    result = await db.reports.delete_one({"$or": query_conditions})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {"message": "Report deleted successfully"}