import pytest
from matching_engine import calculate_compatibility, check_mandatory_eligibility
from optimization_engine import run_internship_allocation

class DummyStudent:
    def __init__(self, id, name, category, cgpa, degree, field, skills, pref_sectors, pref_locs, work_mode="Any"):
        self.id = id
        self.user = type('User', (), {'full_name': name, 'email': f"{name.lower().replace(' ', '')}@test.com"})()
        self.category = category
        self.cgpa_percentage = cgpa
        self.degree = degree
        self.field_of_study = field
        self.skills = [{"name": s, "level": "Advanced"} for s in skills]
        self.preferred_sectors = pref_sectors
        self.preferred_locations = pref_locs
        self.work_mode_preference = work_mode
        self.experience_months = 6
        self.projects_count = 3
        self.city = pref_locs[0] if pref_locs else "Delhi"
        self.state = "Delhi"

class DummyInternship:
    def __init__(self, id, title, sector, location, seats, min_cgpa, req_degree, req_skills, reservations=None, is_remote=False):
        self.id = id
        self.company = type('Company', (), {'company_name': f"Company_{id}"})()
        self.title = title
        self.sector = sector
        self.location = location
        self.seats_total = seats
        self.min_cgpa = min_cgpa
        self.required_degree = req_degree
        self.required_skills = req_skills
        self.preferred_skills = []
        self.category_reservations = reservations or {}
        self.is_remote = is_remote
        self.stipend_amount = 20000

