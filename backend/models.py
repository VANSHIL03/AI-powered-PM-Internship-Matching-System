import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'student', 'company', 'admin'
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    company_profile = relationship("CompanyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    registration_number = Column(String(50), unique=True, index=True)
    
    # Demographics & Category (Illustrative reservation categories)
    category = Column(String(20), default="GEN")  # GEN, OBC_NCL, SC, ST, EWS, PWD
    gender = Column(String(20), default="Male")
    dob = Column(String(30), nullable=True)
    state = Column(String(100), default="Delhi")
    city = Column(String(100), default="New Delhi")
    
    # Preferences
    preferred_locations = Column(JSON, default=list)  # ["Delhi", "Bengaluru", "Remote"]
    preferred_sectors = Column(JSON, default=list)    # ["IT/Software", "Green Energy"]
    work_mode_preference = Column(String(20), default="Any")  # Any, Onsite, Remote, Hybrid
    
    # Education & Eligibility
    degree = Column(String(100), default="B.Tech / B.E.")
    field_of_study = Column(String(100), default="Computer Science")
    cgpa_percentage = Column(Float, default=8.0)
    graduation_year = Column(Integer, default=2026)
    
    # Skills & Experience
    skills = Column(JSON, default=list)  # [{"name": "Python", "level": "Advanced"}, ...]
    experience_months = Column(Integer, default=0)
    projects_count = Column(Integer, default=2)
    bio = Column(Text, nullable=True)
    
    # Resume
    resume_filename = Column(String(255), nullable=True)
    resume_path = Column(String(500), nullable=True)
    
    # Allocation Status
    allocation_status = Column(String(50), default="UNALLOCATED")  # UNALLOCATED, ALLOCATED
    allocated_internship_id = Column(Integer, ForeignKey("internships.id", ondelete="SET NULL"), nullable=True)
    allocated_score = Column(Float, nullable=True)
    allocated_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    allocated_internship = relationship("Internship", foreign_keys=[allocated_internship_id])
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    assignments = relationship("AllocationAssignment", back_populates="student")


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    industry_sector = Column(String(100), default="Information Technology")
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    hq_location = Column(String(100), default="Bengaluru")
    is_verified = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="company_profile")
    internships = relationship("Internship", back_populates="company", cascade="all, delete-orphan")


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(100), nullable=False)
    is_remote = Column(Boolean, default=False)
    duration_months = Column(Integer, default=6)
    stipend_amount = Column(Integer, default=15000)  # INR per month
    
    # Capacity & Requirements
    seats_total = Column(Integer, default=2)
    seats_allocated = Column(Integer, default=0)
    min_cgpa = Column(Float, default=6.5)
    required_degree = Column(JSON, default=list)   # ["B.Tech / B.E.", "MCA", "BCA"]
    
    # Skills
    required_skills = Column(JSON, default=list)    # ["Python", "FastAPI", "SQL"]
    preferred_skills = Column(JSON, default=list)   # ["Docker", "React"]
    
    # Illustrative Reservation Quotas for Demo (seats reserved per category)
    # e.g., {"GEN": 1, "OBC_NCL": 1, "SC": 0, "ST": 0, "EWS": 0, "PWD": 0}
    category_reservations = Column(JSON, default=dict)
    
    status = Column(String(50), default="OPEN")  # OPEN, ALLOCATED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    company = relationship("CompanyProfile", back_populates="internships")
    applications = relationship("Application", back_populates="internship", cascade="all, delete-orphan")
    assignments = relationship("AllocationAssignment", back_populates="internship")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=False)
    status = Column(String(50), default="APPLIED")  # APPLIED, MATCHED, ALLOCATED, REJECTED
    match_score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, default=dict)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")


class AllocationRun(Base):
    __tablename__ = "allocation_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_number = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    total_students = Column(Integer, default=0)
    total_vacancies = Column(Integer, default=0)
    total_allocated = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    solver_status = Column(String(50), default="OPTIMAL")  # OPTIMAL, FEASIBLE, INFEASIBLE
    solver_execution_time_ms = Column(Float, default=0.0)
    weights_used = Column(JSON, default=dict)
    reservation_rules_used = Column(JSON, default=dict)
    conflict_diagnostics = Column(JSON, default=list)
    is_published = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    assignments = relationship("AllocationAssignment", back_populates="run", cascade="all, delete-orphan")


class AllocationAssignment(Base):
    __tablename__ = "allocation_assignments"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("allocation_runs.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=False)
    score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, default=dict)
    category_quota_assigned = Column(String(50), default="GEN")
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

    run = relationship("AllocationRun", back_populates="assignments")
    student = relationship("StudentProfile", back_populates="assignments")
    internship = relationship("Internship", back_populates="assignments")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value_json = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    performed_by_email = Column(String(255), nullable=False)
    performed_by_role = Column(String(50), nullable=False)
    details_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
