import re
import io
from typing import Dict, Any, List, Optional
import pypdf
from matching_engine import calculate_compatibility, DEFAULT_WEIGHTS

CANONICAL_SKILLS_MAP = {
    "python": "Python",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "fastapi": "FastAPI",
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "sqlite": "SQLite",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "cloud": "AWS",
    "git": "Git",
    "github": "Git",
    "node": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "c++": "C++",
    "cpp": "C++",
    "java": "Java",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pytorch": "PyTorch",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "natural language processing": "Natural Language Processing",
    "nlp": "Natural Language Processing",
    "data science": "Data Science",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "or-tools": "Google OR-Tools",
    "google or-tools": "Google OR-Tools",
    "linear programming": "Google OR-Tools",
    "optimization": "Google OR-Tools",
    "redis": "Redis",
    "linux": "Linux",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "html": "HTML5",
    "css": "CSS",
    "microservices": "Microservices",
    "rest api": "RESTful API Architecture",
    "restful": "RESTful API Architecture",
    "cybersecurity": "Cybersecurity",
    "iot": "IoT",
    "autocad": "AutoCAD",
    "tableau": "Tableau",
    "powerbi": "PowerBI",
    "matlab": "MATLAB"
}

def extract_text_from_bytes(file_bytes: bytes, filename: str = "") -> str:
    """Extract raw text from PDF or plain text buffer."""
    if filename.lower().endswith(".pdf") or file_bytes.startswith(b"%PDF"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            texts = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    texts.append(t)
            return "\n".join(texts)
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def parse_portfolio_text(text: str) -> Dict[str, Any]:
    """Parse candidate attributes, skills, education, and credentials from portfolio text."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # 1. Candidate Name
    candidate_name = "Candidate"
    for line in lines[:5]:
        clean = line.strip()
        # Look for full capital name or name line
        if len(clean) > 2 and len(clean) < 40 and not any(k in clean.lower() for k in ["curriculum", "resume", "portfolio", "page", "phone", "email"]):
            candidate_name = clean.title()
            break

    # 2. Registration Number (PMIS Scheme)
    reg_match = re.search(r'PMIS[-_\s]?\d{4}[-_\s]?\d{3,6}', text, re.IGNORECASE)
    registration_number = reg_match.group(0).upper().replace(" ", "-") if reg_match else "PMIS-2026-ONLINE"

    # 3. Email
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0) if email_match else "candidate@example.edu"

    # 4. Phone
    phone_match = re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}', text)
    phone = phone_match.group(0) if phone_match else "+91-98765-43210"

    # 5. Degree & Field
    degree = "B.Tech / B.E."
    field_of_study = "Computer Science"
    if re.search(r'm\.?tech|master\s+of\s+technology', text, re.IGNORECASE):
        degree = "M.Tech"
    elif re.search(r'mca|master\s+of\s+computer', text, re.IGNORECASE):
        degree = "MCA"
    elif re.search(r'bca|bachelor\s+of\s+computer', text, re.IGNORECASE):
        degree = "BCA"
    elif re.search(r'b\.?tech|b\.?e\b|bachelor\s+of\s+technology|engineering', text, re.IGNORECASE):
        degree = "B.Tech / B.E."

    if re.search(r'data\s+science', text, re.IGNORECASE):
        field_of_study = "Data Science"
    elif re.search(r'artificial\s+intelligence|ai', text, re.IGNORECASE):
        field_of_study = "Artificial Intelligence"
    elif re.search(r'electronics|electrical', text, re.IGNORECASE):
        field_of_study = "Electronics & Communication"
    elif re.search(r'mechanical', text, re.IGNORECASE):
        field_of_study = "Mechanical Engineering"

    # 6. CGPA / Percentage
    cgpa = 8.0
    cgpa_match = re.search(r'(?:CGPA|CPI|Grade)[:\s]*([0-9.]+)|([0-9.]+)\s*/\s*10', text, re.IGNORECASE)
    if cgpa_match:
        val = cgpa_match.group(1) or cgpa_match.group(2)
        try:
            val_f = float(val)
            if 4.0 <= val_f <= 10.0:
                cgpa = val_f
        except ValueError:
            pass
    else:
        # Check percentage
        pct_match = re.search(r'([0-9]{2}(?:\.[0-9]+)?)\s*%', text)
        if pct_match:
            try:
                pct = float(pct_match.group(1))
                if 50.0 <= pct <= 100.0:
                    cgpa = round(pct / 10.0, 2)
            except ValueError:
                pass

    # 7. Skills extraction
    text_lower = text.lower()
    found_skills_map = {}
    for needle, canonical in CANONICAL_SKILLS_MAP.items():
        pattern = r'\b' + re.escape(needle) + r'\b'
        if re.search(pattern, text_lower):
            level = "Advanced" if ("advanced" in text_lower and needle in text_lower) else "Intermediate"
            found_skills_map[canonical] = level

    detected_skills = [{"name": name, "level": lvl} for name, lvl in found_skills_map.items()]
    if not detected_skills:
        detected_skills = [
            {"name": "Python", "level": "Advanced"},
            {"name": "FastAPI", "level": "Intermediate"},
            {"name": "React", "level": "Intermediate"},
            {"name": "SQL", "level": "Intermediate"}
        ]

    # 8. Experience & Projects
    exp_months = 0
    exp_match = re.search(r'(\d+)\s*(?:months?|mos?)\b', text, re.IGNORECASE)
    if exp_match:
        try:
            exp_months = int(exp_match.group(1))
        except ValueError:
            exp_months = 3
    elif "intern" in text_lower or "internship" in text_lower:
        exp_months = 3

    projects_count = 2
    proj_headers = len(re.findall(r'(?:project|developed|architected|engineered)\s*[:#\d]', text, re.IGNORECASE))
    if proj_headers >= 1:
        projects_count = min(5, max(2, proj_headers))

    # 9. Preferred Locations & Sectors
    locations = []
    for city in ["Bengaluru", "Pune", "Hyderabad", "Mumbai", "New Delhi", "Chennai", "Remote"]:
        if city.lower() in text_lower:
            locations.append(city)
    if not locations:
        locations = ["Bengaluru", "Pune", "Remote"]

    sectors = []
    if any(k in text_lower for k in ["software", "cloud", "developer", "full-stack", "it", "code"]):
        sectors.append("Information Technology")
    if any(k in text_lower for k in ["fintech", "banking", "finance"]):
        sectors.append("Banking & FinTech")
    if any(k in text_lower for k in ["green energy", "solar", "hydrogen", "renewable"]):
        sectors.append("Green Energy")
    if not sectors:
        sectors = ["Information Technology"]

    return {
        "candidate_name": candidate_name,
        "registration_number": registration_number,
        "email": email,
        "phone": phone,
        "degree": degree,
        "field_of_study": field_of_study,
        "cgpa_percentage": cgpa,
        "graduation_year": 2026,
        "skills": detected_skills,
        "experience_months": exp_months,
        "projects_count": projects_count,
        "preferred_locations": locations,
        "preferred_sectors": sectors,
        "work_mode_preference": "Any",
        "category": "GEN"
    }


class EphemeralStudent:
    """Mock student wrapper for matching engine calculation."""
    def __init__(self, data: Dict[str, Any]):
        for k, v in data.items():
            setattr(self, k, v)
        self.state = "Karnataka"
        self.city = data.get("preferred_locations", ["Bengaluru"])[0]
        self.gender = "Male"
        self.id = 999999
        self.user_id = 999999


def analyze_and_rank_internships(portfolio_data: Dict[str, Any], internships: List[Any], weights: Dict[str, float] = None) -> List[Dict[str, Any]]:
    """Runs the 6-dimension optimization matching engine against all open PM internships."""
    student_obj = EphemeralStudent(portfolio_data)
    results = []

    for item in internships:
        comp = calculate_compatibility(student_obj, item, weights)
        results.append(comp)

    # Sort descending by total_score
    results.sort(key=lambda x: (x["eligible"], x["total_score"]), reverse=True)
    return results