# Test 1: Ineligible Candidate (CGPA below minimum threshold)
def test_cgpa_ineligibility():
    student = DummyStudent(1, "Low CGPA Candidate", "GEN", 6.2, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
    internship = DummyInternship(101, "High Bar ML Role", "IT", "Delhi", 1, 7.5, ["B.Tech / B.E."], ["Python"])
    
    is_eligible, reasons = check_mandatory_eligibility(student, internship)
    assert not is_eligible
    assert any("below mandatory minimum" in r for r in reasons)
    
    res = calculate_compatibility(student, internship)
    assert not res["eligible"]
    assert res["total_score"] == 0.0

# Test 2: Ineligible Candidate (Degree Mismatch)
def test_degree_mismatch_ineligibility():
    student = DummyStudent(2, "Commerce Student", "GEN", 8.5, "B.Com", "Finance", ["Excel"], ["Finance"], ["Mumbai"])
    internship = DummyInternship(102, "Embedded Hardware Engineer", "Hardware", "Mumbai", 1, 6.5, ["B.Tech / B.E."], ["Embedded C"])
    
    is_eligible, reasons = check_mandatory_eligibility(student, internship)
    assert not is_eligible
    assert any("does not satisfy required qualifications" in r for r in reasons)

# Test 3: Multiple Candidates Competing for One Seat (Capacity & Score Maximization)
def test_multiple_candidates_competing_one_seat():
    # Candidate A: 90% match
    cand_a = DummyStudent(10, "Candidate Superior", "GEN", 9.0, "B.Tech / B.E.", "CS", ["Python", "React", "SQL"], ["IT"], ["Delhi"])
    # Candidate B: Lower match
    cand_b = DummyStudent(11, "Candidate Moderate", "GEN", 7.0, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
    
    # 1 vacancy only
    internship = DummyInternship(201, "Competitive Seat", "IT", "Delhi", 1, 6.5, ["B.Tech / B.E."], ["Python", "React", "SQL"])
    
    res = run_internship_allocation([cand_a, cand_b], [internship])
    assert res["status"] in ["OPTIMAL", "FEASIBLE"]
    assert res["total_allocated"] == 1
    # Candidate A must get the seat due to higher score
    assigned_student_id = res["assignments"][0]["student_id"]
    assert assigned_student_id == cand_a.id

# Test 4: One Candidate Matching Multiple Companies (At Most One Internship Guarantee)
def test_at_most_one_internship_per_student():
    student = DummyStudent(20, "All-Rounder", "GEN", 9.5, "B.Tech / B.E.", "CS", ["Python", "React", "AWS", "SQL"], ["IT"], ["Bengaluru"])
    i1 = DummyInternship(301, "Role Alpha", "IT", "Bengaluru", 2, 7.0, ["B.Tech / B.E."], ["Python"])
    i2 = DummyInternship(302, "Role Beta", "IT", "Bengaluru", 2, 7.0, ["B.Tech / B.E."], ["React"])
    i3 = DummyInternship(303, "Role Gamma", "IT", "Bengaluru", 2, 7.0, ["B.Tech / B.E."], ["SQL"])
    
    res = run_internship_allocation([student], [i1, i2, i3])
    assert res["status"] in ["OPTIMAL", "FEASIBLE"]
    assert res["total_allocated"] == 1
    # Exactly 1 assignment
    student_assignments = [a for a in res["assignments"] if a["student_id"] == student.id]
    assert len(student_assignments) == 1

# Test 5: Company Capacity Strictly Respected
def test_company_capacity_never_exceeded():
    candidates = [
        DummyStudent(i, f"Student {i}", "GEN", 8.0, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
        for i in range(1, 10)
    ]
    # Capacity is 2
    internship = DummyInternship(401, "Small Batch Role", "IT", "Delhi", 2, 6.0, ["B.Tech / B.E."], ["Python"])
    
    res = run_internship_allocation(candidates, [internship])
    assert res["total_allocated"] <= 2
    assert len(res["assignments"]) == 2

# Test 6: Reservation Quota Satisfaction
def test_reservation_quota_constraints():
    cand_gen = DummyStudent(51, "General Candidate", "GEN", 8.5, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
    cand_sc = DummyStudent(52, "SC Candidate", "SC", 8.0, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
    
    # 2 seats total: 1 GEN, 1 SC reserved
    internship = DummyInternship(501, "Inclusive Role", "IT", "Delhi", 2, 6.0, ["B.Tech / B.E."], ["Python"], reservations={"GEN": 1, "SC": 1})
    
    res = run_internship_allocation([cand_gen, cand_sc], [internship], enforce_quotas=True)
    assert res["total_allocated"] == 2
    assigned_categories = {a["student_category"] for a in res["assignments"]}
    assert "GEN" in assigned_categories
    assert "SC" in assigned_categories

# Test 7: Infeasible Quota Conflict Diagnostics (Admin Review Trigger)
def test_infeasible_quota_conflict_diagnostics():
    # 1 candidate who is GEN, but internship requires 1 seat for ST
    cand_gen = DummyStudent(61, "Only General Candidate", "GEN", 8.5, "B.Tech / B.E.", "CS", ["Python"], ["IT"], ["Delhi"])
    internship = DummyInternship(601, "ST Reserved Role", "IT", "Delhi", 1, 6.0, ["B.Tech / B.E."], ["Python"], reservations={"ST": 1})
    
    res = run_internship_allocation([cand_gen], [internship], enforce_quotas=True, allow_relaxation=True)
    # The conflict diagnostic must explicitly record the ST shortfall
    assert len(res["conflict_diagnostics"]) > 0
    st_conflict = [c for c in res["conflict_diagnostics"] if c.get("category") == "ST"]
    assert len(st_conflict) > 0
    assert st_conflict[0]["shortfall"] == 1
    assert "flagged for Admin Review" in st_conflict[0]["message"]

if __name__ == "__main__":
    test_cgpa_ineligibility()
    test_degree_mismatch_ineligibility()
    test_multiple_candidates_competing_one_seat()
    test_at_most_one_internship_per_student()
    test_company_capacity_never_exceeded()
    test_reservation_quota_constraints()
    test_infeasible_quota_conflict_diagnostics()
    print("ALL 7 CORE CONSTRAINTS & ALLOCATION SCENARIOS PASSED WITH 100% SUCCESS!")
