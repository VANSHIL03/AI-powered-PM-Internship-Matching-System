# AI-Powered PM Internship Matching System
### Hackathon: Manthan Kriti 2026

An enterprise-grade, constraint-aware intelligent internship matching and allocation web application built for the **PM Internship Scheme (PMIS)**. The system solves the large-scale allocation problem of placing thousands of candidates across top partner enterprises using **Python Google OR-Tools Integer Linear Programming (ILP)**, satisfying hard eligibility criteria, capacity bounds, and illustrative reservation quotas while maximizing overall compatibility.

---

## 🏛️ Executive Summary & Key Highlights

- **Branding**: Manthan Kriti 2026 • AI-Powered PM Internship Matching System
- **Government-Tech UI/UX**: Clean aesthetic featuring Indian tricolor accents, national emblem insignia, deep navy blue (`#0F2A4A`), emerald green (`#107E54`), and warm saffron/gold badges.
- **Three Dedicated Dashboards**:
  1. **Student Dashboard**: Real-time profile management, skills matrix with proficiency ratings, PDF/DOCX resume upload, sector & location preferences, AI compatibility ranking, official allotment offer letter banner.
  2. **Company Dashboard**: Post new opportunities, define required & preferred skills, set seat capacity & illustrative reservation quotas, review candidate pool ranked by compatibility, inspect candidate profiles and resumes.
  3. **Admin & Optimization Console**: Configurable weight tuning sliders, reservation quota rules, **Google OR-Tools ILP solver execution**, real-time conflict diagnostics, admin approval & publish gate, unallocated candidate diagnosis, and 1-click CSV ledger export.
- **Explainable Multi-Criteria Scoring (0–100)**:
  - **Skill Compatibility (40%)**: Cosine & proficiency-weighted overlap against required and preferred skills.
  - **Student Preferences (20%)**: Sector preferences and onsite/remote work mode alignment.
  - **Location Compatibility (15%)**: Geographic proximity and remote tolerance.
  - **Education & Eligibility (10%)**: Degree program match and CGPA merit above threshold.
  - **Experience & Projects (10%)**: Project portfolio count and past internship duration.
  - **Other / Diversity (5%)**: Demographic and background empowerment factors.
- **Hard Constraints & Optimization Guarantee**:
  - **Single Allotment Guarantee**: Each student receives at most one internship ($\sum_i X_{s,i} \le 1$).
  - **Strict Capacity Bounds**: Company seat capacity is never exceeded ($\sum_s X_{s,i} \le \text{Capacity}_i$).
  - **Binary Hard Eligibility Gating**: Candidates with CGPA below minimum threshold or non-qualifying degree are excluded ($X_{s,i} = 0$).
  - **Illustrative Reservation Quota Enforcement**: Solves for category seats (GEN, OBC-NCL, SC, ST, EWS, PwD).
  - **Conflict Diagnostics for Administrator Review**: If quotas cannot be met due to candidate shortages in a category, solver flags the exact shortfall with actionable diagnostics instead of silently violating rules.

---

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Axios |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Optimization Engine** | Google OR-Tools (`ortools.linear_solver.pywraplp` - SCIP/CBC MIP Solvers) |
| **Database** | SQLite (out-of-the-box local zero-config) / PostgreSQL compatible via SQLAlchemy ORM |
| **Security & Auth** | Role-Based Access Control (RBAC), Direct `bcrypt` password hashing, PyJWT tokens |

---

## 🔐 Sample Demo Credentials

For quick evaluation during judging and demonstration, the application features **1-click Quick Demo Sign-In** pills on the navigation bar and auth page:

| Role | Email | Password | Persona & Purpose |
|---|---|---|---|
| **Admin** | `admin@manthan.gov.in` | `Admin@123` | Dr. Rajeshwar Rao (National Allocation Director) — Weight tuning, solver execution, publishing |
| **Student** | `arjun.sharma@example.com` | `Student@123` | Arjun Sharma (B.Tech CS, CGPA: 8.85) — Matched to TCS Cloud Platform Intern (90% score) |
| **Company** | `hr@tcs.example.com` | `Company@123` | Tata Consultancy Services (HR Lead) — Manage postings, review candidates, view allocated interns |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install python dependencies
pip install fastapi uvicorn sqlalchemy pydantic email-validator bcrypt pyjwt ortools pandas

# Seed realistic dataset (100 students, 10 companies, 30 internships)
python seed_data.py

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install node packages
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend Web Application will be live at: `http://127.0.0.1:5173`

---

## 🧪 Comprehensive Test Suite

Run the automated test suite verifying all 7 core constraint scenarios:
```bash
cd backend
python test_system.py
```
**Test Coverage Verified:**
1. `test_cgpa_ineligibility`: CGPA below minimum disqualifies candidate (`score = 0`).
2. `test_degree_mismatch_ineligibility`: Incompatible degree triggers binary exclusion.
3. `test_multiple_candidates_competing_one_seat`: Higher compatibility candidate is allocated; capacity bound respected.
4. `test_at_most_one_internship_per_student`: Guarantee that candidate matching multiple vacancies receives at most 1 seat.
5. `test_company_capacity_never_exceeded`: Firm seat ceilings strictly enforced.
6. `test_reservation_quota_constraints`: Category reservations filled appropriately.
7. `test_infeasible_quota_conflict_diagnostics`: Shortfall generates diagnostic report for Admin Review.

---

## 📊 Application Pages Overview

1. **Landing Page**: Real-time stats, 4-step pipeline visualizer, partner showcase, 1-click evaluation accounts.
2. **Login and Registration**: Role switcher tabs, instant demo sign-in buttons.
3. **Student Profile**: Personal details, reservation category, academic qualifications, skills with proficiency ratings, preferred sectors, preferred cities, and resume upload.
4. **Student Dashboard**: Application status, official allotment offer letter (with download preview), AI compatibility recommendations with explainable modal.
5. **Company Dashboard**: Post new opportunities, define required/preferred skills, seat capacity, review ranked candidate pool, view allocated interns roster.
6. **Internships Listings**: Multi-faceted filter directory (sector, location, remote, min stipend, search query).
7. **AI Matching Results**: 0–100 compatibility matrix with 6-dimension breakdown and matched/missing skills badges.
8. **Admin Dashboard & Allocation Management**: Weight sliders, quota toggles, OR-Tools execution button, conflict diagnostics, publish gate, allocation ledger, and unallocated candidate diagnostics.
9. **Analytics & Reports**: Interactive Recharts visualizations (sector distribution, reservation compliance, score histogram, national fill rate) and CSV export.

---

## 📜 Disclaimer
*Sample reservation categories and configurable quota rules are provided for technical demonstration of mathematical modeling and constraint-aware optimization in Manthan Kriti 2026. They do not constitute official Government of India policy.*
