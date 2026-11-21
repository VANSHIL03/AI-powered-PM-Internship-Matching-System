from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    StudentProfile, CompanyProfile, Internship, AllocationRun, AllocationAssignment
)
from schemas import AnalyticsOverview

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_students = db.query(StudentProfile).count()
    total_companies = db.query(CompanyProfile).count()
    total_internships = db.query(Internship).count()

    # Vacancy counts
    total_vacancies = db.query(func.sum(Internship.seats_total)).scalar() or 0

    # Published run or latest run
    published_run = db.query(AllocationRun).filter(AllocationRun.is_published == True).first()
    latest_run = published_run or db.query(AllocationRun).order_by(AllocationRun.id.desc()).first()

    total_allocated = len(latest_run.assignments) if latest_run else 0
    average_score = latest_run.average_score if latest_run else 0.0
    is_published = latest_run.is_published if latest_run else False

    remaining_vacant_seats = max(0, total_vacancies - total_allocated)
    unallocated_students = max(0, total_students - total_allocated)
    allocation_rate = round((total_allocated / max(1, total_vacancies)) * 100, 1)

    # 1. Sector-wise internship & vacancy distribution
    sector_counts = (
        db.query(Internship.sector, func.count(Internship.id), func.sum(Internship.seats_total))
        .group_by(Internship.sector)
        .all()
    )
    sector_distribution = []
    for s_name, i_cnt, seats in sector_counts:
        # Count allocated in this sector
        allocated_in_sector = 0
        if latest_run:
            allocated_in_sector = sum(
                1 for a in latest_run.assignments if a.internship and a.internship.sector == s_name
            )

        sector_distribution.append({
            "sector": s_name,
            "internships": i_cnt,
            "total_seats": seats or 0,
            "allocated_seats": allocated_in_sector,
            "vacant_seats": max(0, (seats or 0) - allocated_in_sector)
        })

    # 2. Location-wise allocation distribution
    loc_counts = (
        db.query(Internship.location, func.sum(Internship.seats_total))
        .group_by(Internship.location)
        .all()
    )
    location_distribution = []
    for loc, seats in loc_counts:
        alloc_loc = 0
        if latest_run:
            alloc_loc = sum(
                1 for a in latest_run.assignments if a.internship and a.internship.location == loc
            )
        location_distribution.append({
            "location": loc,
            "total_seats": seats or 0,
            "allocated": alloc_loc
        })

    # 3. Category-wise statistics & reservation fulfillment
    categories = ["GEN", "OBC_NCL", "SC", "ST", "EWS", "PWD"]
    cat_stats = []
    for cat in categories:
        total_registered_in_cat = db.query(StudentProfile).filter(StudentProfile.category == cat).count()
        allocated_in_cat = 0
        if latest_run:
            allocated_in_cat = sum(
                1 for a in latest_run.assignments if a.student and a.student.category == cat
            )
        
        # Quota seats targeted
        targeted_quota_seats = 0
        for i in db.query(Internship).all():
            if i.category_reservations:
                targeted_quota_seats += i.category_reservations.get(cat, 0)

        cat_stats.append({
            "category": cat,
            "registered_students": total_registered_in_cat,
            "allocated_students": allocated_in_cat,
            "targeted_quota_seats": targeted_quota_seats,
            "fulfillment_rate": round((allocated_in_cat / max(1, targeted_quota_seats)) * 100, 1) if targeted_quota_seats > 0 else 100.0
        })

    # 4. Score distribution buckets
    score_buckets = [
        {"range": "90 - 100%", "count": 0, "label": "Exceptional"},
        {"range": "80 - 89%", "count": 0, "label": "Strong Match"},
        {"range": "70 - 79%", "count": 0, "label": "Good Match"},
        {"range": "60 - 69%", "count": 0, "label": "Moderate Match"},
        {"range": "< 60%", "count": 0, "label": "Marginal"}
    ]
    if latest_run:
        for a in latest_run.assignments:
            score = a.score
            if score >= 90:
                score_buckets[0]["count"] += 1
            elif score >= 80:
                score_buckets[1]["count"] += 1
            elif score >= 70:
                score_buckets[2]["count"] += 1
            elif score >= 60:
                score_buckets[3]["count"] += 1
            else:
                score_buckets[4]["count"] += 1

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_internships": total_internships,
        "total_vacancies": total_vacancies,
        "total_allocated": total_allocated,
        "remaining_vacant_seats": remaining_vacant_seats,
        "unallocated_students": unallocated_students,
        "average_compatibility_score": average_score,
        "allocation_rate_percentage": allocation_rate,
        "is_published": is_published,
        "latest_run_id": latest_run.id if latest_run else None,
        "sector_distribution": sector_distribution,
        "location_distribution": location_distribution,
        "category_allocation_stats": cat_stats,
        "score_distribution": score_buckets
    }
