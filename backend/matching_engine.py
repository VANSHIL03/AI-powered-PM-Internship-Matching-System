import math
from typing import Dict, Any, List, Tuple

DEFAULT_WEIGHTS = {
    "skills": 40.0,
    "preferences": 20.0,
    "location": 15.0,
    "education": 10.0,
    "experience": 10.0,
    "other": 5.0
}

PROFICIENCY_MULTIPLIERS = {
    "beginner": 0.65,
    "intermediate": 0.85,
    "advanced": 1.0,
    "expert": 1.15
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return text.lower().strip().replace("-", " ").replace("_", " ")

def check_mandatory_eligibility(student, internship) -> Tuple[bool, List[str]]:
    """
    Evaluates hard constraints.
    Returns (is_eligible, list_of_reasons_if_ineligible).
    """
    reasons = []

    # 1. Minimum CGPA / Percentage check
    if hasattr(internship, "min_cgpa") and internship.min_cgpa is not None:
        student_cgpa = getattr(student, "cgpa_percentage", 0.0) or 0.0
        if student_cgpa < internship.min_cgpa:
            reasons.append(
                f"CGPA {student_cgpa:.2f} is below mandatory minimum required ({internship.min_cgpa:.2f})"
            )

    # 2. Required Degree Check
    req_degrees = getattr(internship, "required_degree", []) or []
    if req_degrees and isinstance(req_degrees, list) and len(req_degrees) > 0:
        student_degree = normalize_text(getattr(student, "degree", "") or "")
        match_found = False
        for req in req_degrees:
            req_norm = normalize_text(req)
            if req_norm in student_degree or student_degree in req_norm or "any" in req_norm:
                match_found = True
                break
            # Common abbreviations
            if "b.tech" in req_norm and ("b.e" in student_degree or "engineering" in student_degree):
                match_found = True
                break
            if "mca" in req_norm and "computer" in student_degree:
                match_found = True
                break

        if not match_found:
            reasons.append(
                f"Degree '{student.degree}' does not satisfy required qualifications: {', '.join(req_degrees)}"
            )

    is_eligible = len(reasons) == 0
    return is_eligible, reasons


def calculate_compatibility(student, internship, weights_dict: Dict[str, float] = None) -> Dict[str, Any]:
    """
    Calculates detailed explainable compatibility score between student and internship.
    Returns dict with total_score (0-100), eligible (bool), ineligibility_reasons, breakdown,
    skills_matched, skills_missing.
    """
    weights = weights_dict.copy() if weights_dict else DEFAULT_WEIGHTS.copy()
    
    # Normalize weights to sum to 100
    weight_sum = sum(weights.values())
    if weight_sum > 0:
        for k in weights:
            weights[k] = (weights[k] / weight_sum) * 100.0

    # 1. Check Hard Constraints
    is_eligible, ineligibility_reasons = check_mandatory_eligibility(student, internship)

    # 2. Skill Compatibility (Default 40%)
    req_skills = getattr(internship, "required_skills", []) or []
    pref_skills = getattr(internship, "preferred_skills", []) or []
    
    student_skills_raw = getattr(student, "skills", []) or []
    # Build student skills map {name: multiplier}
    student_skills_map = {}
    for s in student_skills_raw:
        if isinstance(s, dict):
            s_name = normalize_text(s.get("name", ""))
            s_level = s.get("level", "intermediate").lower()
            mult = PROFICIENCY_MULTIPLIERS.get(s_level, 0.85)
            student_skills_map[s_name] = mult
        elif isinstance(s, str):
            student_skills_map[normalize_text(s)] = 0.85

    matched_skills = []
    missing_skills = []
    req_skill_score_sum = 0.0

    if req_skills:
        for req in req_skills:
            req_norm = normalize_text(req)
            matched = False
            for s_name, mult in student_skills_map.items():
                if req_norm == s_name or req_norm in s_name or s_name in req_norm:
                    matched = True
                    req_skill_score_sum += mult
                    matched_skills.append(req)
                    break
            if not matched:
                missing_skills.append(req)
        req_ratio = min(1.0, req_skill_score_sum / max(1, len(req_skills)))
    else:
        req_ratio = 0.85

    # Preferred skills bonus
    pref_score_sum = 0.0
    if pref_skills:
        for pref in pref_skills:
            pref_norm = normalize_text(pref)
            for s_name, mult in student_skills_map.items():
                if pref_norm == s_name or pref_norm in s_name or s_name in pref_norm:
                    pref_score_sum += mult
                    if pref not in matched_skills:
                        matched_skills.append(pref)
                    break
        pref_ratio = min(1.0, pref_score_sum / max(1, len(pref_skills)))
    else:
        pref_ratio = 0.5

    skill_raw_score = (req_ratio * 0.75) + (pref_ratio * 0.25)
    skill_component = min(weights["skills"], skill_raw_score * weights["skills"])

    # 3. Student Preferences Compatibility (Default 20%)
    pref_sectors = getattr(student, "preferred_sectors", []) or []
    intern_sector = normalize_text(getattr(internship, "sector", ""))
    sector_score = 0.3
    if not pref_sectors:
        sector_score = 0.8  # Open to all
    else:
        for ps in pref_sectors:
            ps_norm = normalize_text(ps)
            if ps_norm in intern_sector or intern_sector in ps_norm:
                sector_score = 1.0
                break
            elif any(w in intern_sector for w in ps_norm.split() if len(w) > 3):
                sector_score = 0.75

    # Work mode preference
    work_mode_pref = normalize_text(getattr(student, "work_mode_preference", "Any"))
    is_remote = getattr(internship, "is_remote", False)
    mode_score = 0.85
    if "any" in work_mode_pref:
        mode_score = 1.0
    elif "remote" in work_mode_pref and is_remote:
        mode_score = 1.0
    elif "onsite" in work_mode_pref and not is_remote:
        mode_score = 1.0
    elif "remote" in work_mode_pref and not is_remote:
        mode_score = 0.45

    pref_raw_score = (sector_score * 0.70) + (mode_score * 0.30)
    preferences_component = min(weights["preferences"], pref_raw_score * weights["preferences"])

    # 4. Location Compatibility (Default 15%)
    student_city = normalize_text(getattr(student, "city", ""))
    student_state = normalize_text(getattr(student, "state", ""))
    student_pref_locs = [normalize_text(loc) for loc in (getattr(student, "preferred_locations", []) or [])]
    intern_loc = normalize_text(getattr(internship, "location", ""))

    if is_remote:
        loc_raw_score = 1.0
    elif any(intern_loc in pl or pl in intern_loc for pl in student_pref_locs):
        loc_raw_score = 1.0
    elif student_city and (student_city in intern_loc or intern_loc in student_city):
        loc_raw_score = 0.95
    elif student_state and (student_state in intern_loc or intern_loc in student_state):
        loc_raw_score = 0.75
    elif "any" in student_pref_locs or "pan-india" in student_pref_locs or "all india" in student_pref_locs:
        loc_raw_score = 0.85
    else:
        loc_raw_score = 0.40  # Relocation required

    location_component = min(weights["location"], loc_raw_score * weights["location"])

    # 5. Education & Academic Eligibility (Default 10%)
    cgpa = getattr(student, "cgpa_percentage", 7.0) or 7.0
    # Higher CGPA scaled between 6.0 and 10.0
    cgpa_factor = min(1.0, max(0.4, (cgpa - 5.0) / 4.5))
    
    # Field of study relevance
    field = normalize_text(getattr(student, "field_of_study", ""))
    field_relevance = 0.7
    if "computer" in field or "information" in field or "data" in field or "software" in field:
        if "it" in intern_sector or "software" in intern_sector or "tech" in intern_sector:
            field_relevance = 1.0
    elif "mechanical" in field or "automobile" in field or "manufacturing" in field:
        if "manufacturing" in intern_sector or "automotive" in intern_sector:
            field_relevance = 1.0
    elif "electrical" in field or "electronics" in field:
        if "energy" in intern_sector or "electronics" in intern_sector or "hardware" in intern_sector:
            field_relevance = 1.0
    elif "finance" in field or "commerce" in field or "business" in field:
        if "finance" in intern_sector or "banking" in intern_sector:
            field_relevance = 1.0

    edu_raw_score = (cgpa_factor * 0.6) + (field_relevance * 0.4)
    education_component = min(weights["education"], edu_raw_score * weights["education"])

    # 6. Experience & Projects (Default 10%)
    projects_cnt = getattr(student, "projects_count", 0) or 0
    proj_score = min(1.0, max(0.3, projects_cnt * 0.25))

    exp_months = getattr(student, "experience_months", 0) or 0
    exp_score = min(1.0, max(0.4, 0.4 + (exp_months / 12.0) * 0.6))

    exp_raw_score = (proj_score * 0.6) + (exp_score * 0.4)
    experience_component = min(weights["experience"], exp_raw_score * weights["experience"])

    # 7. Other Configurable Criteria (Default 5%)
    # Demographic / diversity / holistic background factor
    cat = getattr(student, "category", "GEN")
    other_factor = 0.85
    if cat in ["OBC_NCL", "SC", "ST", "EWS", "PWD"]:
        other_factor = 1.0
    if getattr(student, "gender", "") in ["Female", "Other"]:
        other_factor = min(1.0, other_factor + 0.1)

    other_component = min(weights["other"], other_factor * weights["other"])

    # Final Total Calculation
    raw_total = (
        skill_component +
        preferences_component +
        location_component +
        education_component +
        experience_component +
        other_component
    )

    # If hard constraints failed, final score is 0
    final_score = round(raw_total, 1) if is_eligible else 0.0

    # Formulate human-friendly explainable match reason
    if not is_eligible:
        match_reason = f"Ineligible for this role: {'; '.join(ineligibility_reasons)}"
    elif final_score >= 80:
        matched_str = f" Matches {len(matched_skills)} core skills ({', '.join(matched_skills[:3])})." if matched_skills else ""
        match_reason = f"Exceptional {final_score}% match! Strong alignment with {getattr(internship, 'sector', 'industry')} competencies.{matched_str} Meets CGPA prerequisite."
    elif final_score >= 60:
        matched_str = f" Matched skills: {', '.join(matched_skills[:2])}." if matched_skills else ""
        missing_str = f" Recommended to strengthen: {', '.join(missing_skills[:2])}." if missing_skills else ""
        match_reason = f"Competitive {final_score}% match.{matched_str}{missing_str}"
    else:
        match_reason = f"{final_score}% match based on general qualifications and location suitability."

    apply_url = getattr(internship, "apply_url", None) or "https://pminternship.mca.gov.in/"
    official_portal_url = getattr(internship, "official_portal_url", None) or "https://pminternship.mca.gov.in/"

    return {
        "internship_id": getattr(internship, "id", 0),
        "internship_title": getattr(internship, "title", ""),
        "company_name": getattr(internship.company, "company_name", "Govt/Corporate Partner") if getattr(internship, "company", None) else "",
        "sector": getattr(internship, "sector", ""),
        "location": getattr(internship, "location", ""),
        "is_remote": is_remote,
        "stipend_amount": getattr(internship, "stipend_amount", 0),
        "total_score": final_score,
        "eligible": is_eligible,
        "ineligibility_reasons": ineligibility_reasons,
        "breakdown": {
            "skills": round(skill_component, 2),
            "preferences": round(preferences_component, 2),
            "location": round(location_component, 2),
            "education": round(education_component, 2),
            "experience": round(experience_component, 2),
            "other": round(other_component, 2),
        },
        "skills_matched": matched_skills,
        "skills_missing": missing_skills,
        "apply_url": apply_url,
        "official_portal_url": official_portal_url,
        "match_reason": match_reason
    }
