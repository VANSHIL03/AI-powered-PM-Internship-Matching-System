import time
from typing import List, Dict, Any, Tuple
from ortools.linear_solver import pywraplp
from matching_engine import calculate_compatibility, check_mandatory_eligibility

def run_internship_allocation(
    students: List[Any],
    internships: List[Any],
    weights: Dict[str, float] = None,
    enforce_quotas: bool = True,
    allow_relaxation: bool = True
) -> Dict[str, Any]:
    """
    Constraint-Aware Integer Linear Programming (ILP) Engine using Google OR-Tools.
    
    Objective:
        Maximize sum_{(s,i)} [ Score(s,i) * X_{s,i} ] - Slack_Penalties
        
    Constraints:
        1. Each student assigned to <= 1 internship
        2. Total interns assigned to internship i <= Capacity_i
        3. Only eligible candidate-internship pairs are considered (X_{s,i} = 0 if ineligible)
        4. Category reservation quotas:
           Sum_{s in Category_c} X_{s,i} + Slack_{i,c} >= Quota_{i,c}
        5. Infeasibility analysis:
           Pinpoints exact shortage/conflicts if quotas exceed eligible supply.
    """
    start_time = time.time()
    
    # 1. Pre-calculate all compatibility scores and eligibility
    score_matrix: Dict[Tuple[int, int], Dict[str, Any]] = {}
    eligible_pairs = []
    student_eligible_count: Dict[int, int] = {s.id: 0 for s in students}
    
    for s in students:
        for i in internships:
            res = calculate_compatibility(s, i, weights)
            score_matrix[(s.id, i.id)] = res
            if res["eligible"] and res["total_score"] > 0:
                eligible_pairs.append((s.id, i.id))
                student_eligible_count[s.id] += 1

    # 2. Infeasibility & Conflict Diagnostic Pre-check
    conflict_diagnostics = []
    
    # Check category quota feasibility
    category_applicants: Dict[str, List[int]] = {}
    for s in students:
        cat = getattr(s, "category", "GEN")
        category_applicants.setdefault(cat, []).append(s.id)

    total_seats_by_internship = {i.id: i.seats_total for i in internships}
    
    for i in internships:
        quotas = getattr(i, "category_reservations", {}) or {}
        internship_quota_sum = 0
        for cat, req_seats in quotas.items():
            if req_seats <= 0:
                continue
            internship_quota_sum += req_seats
            # Check how many eligible applicants in this category exist for internship i
            eligible_cat_students = [
                s.id for s in students 
                if getattr(s, "category", "GEN") == cat and score_matrix[(s.id, i.id)]["eligible"]
            ]
            if len(eligible_cat_students) < req_seats:
                shortfall = req_seats - len(eligible_cat_students)
                conflict_diagnostics.append({
                    "type": "QUOTA_SHORTFALL",
                    "internship_id": i.id,
                    "internship_title": i.title,
                    "category": cat,
                    "quota_required": req_seats,
                    "eligible_applicants_available": len(eligible_cat_students),
                    "shortfall": shortfall,
                    "message": (
                        f"Internship '{i.title}' reserved {req_seats} seat(s) for {cat}, "
                        f"but only {len(eligible_cat_students)} eligible {cat} applicant(s) were found. "
                        f"Shortfall of {shortfall} seat(s) flagged for Admin Review."
                    )
                })

        # Check if total quotas exceed total capacity
        if internship_quota_sum > i.seats_total:
            conflict_diagnostics.append({
                "type": "OVERCAPACITY_QUOTA",
                "internship_id": i.id,
                "internship_title": i.title,
                "total_capacity": i.seats_total,
                "sum_quotas": internship_quota_sum,
                "message": (
                    f"Configuration conflict in '{i.title}': Sum of reserved seats ({internship_quota_sum}) "
                    f"exceeds total seats ({i.seats_total})."
                )
            })

    # 3. Create OR-Tools Solver
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if not solver:
        # Fallback to CBC
        solver = pywraplp.Solver.CreateSolver("CBC")
    if not solver:
        return {
            "status": "ERROR",
            "message": "OR-Tools MILP solver backend (SCIP/CBC) could not be initialized.",
            "execution_time_ms": (time.time() - start_time) * 1000,
            "assignments": [],
            "conflict_diagnostics": conflict_diagnostics
        }

    # 4. Decision Variables: X[s_id, i_id]
    X = {}
    for (s_id, i_id) in eligible_pairs:
        X[(s_id, i_id)] = solver.BoolVar(f"X_{s_id}_{i_id}")

    # Slack variables for quota relaxation / penalty
    Slack = {}
    if enforce_quotas:
        for i in internships:
            quotas = getattr(i, "category_reservations", {}) or {}
            for cat, req_seats in quotas.items():
                if req_seats > 0:
                    Slack[(i.id, cat)] = solver.NumVar(0.0, float(req_seats), f"Slack_{i.id}_{cat}")

    # 5. Objective Function: Maximize total compatibility score
    objective = solver.Objective()
    for (s_id, i_id), var in X.items():
        score = score_matrix[(s_id, i_id)]["total_score"]
        objective.SetCoefficient(var, float(score))

    # Penalize slacks heavily so quotas are satisfied whenever mathematically feasible
    SLACK_PENALTY = 1000.0
    for slack_var in Slack.values():
        objective.SetCoefficient(slack_var, -SLACK_PENALTY)

    objective.SetMaximization()

    # 6. Constraints:
    # A. Each student assigned at most one internship
    for s in students:
        student_vars = [X[(s.id, i.id)] for i in internships if (s.id, i.id) in X]
        if student_vars:
            solver.Add(solver.Sum(student_vars) <= 1)

    # B. Each internship seat capacity never exceeded
    for i in internships:
        internship_vars = [X[(s.id, i.id)] for s in students if (s.id, i.id) in X]
        if internship_vars:
            solver.Add(solver.Sum(internship_vars) <= int(i.seats_total))

    # C. Reservation Quota Constraints
    if enforce_quotas:
        student_cat_map = {s.id: getattr(s, "category", "GEN") for s in students}
        for i in internships:
            quotas = getattr(i, "category_reservations", {}) or {}
            for cat, req_seats in quotas.items():
                if req_seats > 0:
                    cat_vars = [
                        X[(s_id, i.id)] for (s_id, i_id) in eligible_pairs 
                        if i_id == i.id and student_cat_map.get(s_id) == cat
                    ]
                    if (i.id, cat) in Slack:
                        # With slack relaxation: sum(X) + Slack >= req_seats
                        solver.Add(solver.Sum(cat_vars) + Slack[(i.id, cat)] >= float(req_seats))
                    else:
                        solver.Add(solver.Sum(cat_vars) >= float(req_seats))

    # 7. Solve
    solver_status_code = solver.Solve()
    execution_time_ms = (time.time() - start_time) * 1000

    status_name = "OPTIMAL"
    if solver_status_code == pywraplp.Solver.OPTIMAL:
        status_name = "OPTIMAL"
    elif solver_status_code == pywraplp.Solver.FEASIBLE:
        status_name = "FEASIBLE"
    elif solver_status_code == pywraplp.Solver.INFEASIBLE:
        status_name = "INFEASIBLE"
    else:
        status_name = f"SOLVER_STATUS_{solver_status_code}"

    # 8. Collect Assignments
    assignments = []
    total_allocated_score = 0.0
    
    if status_name in ["OPTIMAL", "FEASIBLE"]:
        student_dict = {s.id: s for s in students}
        internship_dict = {i.id: i for i in internships}

        for (s_id, i_id), var in X.items():
            if var.solution_value() > 0.5:
                s = student_dict[s_id]
                i = internship_dict[i_id]
                comp = score_matrix[(s_id, i_id)]
                
                # Determine quota tag
                category = getattr(s, "category", "GEN")
                quotas = getattr(i, "category_reservations", {}) or {}
                quota_tag = category if quotas.get(category, 0) > 0 else "GEN"

                assignment = {
                    "student_id": s.id,
                    "student_name": getattr(s.user, "full_name", f"Student #{s.id}") if getattr(s, "user", None) else f"Student #{s.id}",
                    "student_email": getattr(s.user, "email", "") if getattr(s, "user", None) else "",
                    "student_category": category,
                    "student_cgpa": getattr(s, "cgpa_percentage", 0.0),
                    "internship_id": i.id,
                    "internship_title": i.title,
                    "company_name": getattr(i.company, "company_name", "Partner Enterprise") if getattr(i, "company", None) else "Partner Enterprise",
                    "sector": i.sector,
                    "location": i.location,
                    "score": comp["total_score"],
                    "score_breakdown": comp["breakdown"],
                    "category_quota_assigned": quota_tag
                }
                assignments.append(assignment)
                total_allocated_score += comp["total_score"]

    avg_score = round(total_allocated_score / max(1, len(assignments)), 2)

    return {
        "status": status_name,
        "execution_time_ms": round(execution_time_ms, 2),
        "total_students": len(students),
        "total_vacancies": sum(i.seats_total for i in internships),
        "total_allocated": len(assignments),
        "average_score": avg_score,
        "objective_value": round(solver.Objective().Value(), 2) if status_name in ["OPTIMAL", "FEASIBLE"] else 0.0,
        "assignments": assignments,
        "conflict_diagnostics": conflict_diagnostics,
        "is_optimal": status_name == "OPTIMAL"
    }
