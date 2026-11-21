from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models import User, StudentProfile, CompanyProfile, AuditLog
from schemas import UserCreate, UserLogin, UserOut, Token
from auth import (
    hash_password, verify_password, create_access_token, get_current_user, log_audit
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_active=True
    )
    db.add(user)
    db.flush()

    if user_in.role == "student":
        student_count = db.query(StudentProfile).count()
        profile = StudentProfile(
            user_id=user.id,
            registration_number=f"PMIS-2026-{2000 + student_count + 1}",
            category="GEN",
            gender="Not Specified",
            state="Delhi",
            city="New Delhi",
            preferred_locations=["New Delhi", "Remote"],
            preferred_sectors=["Information Technology"],
            work_mode_preference="Any",
            degree="B.Tech / B.E.",
            field_of_study="Computer Science",
            cgpa_percentage=7.5,
            graduation_year=2026,
            skills=[{"name": "Python", "level": "Intermediate"}],
            experience_months=0,
            projects_count=1,
            allocation_status="UNALLOCATED"
        )
        db.add(profile)
    elif user_in.role == "company":
        comp_profile = CompanyProfile(
            user_id=user.id,
            company_name=user_in.full_name,
            industry_sector="Information Technology",
            hq_location="New Delhi",
            contact_email=user_in.email,
            is_verified=True
        )
        db.add(comp_profile)

    db.commit()
    db.refresh(user)

    log_audit(db, "USER_REGISTERED", user.email, user.role, {"full_name": user.full_name})

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    log_audit(db, "USER_LOGIN", user.email, user.role, {})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/token", response_model=Token)
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password."
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = None
    if current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        profile_data = {
            "id": sp.id,
            "registration_number": sp.registration_number,
            "category": sp.category,
            "gender": sp.gender,
            "city": sp.city,
            "state": sp.state,
            "degree": sp.degree,
            "field_of_study": sp.field_of_study,
            "cgpa_percentage": sp.cgpa_percentage,
            "graduation_year": sp.graduation_year,
            "skills": sp.skills,
            "preferred_sectors": sp.preferred_sectors,
            "preferred_locations": sp.preferred_locations,
            "work_mode_preference": sp.work_mode_preference,
            "experience_months": sp.experience_months,
            "projects_count": sp.projects_count,
            "bio": sp.bio,
            "resume_filename": sp.resume_filename,
            "allocation_status": sp.allocation_status,
            "allocated_internship_id": sp.allocated_internship_id,
            "allocated_score": sp.allocated_score,
            "allocated_at": sp.allocated_at
        }
    elif current_user.role == "company" and current_user.company_profile:
        cp = current_user.company_profile
        profile_data = {
            "id": cp.id,
            "company_name": cp.company_name,
            "industry_sector": cp.industry_sector,
            "description": cp.description,
            "website": cp.website,
            "contact_person": cp.contact_person,
            "contact_email": cp.contact_email,
            "hq_location": cp.hq_location,
            "is_verified": cp.is_verified
        }

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone,
        "profile": profile_data
    }


@router.get("/demo-credentials")
def get_demo_credentials():
    return {
        "admin": {
            "email": "admin@manthan.gov.in",
            "password": "Admin@123",
            "role": "admin",
            "name": "Dr. Rajeshwar Rao (National Allocation Director)"
        },
        "student": {
            "email": "arjun.sharma@example.com",
            "password": "Student@123",
            "role": "student",
            "name": "Arjun Sharma (B.Tech CS, CGPA: 8.85)"
        },
        "company": {
            "email": "hr@tcs.example.com",
            "password": "Company@123",
            "role": "company",
            "name": "Tata Consultancy Services (Kavita Nair)"
        }
    }
