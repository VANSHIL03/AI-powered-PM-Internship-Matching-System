import io
import csv
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User, StudentProfile, Internship, CompanyProfile, AllocationRun, AllocationAssignment, SystemSetting, AuditLog
)
from schemas import (
    MatchingWeights, ReservationRuleConfig, AllocationRunRequest, AllocationRunOut
)
from auth import get_current_user, require_role, log_audit
from optimization_engine import run_internship_allocation
from matching_engine import DEFAULT_WEIGHTS

router = APIRouter(prefix="/api/allocations", tags=["Allocations"])

@router.get("/weights")
def get_weights(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    if setting:
        return setting.value_json
    return DEFAULT_WEIGHTS


@router.put("/weights")
def update_weights(
    weights: MatchingWeights,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
    if not setting:
        setting = SystemSetting(key="matching_weights", value_json={})
        db.add(setting)

    setting.value_json = weights.model_dump()
    db.commit()
    log_audit(db, "MATCHING_WEIGHTS_UPDATED", current_user.email, "admin", weights.model_dump())
    return {"message": "Matching weights updated successfully", "weights": setting.value_json}


@router.get("/rules")
def get_reservation_rules(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "reservation_rules").first()
    if setting:
        return setting.value_json
    return {
        "enforce_quotas": True,
        "allow_unfilled_spillover": True,
        "disclaimer": "Sample reservation quotas and category seat reservations are purely illustrative for technical demonstration."
    }


@router.put("/rules")
def update_reservation_rules(
    rules: Dict[str, Any],
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "reservation_rules").first()
    if not setting:
        setting = SystemSetting(key="reservation_rules", value_json={})
        db.add(setting)

    setting.value_json = rules
    db.commit()
    log_audit(db, "RESERVATION_RULES_UPDATED", current_user.email, "admin", rules)
    return {"message": "Reservation rules updated successfully", "rules": rules}


@router.post("/run")
def execute_allocation(
    req: AllocationRunRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    # Fetch weights
    weights = req.weights.model_dump() if req.weights else None
    if not weights:
        w_setting = db.query(SystemSetting).filter(SystemSetting.key == "matching_weights").first()
        weights = w_setting.value_json if w_setting else DEFAULT_WEIGHTS

    # Fetch students and internships
    students = db.query(StudentProfile).all()
    internships = db.query(Internship).filter(Internship.status != "CLOSED").all()

    if not students:
        raise HTTPException(status_code=400, detail="No student applicants registered.")
    if not internships:
        raise HTTPException(status_code=400, detail="No internship opportunities available.")

    # Execute OR-Tools optimization
    res = run_internship_allocation(
        students=students,
        internships=internships,
        weights=weights,
        enforce_quotas=req.enforce_quotas,
        allow_relaxation=req.allow_relaxation
    )

    # Determine run number
    last_run = db.query(AllocationRun).order_by(AllocationRun.id.desc()).first()
    run_num = (last_run.run_number + 1) if last_run else 1

    r_setting = db.query(SystemSetting).filter(SystemSetting.key == "reservation_rules").first()
    rules_json = r_setting.value_json if r_setting else {"enforce_quotas": req.enforce_quotas}

    # Save AllocationRun
    run_record = AllocationRun(
        run_number=run_num,
        timestamp=datetime.datetime.utcnow(),
        total_students=len(students),
        total_vacancies=res["total_vacancies"],
        total_allocated=res["total_allocated"],
        average_score=res["average_score"],
        solver_status=res["status"],
        solver_execution_time_ms=res["execution_time_ms"],
        weights_used=weights,
        reservation_rules_used=rules_json,
        conflict_diagnostics=res["conflict_diagnostics"],
        is_published=False,
        notes=f"Generated via Google OR-Tools MIP solver. Status: {res['status']}"
    )
    db.add(run_record)
    db.flush()

    # Save Individual Assignments
    for a in res["assignments"]:
        assignment = AllocationAssignment(
            run_id=run_record.id,
            student_id=a["student_id"],
            internship_id=a["internship_id"],
            score=a["score"],
            score_breakdown=a["score_breakdown"],
            category_quota_assigned=a["category_quota_assigned"]
        )
        db.add(assignment)

    db.commit()
    db.refresh(run_record)

    log_audit(db, "ALLOCATION_OPTIMIZATION_EXECUTED", current_user.email, "admin", {
        "run_id": run_record.id,
        "status": res["status"],
        "allocated_count": res["total_allocated"],
        "conflicts_count": len(res["conflict_diagnostics"])
    })

    return {
        "run_id": run_record.id,
        "run_number": run_record.run_number,
        "timestamp": run_record.timestamp,
        "status": res["status"],
        "execution_time_ms": res["execution_time_ms"],
        "total_students": len(students),
        "total_vacancies": res["total_vacancies"],
        "total_allocated": res["total_allocated"],
        "average_score": res["average_score"],
        "conflict_diagnostics": res["conflict_diagnostics"],
        "is_published": False,
        "assignments": res["assignments"]
    }


@router.post("/publish/{run_id}")
def publish_allocation(
    run_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Allocation run not found.")

    # 1. Reset any previous allocations
    db.query(StudentProfile).update({
        StudentProfile.allocation_status: "UNALLOCATED",
        StudentProfile.allocated_internship_id: None,
        StudentProfile.allocated_score: None,
        StudentProfile.allocated_at: None
    })
    db.query(Internship).update({
        Internship.seats_allocated: 0
    })

    # 2. Mark this run as published, others as false
    db.query(AllocationRun).update({AllocationRun.is_published: False})
    run.is_published = True

    # 3. Apply assignments to students and internships
    internship_counts = {}
    for a in run.assignments:
        student = db.query(StudentProfile).filter(StudentProfile.id == a.student_id).first()
        if student:
            student.allocation_status = "ALLOCATED"
            student.allocated_internship_id = a.internship_id
            student.allocated_score = a.score
            student.allocated_at = datetime.datetime.utcnow()

        internship_counts[a.internship_id] = internship_counts.get(a.internship_id, 0) + 1

    for i_id, count in internship_counts.items():
        internship = db.query(Internship).filter(Internship.id == i_id).first()
        if internship:
            internship.seats_allocated = count

    db.commit()
    log_audit(db, "ALLOCATION_PUBLISHED", current_user.email, "admin", {
        "run_id": run.id,
        "total_allocated": len(run.assignments)
    })

    return {
        "message": f"Allocation Run #{run.run_number} has been officially approved and published.",
        "published_run_id": run.id,
        "total_allocated": len(run.assignments)
    }


@router.post("/reset")
def reset_allocations(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    db.query(StudentProfile).update({
        StudentProfile.allocation_status: "UNALLOCATED",
        StudentProfile.allocated_internship_id: None,
        StudentProfile.allocated_score: None,
        StudentProfile.allocated_at: None
    })
    db.query(Internship).update({
        Internship.seats_allocated: 0
    })
    db.query(AllocationRun).update({AllocationRun.is_published: False})

    db.commit()
    log_audit(db, "ALLOCATIONS_RESET", current_user.email, "admin", {})
    return {"message": "All student allocations and internship seats have been reset to UNALLOCATED."}


@router.get("/runs")
def list_allocation_runs(
    current_user: User = Depends(require_role(["admin", "company"])),
    db: Session = Depends(get_db)
):
    runs = db.query(AllocationRun).order_by(AllocationRun.id.desc()).all()
    results = []
    for r in runs:
        results.append({
            "id": r.id,
            "run_number": r.run_number,
            "timestamp": r.timestamp,
            "total_students": r.total_students,
            "total_vacancies": r.total_vacancies,
            "total_allocated": r.total_allocated,
            "average_score": r.average_score,
            "solver_status": r.solver_status,
            "solver_execution_time_ms": r.solver_execution_time_ms,
            "conflict_count": len(r.conflict_diagnostics or []),
            "is_published": r.is_published
        })
    return results


@router.get("/runs/{run_id}")
def get_allocation_run_detail(
    run_id: int,
    current_user: User = Depends(require_role(["admin", "company"])),
    db: Session = Depends(get_db)
):
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Allocation run not found.")

    assignments_out = []
    for a in run.assignments:
        assignments_out.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.user.full_name if a.student and a.student.user else f"Student #{a.student_id}",
            "student_email": a.student.user.email if a.student and a.student.user else "",
            "student_category": a.student.category if a.student else "GEN",
            "student_cgpa": a.student.cgpa_percentage if a.student else 0.0,
            "internship_id": a.internship_id,
            "internship_title": a.internship.title if a.internship else "",
            "company_name": a.internship.company.company_name if a.internship and a.internship.company else "",
            "sector": a.internship.sector if a.internship else "",
            "location": a.internship.location if a.internship else "",
            "score": a.score,
            "score_breakdown": a.score_breakdown,
            "category_quota_assigned": a.category_quota_assigned,
            "assigned_at": a.assigned_at
        })

    return {
        "id": run.id,
        "run_number": run.run_number,
        "timestamp": run.timestamp,
        "total_students": run.total_students,
        "total_vacancies": run.total_vacancies,
        "total_allocated": run.total_allocated,
        "average_score": run.average_score,
        "solver_status": run.solver_status,
        "solver_execution_time_ms": run.solver_execution_time_ms,
        "weights_used": run.weights_used,
        "reservation_rules_used": run.reservation_rules_used,
        "conflict_diagnostics": run.conflict_diagnostics,
        "is_published": run.is_published,
        "assignments": assignments_out
    }


@router.get("/unallocated/{run_id}")
def get_unallocated_candidates(
    run_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")

    allocated_student_ids = set(a.student_id for a in run.assignments)
    all_students = db.query(StudentProfile).all()
    unallocated = []

    for s in all_students:
        if s.id not in allocated_student_ids:
            # Diagnose reason for unallocated status
            reasons = []
            if s.cgpa_percentage < 6.5:
                reasons.append("CGPA below common competitive thresholds for top vacancies")
            if s.preferred_locations and "Remote" not in s.preferred_locations and len(s.preferred_locations) <= 1:
                reasons.append(f"Highly restricted location preference ({', '.join(s.preferred_locations)})")
            if not s.skills or len(s.skills) < 2:
                reasons.append("Limited registered skill profile")
            if not reasons:
                reasons.append("High competition in preferred sector / capacity exhausted by higher-scoring peers")

            unallocated.append({
                "student_id": s.id,
                "registration_number": s.registration_number,
                "full_name": s.user.full_name if s.user else f"Candidate #{s.id}",
                "email": s.user.email if s.user else "",
                "category": s.category,
                "cgpa": s.cgpa_percentage,
                "degree": s.degree,
                "city": s.city,
                "preferred_sectors": s.preferred_sectors,
                "primary_reason": "; ".join(reasons)
            })

    return {
        "run_id": run_id,
        "total_unallocated": len(unallocated),
        "candidates": unallocated
    }


@router.get("/export-csv/{run_id}")
def export_allocations_csv(
    run_id: int,
    current_user: User = Depends(require_role(["admin", "company"])),
    db: Session = Depends(get_db)
):
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Allocation run not found.")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Allocation Run #", run.run_number,
        "Timestamp", run.timestamp.isoformat(),
        "Solver Status", run.solver_status
    ])
    writer.writerow([])
    writer.writerow([
        "Student ID", "Registration No", "Candidate Name", "Email", "Category", "CGPA",
        "Degree", "Internship ID", "Internship Title", "Company Name", "Sector",
        "Location", "Compatibility Score", "Skills Component", "Pref Component",
        "Location Component", "Quota Assigned Under"
    ])

    for a in run.assignments:
        s = a.student
        i = a.internship
        b = a.score_breakdown or {}
        writer.writerow([
            s.id if s else a.student_id,
            s.registration_number if s else "",
            s.user.full_name if s and s.user else "",
            s.user.email if s and s.user else "",
            s.category if s else "",
            s.cgpa_percentage if s else "",
            s.degree if s else "",
            i.id if i else a.internship_id,
            i.title if i else "",
            i.company.company_name if i and i.company else "",
            i.sector if i else "",
            i.location if i else "",
            a.score,
            b.get("skills", 0),
            b.get("preferences", 0),
            b.get("location", 0),
            a.category_quota_assigned
        ])

    csv_content = output.getvalue()
    filename = f"PM_Internship_Allocations_Run_{run.run_number}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
