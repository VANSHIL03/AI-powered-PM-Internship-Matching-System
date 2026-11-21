from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Internship, CompanyProfile
from schemas import InternshipOut

router = APIRouter(prefix="/api/internships", tags=["Internships"])

@router.get("", response_model=List[InternshipOut])
def list_internships(
    sector: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    is_remote: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    min_stipend: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Internship).join(CompanyProfile)

    if sector and sector != "All":
        query = query.filter(Internship.sector == sector)
    if location and location != "All":
        query = query.filter(Internship.location == location)
    if is_remote is not None:
        query = query.filter(Internship.is_remote == is_remote)
    if min_stipend is not None:
        query = query.filter(Internship.stipend_amount >= min_stipend)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Internship.title.ilike(search_filter),
                Internship.description.ilike(search_filter),
                CompanyProfile.company_name.ilike(search_filter),
                Internship.sector.ilike(search_filter)
            )
        )

    internships = query.all()
    results = []
    for i in internships:
        results.append(InternshipOut(
            id=i.id,
            company_id=i.company_id,
            company_name=i.company.company_name if i.company else "Partner Company",
            title=i.title,
            sector=i.sector,
            description=i.description,
            location=i.location,
            is_remote=i.is_remote,
            duration_months=i.duration_months,
            stipend_amount=i.stipend_amount,
            seats_total=i.seats_total,
            seats_allocated=i.seats_allocated,
            min_cgpa=i.min_cgpa,
            required_degree=i.required_degree or [],
            required_skills=i.required_skills or [],
            preferred_skills=i.preferred_skills or [],
            category_reservations=i.category_reservations or {},
            status=i.status,
            created_at=i.created_at
        ))
    return results


@router.get("/sectors")
def get_sectors(db: Session = Depends(get_db)):
    sectors = db.query(Internship.sector).distinct().all()
    return [s[0] for s in sectors if s[0]]


@router.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    locations = db.query(Internship.location).distinct().all()
    return [loc[0] for loc in locations if loc[0]]


@router.get("/{internship_id}")
def get_internship_detail(internship_id: int, db: Session = Depends(get_db)):
    i = db.query(Internship).filter(Internship.id == internship_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Internship not found.")

    return {
        "id": i.id,
        "title": i.title,
        "sector": i.sector,
        "description": i.description,
        "location": i.location,
        "is_remote": i.is_remote,
        "duration_months": i.duration_months,
        "stipend_amount": i.stipend_amount,
        "seats_total": i.seats_total,
        "seats_allocated": i.seats_allocated,
        "min_cgpa": i.min_cgpa,
        "required_degree": i.required_degree,
        "required_skills": i.required_skills,
        "preferred_skills": i.preferred_skills,
        "category_reservations": i.category_reservations,
        "status": i.status,
        "created_at": i.created_at,
        "company": {
            "id": i.company.id,
            "company_name": i.company.company_name,
            "industry_sector": i.company.industry_sector,
            "description": i.company.description,
            "website": i.company.website,
            "hq_location": i.company.hq_location
        }
    }
