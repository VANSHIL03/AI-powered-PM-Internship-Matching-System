from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User, CompanyProfile, Internship, StudentProfile, Application, SystemSetting, AllocationAssignment
)
from schemas import (
    CompanyProfileOut, CompanyProfileUpdate, InternshipCreate, InternshipUpdate, InternshipOut
)
from auth import get_current_user, require_role, log_audit
from matching_engine import calculate_compatibility, DEFAULT_WEIGHTS

router = APIRouter(prefix="/api/companies", tags=["Companies"])

@router.get("/profile", response_model=CompanyProfileOut)
def get_company_profile(
    current_user: User = Depends(require_role(["company", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    total_internships = db.query(Internship).filter(Internship.company_id == profile.id).count()

    return CompanyProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        company_name=profile.company_name,
        industry_sector=profile.industry_sector,
        description=profile.description,
        website=profile.website,
        contact_person=profile.contact_person,
        contact_email=profile.contact_email,
        hq_location=profile.hq_location,
        is_verified=profile.is_verified,
        email=current_user.email,
        total_internships=total_internships
    )


@router.put("/profile")
def update_company_profile(
    updates: CompanyProfileUpdate,
    current_user: User = Depends(require_role("company")),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    for field, val in updates.model_dump(exclude_unset=True).items():
        if hasattr(profile, field):
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    log_audit(db, "COMPANY_PROFILE_UPDATED", current_user.email, "company", {"company_id": profile.id})
    return {"message": "Company profile updated successfully"}


@router.get("/internships", response_model=List[InternshipOut])
def get_company_internships(
    current_user: User = Depends(require_role(["company", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    internships = db.query(Internship).filter(Internship.company_id == profile.id).all()
    results = []
    for i in internships:
        results.append(InternshipOut(
            id=i.id,
            company_id=i.company_id,
            company_name=profile.company_name,
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


@router.post("/internships", response_model=InternshipOut)
def create_internship(
    payload: InternshipCreate,
    current_user: User = Depends(require_role("company")),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    internship = Internship(
        company_id=profile.id,
        title=payload.title,
        sector=payload.sector,
        description=payload.description,
        location=payload.location,
        is_remote=payload.is_remote,
        duration_months=payload.duration_months,
        stipend_amount=payload.stipend_amount,
        seats_total=payload.seats_total,
        seats_allocated=0,
        min_cgpa=payload.min_cgpa,
        required_degree=payload.required_degree,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        category_reservations=payload.category_reservations,
        status="OPEN"
    )
    db.add(internship)
    db.commit()
    db.refresh(internship)

    log_audit(db, "INTERNSHIP_CREATED", current_user.email, "company", {
        "internship_id": internship.id,
        "title": internship.title,
        "seats": internship.seats_total
    })

    return InternshipOut(
        id=internship.id,
        company_id=internship.company_id,
        company_name=profile.company_name,
        title=internship.title,
        sector=internship.sector,
        description=internship.description,
        location=internship.location,
        is_remote=internship.is_remote,
        duration_months=internship.duration_months,
        stipend_amount=internship.stipend_amount,
        seats_total=internship.seats_total,
        seats_allocated=internship.seats_allocated,
        min_cgpa=internship.min_cgpa,
        required_degree=internship.required_degree,
        required_skills=internship.required_skills,
        preferred_skills=internship.preferred_skills,
        category_reservations=internship.category_reservations,
        status=internship.status,
        created_at=internship.created_at
    )


@router.put("/internships/{internship_id}", response_model=InternshipOut)
def update_internship(
    internship_id: int,
    payload: InternshipUpdate,
    current_user: User = Depends(require_role(["company", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    query = db.query(Internship).filter(Internship.id == internship_id)
    if current_user.role == "company":
        query = query.filter(Internship.company_id == profile.id)
    internship = query.first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found or unauthorized.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if hasattr(internship, field) and val is not None:
            setattr(internship, field, val)

    db.commit()
    db.refresh(internship)
    log_audit(db, "INTERNSHIP_UPDATED", current_user.email, current_user.role, {"internship_id": internship.id})

    return InternshipOut(
        id=internship.id,
        company_id=internship.company_id,
        company_name=internship.company.company_name if internship.company else "",
        title=internship.title,
        sector=internship.sector,
        description=internship.description,
        location=internship.location,
        is_remote=internship.is_remote,
        duration_months=internship.duration_months,
        stipend_amount=internship.stipend_amount,
        seats_total=internship.seats_total,
        seats_allocated=internship.seats_allocated,
        min_cgpa=internship.min_cgpa,
        required_degree=internship.required_degree,
        required_skills=internship.required_skills,
        preferred_skills=internship.preferred_skills,
        category_reservations=internship.category_reservations,
        status=internship.status,
        created_at=internship.created_at
    )


@router.get("/candidates/{internship_id}")
def get_matched_candidates_for_internship(
    internship_id: int,
    current_user: User = Depends(require_role(["company", "admin"])),
    db: Session = Depends(get_db)
):
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found.")

    if current_user.role == "company" and internship.company_id != current_user.company_profile.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view candidates for this internship.")

    weights_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    weights = weights_setting.value_json if weights_setting else DEFAULT_WEIGHTS

    students = db.query(StudentProfile).all()
    candidates = []

    for s in students:
        comp = calculate_compatibility(s, internship, weights)
        candidates.append({
            "student_id": s.id,
            "registration_number": s.registration_number,
            "full_name": s.user.full_name if s.user else f"Candidate #{s.id}",
            "email": s.user.email if s.user else "",
            "phone": s.user.phone if s.user else "",
            "category": s.category,
            "gender": s.gender,
            "city": s.city,
            "state": s.state,
            "degree": s.degree,
            "field_of_study": s.field_of_study,
            "cgpa_percentage": s.cgpa_percentage,
            "graduation_year": s.graduation_year,
            "skills": s.skills,
            "projects_count": s.projects_count,
            "experience_months": s.experience_months,
            "resume_filename": s.resume_filename,
            "allocation_status": s.allocation_status,
            "is_allocated_here": s.allocated_internship_id == internship.id,
            "compatibility": comp
        })

    # Sort candidates by compatibility score descending
    candidates.sort(key=lambda x: (x["compatibility"]["eligible"], x["compatibility"]["total_score"]), reverse=True)

    return {
        "internship_id": internship.id,
        "internship_title": internship.title,
        "seats_total": internship.seats_total,
        "seats_allocated": internship.seats_allocated,
        "total_evaluated": len(candidates),
        "candidates": candidates
    }


@router.get("/allocated-interns")
def get_allocated_interns(
    current_user: User = Depends(require_role(["company", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.company_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    internship_ids = [i.id for i in db.query(Internship).filter(Internship.company_id == profile.id).all()]
    students = db.query(StudentProfile).filter(StudentProfile.allocated_internship_id.in_(internship_ids)).all()

    out = []
    for s in students:
        i = s.allocated_internship
        out.append({
            "student_id": s.id,
            "registration_number": s.registration_number,
            "full_name": s.user.full_name if s.user else "",
            "email": s.user.email if s.user else "",
            "phone": s.user.phone if s.user else "",
            "category": s.category,
            "degree": s.degree,
            "field_of_study": s.field_of_study,
            "cgpa": s.cgpa_percentage,
            "internship_id": i.id,
            "internship_title": i.title,
            "score": s.allocated_score,
            "allocated_at": s.allocated_at,
            "resume_filename": s.resume_filename
        })
    return out
