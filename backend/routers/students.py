import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User, StudentProfile, Internship, Application, SystemSetting
)
from schemas import (
    StudentProfileOut, StudentProfileUpdate, CompatibilityResult
)
from auth import get_current_user, require_role, log_audit
from matching_engine import calculate_compatibility, DEFAULT_WEIGHTS
from portfolio_analyzer import extract_text_from_bytes, parse_portfolio_text, analyze_and_rank_internships

router = APIRouter(prefix="/api/students", tags=["Students"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/profile", response_model=StudentProfileOut)
def get_student_profile(
    current_user: User = Depends(require_role(["student", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    allocated_info = None
    if profile.allocated_internship:
        i = profile.allocated_internship
        allocated_info = {
            "id": i.id,
            "title": i.title,
            "company_name": i.company.company_name if i.company else "Partner Company",
            "sector": i.sector,
            "location": i.location,
            "is_remote": i.is_remote,
            "stipend_amount": i.stipend_amount,
            "duration_months": i.duration_months,
            "score": profile.allocated_score
        }

    out = StudentProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        registration_number=profile.registration_number,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        category=profile.category,
        gender=profile.gender,
        dob=profile.dob,
        state=profile.state,
        city=profile.city,
        preferred_locations=profile.preferred_locations or [],
        preferred_sectors=profile.preferred_sectors or [],
        work_mode_preference=profile.work_mode_preference,
        degree=profile.degree,
        field_of_study=profile.field_of_study,
        cgpa_percentage=profile.cgpa_percentage,
        graduation_year=profile.graduation_year,
        skills=profile.skills or [],
        experience_months=profile.experience_months,
        projects_count=profile.projects_count,
        bio=profile.bio,
        resume_filename=profile.resume_filename,
        allocation_status=profile.allocation_status,
        allocated_internship_id=profile.allocated_internship_id,
        allocated_score=profile.allocated_score,
        allocated_at=profile.allocated_at,
        allocated_internship=allocated_info
    )
    return out


@router.put("/profile")
def update_student_profile(
    updates: StudentProfileUpdate,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.phone is not None:
        current_user.phone = updates.phone

    for field, val in updates.model_dump(exclude_unset=True).items():
        if field in ["full_name", "phone"]:
            continue
        if hasattr(profile, field):
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    log_audit(db, "STUDENT_PROFILE_UPDATED", current_user.email, "student", {"profile_id": profile.id})
    return {"message": "Profile updated successfully"}


@router.post("/resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    allowed_exts = [".pdf", ".docx", ".doc"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are permitted for resumes.")

    safe_filename = f"Resume_Student_{profile.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile.resume_filename = file.filename
    profile.resume_path = file_path

    # Read bytes for intelligent portfolio analysis
    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        extracted_text = extract_text_from_bytes(file_bytes, file.filename)
        parsed_data = parse_portfolio_text(extracted_text)

        # Sync profile with extracted credentials
        if parsed_data.get("skills"):
            profile.skills = parsed_data["skills"]
        if parsed_data.get("cgpa_percentage") and parsed_data["cgpa_percentage"] > 4.0:
            profile.cgpa_percentage = parsed_data["cgpa_percentage"]
        if parsed_data.get("degree"):
            profile.degree = parsed_data["degree"]
        if parsed_data.get("field_of_study"):
            profile.field_of_study = parsed_data["field_of_study"]
        if parsed_data.get("experience_months"):
            profile.experience_months = parsed_data["experience_months"]
        if parsed_data.get("projects_count"):
            profile.projects_count = parsed_data["projects_count"]
    except Exception as e:
        print(f"Error during portfolio auto-extraction: {e}")
        parsed_data = None

    db.commit()

    # Get matching internships
    internships = db.query(Internship).all()
    weights_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    weights = weights_setting.value_json if weights_setting else DEFAULT_WEIGHTS
    matches = analyze_and_rank_internships(parsed_data or profile.__dict__, internships, weights)

    log_audit(db, "RESUME_UPLOADED", current_user.email, "student", {"filename": file.filename})
    return {
        "message": f"Portfolio '{file.filename}' uploaded and analyzed successfully! Extracted {len(parsed_data.get('skills', [])) if parsed_data else 0} skills.",
        "filename": file.filename,
        "extracted_profile": parsed_data,
        "matches": matches[:15]
    }


@router.post("/analyze-portfolio")
def analyze_portfolio_endpoint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    current_user: User = Depends(require_role(["student", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    text_to_parse = ""
    if file:
        file_bytes = file.file.read()
        text_to_parse = extract_text_from_bytes(file_bytes, file.filename)
    elif raw_text:
        text_to_parse = raw_text
    elif profile.resume_path and os.path.exists(profile.resume_path):
        with open(profile.resume_path, "rb") as f:
            text_to_parse = extract_text_from_bytes(f.read(), profile.resume_filename or "resume.pdf")

    if not text_to_parse:
        # Fallback to existing profile attributes
        parsed = {
            "candidate_name": current_user.full_name,
            "registration_number": profile.registration_number or "PMIS-2026-ONLINE",
            "email": current_user.email,
            "phone": current_user.phone or "",
            "degree": profile.degree,
            "field_of_study": profile.field_of_study,
            "cgpa_percentage": profile.cgpa_percentage,
            "skills": profile.skills,
            "experience_months": profile.experience_months,
            "projects_count": profile.projects_count,
            "preferred_locations": profile.preferred_locations,
            "preferred_sectors": profile.preferred_sectors,
            "category": profile.category
        }
    else:
        parsed = parse_portfolio_text(text_to_parse)
        # Update current student profile in database
        if parsed.get("skills"):
            profile.skills = parsed["skills"]
        if parsed.get("cgpa_percentage") and parsed["cgpa_percentage"] > 4.0:
            profile.cgpa_percentage = parsed["cgpa_percentage"]
        if parsed.get("degree"):
            profile.degree = parsed["degree"]
        if parsed.get("field_of_study"):
            profile.field_of_study = parsed["field_of_study"]
        if parsed.get("experience_months"):
            profile.experience_months = parsed["experience_months"]
        if parsed.get("projects_count"):
            profile.projects_count = parsed["projects_count"]
        db.commit()

    internships = db.query(Internship).all()
    weights_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    weights = weights_setting.value_json if weights_setting else DEFAULT_WEIGHTS

    matches = analyze_and_rank_internships(parsed, internships, weights)

    return {
        "status": "success",
        "extracted_profile": parsed,
        "total_evaluated": len(internships),
        "matches": matches[:15]
    }


@router.get("/matches", response_model=List[CompatibilityResult])
def get_student_matches(
    current_user: User = Depends(require_role(["student", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # Retrieve current matching weights
    weights_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    weights = weights_setting.value_json if weights_setting else DEFAULT_WEIGHTS

    internships = db.query(Internship).all()
    results = []

    for i in internships:
        comp = calculate_compatibility(profile, i, weights)
        results.append(comp)

    # Sort descending by compatibility score
    results.sort(key=lambda x: (x["eligible"], x["total_score"]), reverse=True)
    return results


@router.post("/apply/{internship_id}")
def apply_internship(
    internship_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship opportunity not found.")

    existing_app = db.query(Application).filter(
        Application.student_id == profile.id,
        Application.internship_id == internship_id
    ).first()

    if existing_app:
        return {"message": "Application already submitted for this internship.", "application_id": existing_app.id}

    weights_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    weights = weights_setting.value_json if weights_setting else DEFAULT_WEIGHTS
    comp = calculate_compatibility(profile, internship, weights)

    app = Application(
        student_id=profile.id,
        internship_id=internship_id,
        status="APPLIED",
        match_score=comp["total_score"],
        score_breakdown=comp["breakdown"]
    )
    db.add(app)
    db.commit()

    log_audit(db, "APPLICATION_SUBMITTED", current_user.email, "student", {
        "internship_id": internship_id,
        "score": comp["total_score"]
    })
    return {"message": "Application submitted successfully", "application_id": app.id, "match_score": comp["total_score"]}


@router.get("/applications")
def get_student_applications(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    apps = db.query(Application).filter(Application.student_id == profile.id).all()
    out = []
    for a in apps:
        out.append({
            "id": a.id,
            "internship_id": a.internship.id,
            "title": a.internship.title,
            "company_name": a.internship.company.company_name if a.internship.company else "Partner Company",
            "sector": a.internship.sector,
            "location": a.internship.location,
            "is_remote": a.internship.is_remote,
            "stipend_amount": a.internship.stipend_amount,
            "status": a.status,
            "match_score": a.match_score,
            "score_breakdown": a.score_breakdown,
            "applied_at": a.applied_at
        })
    return out
