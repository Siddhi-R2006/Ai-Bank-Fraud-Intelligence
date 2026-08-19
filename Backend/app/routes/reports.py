from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from app.models.report import ReportCreate

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# In-memory store or database collection handler
db_reports = []

@router.get("/", response_model=List[dict])
async def get_reports(email: Optional[str] = Query(None, description="Filter reports by user email")):
    """
    Retrieve reports. If an email query parameter is provided, 
    only reports belonging to that email are returned.
    """
    if email:
        return [r for r in db_reports if r.get("email") == email]
    return db_reports

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate):
    """
    Create a new fraud report associated with the user's email, age, and source channel.
    """
    report_dict = report.dict(by_alias=True)
    report_dict["report_id"] = f"CASE-{len(db_reports) + 101}"
    report_dict["badge_class"] = "chip-blue"
    db_reports.append(report_dict)
    return report_dict

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """
    Delete a report by its unique ID.
    """
    global db_reports
    initial_length = len(db_reports)
    db_reports = [
        r for r in db_reports 
        if r.get("report_id") != report_id and str(r.get("_id")) != report_id
    ]
    
    if len(db_reports) == initial_length:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Report not found"
        )
        
    return {"message": "Report deleted successfully"}