from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # student, company, admin
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- Student Profile Schemas ---
class SkillItem(BaseModel):
    name: str
    level: str = "Intermediate"  # Beginner, Intermediate, Advanced, Expert

class StudentProfileBase(BaseModel):
    category: str = "GEN"
    gender: str = "Male"
    dob: Optional[str] = None
    state: str = "Delhi"
    city: str = "New Delhi"
    preferred_locations: List[str] = []
    preferred_sectors: List[str] = []
    work_mode_preference: str = "Any"
    degree: str = "B.Tech / B.E."
    field_of_study: str = "Computer Science"
    cgpa_percentage: float = 8.0
    graduation_year: int = 2026
    skills: List[SkillItem] = []
    experience_months: int = 0
    projects_count: int = 2
    bio: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    preferred_sectors: Optional[List[str]] = None
    work_mode_preference: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    cgpa_percentage: Optional[float] = None
    graduation_year: Optional[int] = None
    skills: Optional[List[SkillItem]] = None
    experience_months: Optional[int] = None
    projects_count: Optional[int] = None
    bio: Optional[str] = None

class StudentProfileOut(StudentProfileBase):
    id: int
    user_id: int
    registration_number: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    resume_filename: Optional[str] = None
    allocation_status: str
    allocated_internship_id: Optional[int] = None
    allocated_score: Optional[float] = None
    allocated_at: Optional[datetime.datetime] = None
    allocated_internship: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# --- Company Profile Schemas ---
class CompanyProfileBase(BaseModel):
    company_name: str
    industry_sector: str = "Information Technology"
    description: Optional[str] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    hq_location: str = "Bengaluru"

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    hq_location: Optional[str] = None

class CompanyProfileOut(CompanyProfileBase):
    id: int
    user_id: int
    is_verified: bool
    email: Optional[str] = None
    total_internships: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Internship Schemas ---
class InternshipBase(BaseModel):
    title: str
    sector: str
    description: Optional[str] = None
    location: str
    is_remote: bool = False
    duration_months: int = 6
    stipend_amount: int = 15000
    seats_total: int = 2
    min_cgpa: float = 6.5
    required_degree: List[str] = ["B.Tech / B.E."]
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    category_reservations: Dict[str, int] = {}
    apply_url: Optional[str] = "https://pminternship.mca.gov.in/"
    official_portal_url: Optional[str] = "https://pminternship.mca.gov.in/"

class InternshipCreate(InternshipBase):
    pass

class InternshipUpdate(BaseModel):
    title: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = None
    duration_months: Optional[int] = None
    stipend_amount: Optional[int] = None
    seats_total: Optional[int] = None
    min_cgpa: Optional[float] = None
    required_degree: Optional[List[str]] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    category_reservations: Optional[Dict[str, int]] = None
    status: Optional[str] = None

class InternshipOut(InternshipBase):
    id: int
    company_id: int
    company_name: Optional[str] = None
    seats_allocated: int
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Matching & Allocation Engine Schemas ---
class MatchingWeights(BaseModel):
    skills: float = 40.0
    preferences: float = 20.0
    location: float = 15.0
    education: float = 10.0
    experience: float = 10.0
    other: float = 5.0

class ReservationRuleConfig(BaseModel):
    enforce_quotas: bool = True
    allow_unfilled_spillover: bool = True  # If true, unfilled reserved seats can open to general pool after penalty
    disclaimer: str = "Illustrative sample reservation quotas for demonstration purposes only. Not official government policy."

class MatchScoreBreakdown(BaseModel):
    skills: float
    preferences: float
    location: float
    education: float
    experience: float
    other: float

class CompatibilityResult(BaseModel):
    internship_id: int
    internship_title: str
    company_name: str
    sector: str
    location: str
    is_remote: bool
    stipend_amount: int
    total_score: float
    eligible: bool
    ineligibility_reasons: List[str] = []
    breakdown: MatchScoreBreakdown
    skills_matched: List[str] = []
    skills_missing: List[str] = []
    apply_url: Optional[str] = "https://pminternship.mca.gov.in/"
    official_portal_url: Optional[str] = "https://pminternship.mca.gov.in/"
    match_reason: Optional[str] = None

class AllocationRunRequest(BaseModel):
    weights: Optional[MatchingWeights] = None
    enforce_quotas: bool = True
    allow_relaxation: bool = True

class AllocationAssignmentOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    student_category: str
    student_cgpa: float
    internship_id: int
    internship_title: str
    company_name: str
    sector: str
    location: str
    score: float
    score_breakdown: Dict[str, Any]
    category_quota_assigned: str
    assigned_at: datetime.datetime

class AllocationRunOut(BaseModel):
    id: int
    run_number: int
    timestamp: datetime.datetime
    total_students: int
    total_vacancies: int
    total_allocated: int
    average_score: float
    solver_status: str
    solver_execution_time_ms: float
    weights_used: Dict[str, Any]
    reservation_rules_used: Dict[str, Any]
    conflict_diagnostics: List[Dict[str, Any]]
    is_published: bool
    assignments_count: int

# --- Analytics Schemas ---
class AnalyticsOverview(BaseModel):
    total_students: int
    total_companies: int
    total_internships: int
    total_vacancies: int
    total_allocated: int
    remaining_vacant_seats: int
    unallocated_students: int
    average_compatibility_score: float
    allocation_rate_percentage: float
    is_published: bool
    sector_distribution: List[Dict[str, Any]]
    location_distribution: List[Dict[str, Any]]
    category_allocation_stats: List[Dict[str, Any]]
    score_distribution: List[Dict[str, Any]]
