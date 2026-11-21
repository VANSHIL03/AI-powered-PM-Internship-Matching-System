import random
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import (
    User, StudentProfile, CompanyProfile, Internship, SystemSetting, AuditLog
)
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    existing_admin = db.query(User).filter(User.email == "admin@manthan.gov.in").first()
    if existing_admin:
        print("Database already contains seed data. Skipping re-seed.")
        db.close()
        return

    print("Seeding database with realistic demonstration dataset...")

    # 1. Admin User
    admin_user = User(
        email="admin@manthan.gov.in",
        hashed_password=hash_password("Admin@123"),
        role="admin",
        full_name="Dr. Rajeshwar Rao (National Allocation Director)",
        phone="+91-11-2338-0001",
        is_active=True
    )
    db.add(admin_user)
    db.commit()

    # 2. System Settings (Default matching weights & reservation rules)
    weights_setting = SystemSetting(
        key="matching_weights",
        value_json={
            "skills": 40.0,
            "preferences": 20.0,
            "location": 15.0,
            "education": 10.0,
            "experience": 10.0,
            "other": 5.0
        }
    )
    db.add(weights_setting)

    quota_setting = SystemSetting(
        key="reservation_rules",
        value_json={
            "enforce_quotas": True,
            "allow_unfilled_spillover": True,
            "illustrative_quota_targets": {
                "GEN": 40.0,
                "OBC_NCL": 27.0,
                "SC": 15.0,
                "ST": 7.5,
                "EWS": 10.0,
                "PWD": 3.0
            },
            "disclaimer": "Sample reservation quotas and category seat reservations are purely illustrative for technical demonstration of constraint-aware optimization in Manthan Kriti 2026."
        }
    )
    db.add(quota_setting)
    db.commit()

    # 3. 10 Companies
    companies_data = [
        {
            "name": "Tata Consultancy Services",
            "email": "hr@tcs.example.com",
            "sector": "Information Technology",
            "hq": "Bengaluru",
            "website": "https://www.tcs.com",
            "contact": "Kavita Nair",
            "desc": "Leading global IT services, consulting, and business solutions organization."
        },
        {
            "name": "Infosys BPM & AI Labs",
            "email": "careers@infosys.example.com",
            "sector": "Information Technology",
            "hq": "Pune",
            "website": "https://www.infosys.com",
            "contact": "Rohan Deshmukh",
            "desc": "Global digital services and next-generation innovation hub."
        },
        {
            "name": "Reliance New Energy",
            "email": "internships@reliance-energy.example.com",
            "sector": "Green Energy",
            "hq": "Mumbai",
            "website": "https://www.ril.com",
            "contact": "Siddharth Ambani",
            "desc": "Pioneering renewable energy, solar gigafactories, and green hydrogen technology."
        },
        {
            "name": "Larsen & Toubro Smart Infra",
            "email": "talent@lntinfra.example.com",
            "sector": "Manufacturing & Infrastructure",
            "hq": "Chennai",
            "website": "https://www.larsentoubro.com",
            "contact": "M. S. Sundaram",
            "desc": "Multinational conglomerate focused on EPC projects, smart infrastructure, and manufacturing."
        },
        {
            "name": "HDFC Bank Digital Labs",
            "email": "fintech@hdfcbank.example.com",
            "sector": "Banking & FinTech",
            "hq": "Mumbai",
            "website": "https://www.hdfcbank.com",
            "contact": "Anjali Merchant",
            "desc": "India's premier financial institution scaling next-generation cloud banking platforms."
        },
        {
            "name": "Sun Pharma Biosystems",
            "email": "research@sunpharma.example.com",
            "sector": "Healthcare & Pharma",
            "hq": "Hyderabad",
            "website": "https://www.sunpharma.com",
            "contact": "Dr. Vivek Chawla",
            "desc": "Specialty pharmaceuticals and computational drug design research."
        },
        {
            "name": "Adani Green Energy",
            "email": "hr@adanigreen.example.com",
            "sector": "Green Energy",
            "hq": "Ahmedabad",
            "website": "https://www.adanigreenenergy.com",
            "contact": "Nilesh Pandya",
            "desc": "One of the largest renewable energy enterprises in India."
        },
        {
            "name": "Mahindra & Mahindra EV",
            "email": "careers@mahindraev.example.com",
            "sector": "Automotive & Electric Vehicles",
            "hq": "Pune",
            "website": "https://www.mahindra.com",
            "contact": "Sameer Joshi",
            "desc": "Smart mobility, electric powertrains, and autonomous driving telemetry."
        },
        {
            "name": "Wipro Cloud & Cyber",
            "email": "campus@wipro.example.com",
            "sector": "Cybersecurity & Cloud",
            "hq": "Hyderabad",
            "website": "https://www.wipro.com",
            "contact": "Pooja Hegde",
            "desc": "Enterprise cloud security, zero-trust infrastructure, and cyber resilience."
        },
        {
            "name": "NITI Aayog Innovation Mission",
            "email": "fellowship@niti.gov.in",
            "sector": "Public Policy & Gov-Tech",
            "hq": "New Delhi",
            "website": "https://niti.gov.in",
            "contact": "Anoop Verma",
            "desc": "Premier public policy think tank driving India's digital transformation initiatives."
        }
    ]

    company_profiles = []
    for comp in companies_data:
        comp_user = User(
            email=comp["email"],
            hashed_password=hash_password("Company@123"),
            role="company",
            full_name=f"{comp['name']} HR Lead",
            phone="+91-98200-11223",
            is_active=True
        )
        db.add(comp_user)
        db.flush()

        c_prof = CompanyProfile(
            user_id=comp_user.id,
            company_name=comp["name"],
            industry_sector=comp["sector"],
            description=comp["desc"],
            website=comp["website"],
            contact_person=comp["contact"],
            contact_email=comp["email"],
            hq_location=comp["hq"],
            is_verified=True
        )
        db.add(c_prof)
        db.flush()
        company_profiles.append(c_prof)

    db.commit()

    # 4. 30 Internships (3 per company)
    internships_pool = [
        # TCS (idx 0)
        {
            "comp_idx": 0,
            "title": "Full Stack Cloud Platform Intern",
            "sector": "Information Technology",
            "location": "Bengaluru",
            "is_remote": False,
            "duration": 6,
            "stipend": 20000,
            "seats": 3,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "MCA"],
            "req_skills": ["Python", "React", "PostgreSQL"],
            "pref_skills": ["Docker", "AWS", "Git"],
            "reservations": {"GEN": 1, "OBC_NCL": 1, "SC": 1}
        },
        {
            "comp_idx": 0,
            "title": "AI & Natural Language Processing Intern",
            "sector": "Information Technology",
            "location": "Bengaluru",
            "is_remote": True,
            "duration": 6,
            "stipend": 25000,
            "seats": 2,
            "min_cgpa": 7.5,
            "req_degrees": ["B.Tech / B.E.", "M.Tech", "MCA"],
            "req_skills": ["Python", "PyTorch", "Machine Learning"],
            "pref_skills": ["Transformers", "FastAPI", "NLP"],
            "reservations": {"GEN": 1, "EWS": 1}
        },
        {
            "comp_idx": 0,
            "title": "Enterprise DevOps & Infrastructure Intern",
            "sector": "Information Technology",
            "location": "Bengaluru",
            "is_remote": False,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E.", "BCA"],
            "req_skills": ["Linux", "Docker", "Python"],
            "pref_skills": ["Kubernetes", "CI/CD", "Terraform"],
            "reservations": {"GEN": 1, "ST": 1}
        },

        # Infosys (idx 1)
        {
            "comp_idx": 1,
            "title": "Data Science & Predictive Analytics Intern",
            "sector": "Information Technology",
            "location": "Pune",
            "is_remote": False,
            "duration": 6,
            "stipend": 20000,
            "seats": 3,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "B.Sc Data Science", "MCA"],
            "req_skills": ["Python", "SQL", "Pandas"],
            "pref_skills": ["Scikit-learn", "Tableau", "Power BI"],
            "reservations": {"GEN": 1, "OBC_NCL": 1, "PWD": 1}
        },
        {
            "comp_idx": 1,
            "title": "Front-End Experience & Design Intern",
            "sector": "Information Technology",
            "location": "Pune",
            "is_remote": True,
            "duration": 6,
            "stipend": 18000,
            "seats": 2,
            "min_cgpa": 6.5,
            "req_degrees": ["B.Tech / B.E.", "BCA", "B.Des"],
            "req_skills": ["React", "JavaScript", "CSS"],
            "pref_skills": ["Tailwind CSS", "Figma", "TypeScript"],
            "reservations": {"GEN": 1, "SC": 1}
        },
        {
            "comp_idx": 1,
            "title": "Java Microservices Backend Intern",
            "sector": "Information Technology",
            "location": "Pune",
            "is_remote": False,
            "duration": 6,
            "stipend": 21000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "MCA"],
            "req_skills": ["Java", "Spring Boot", "SQL"],
            "pref_skills": ["REST APIs", "Kafka", "PostgreSQL"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },

        # Reliance New Energy (idx 2)
        {
            "comp_idx": 2,
            "title": "Renewable Energy Grid Simulation Intern",
            "sector": "Green Energy",
            "location": "Mumbai",
            "is_remote": False,
            "duration": 6,
            "stipend": 24000,
            "seats": 2,
            "min_cgpa": 7.2,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["MATLAB", "Python", "Data Analysis"],
            "pref_skills": ["Power Systems", "Solar Simulation", "Simulink"],
            "reservations": {"GEN": 1, "ST": 1}
        },
        {
            "comp_idx": 2,
            "title": "Battery Analytics & Energy Storage Intern",
            "sector": "Green Energy",
            "location": "Mumbai",
            "is_remote": False,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Python", "IoT", "Data Analytics"],
            "pref_skills": ["Machine Learning", "Chemical Sensing", "C++"],
            "reservations": {"GEN": 1, "EWS": 1}
        },
        {
            "comp_idx": 2,
            "title": "Green Hydrogen Process Technology Intern",
            "sector": "Green Energy",
            "location": "Mumbai",
            "is_remote": True,
            "duration": 6,
            "stipend": 20000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Process Simulation", "Python", "Thermodynamics"],
            "pref_skills": ["Excel Modelling", "AutoCAD"],
            "reservations": {"GEN": 1, "SC": 1}
        },

        # Larsen & Toubro (idx 3)
        {
            "comp_idx": 3,
            "title": "Smart Cities IoT & Sensor Telemetry Intern",
            "sector": "Manufacturing & Infrastructure",
            "location": "Chennai",
            "is_remote": False,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["IoT", "C++", "Python"],
            "pref_skills": ["Microcontrollers", "MQTT", "Embedded C"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 3,
            "title": "Structural Health AI & CAD Automation Intern",
            "sector": "Manufacturing & Infrastructure",
            "location": "Chennai",
            "is_remote": False,
            "duration": 6,
            "stipend": 19000,
            "seats": 2,
            "min_cgpa": 6.5,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["AutoCAD", "Python", "Structural Analysis"],
            "pref_skills": ["Computer Vision", "Revit", "GIS"],
            "reservations": {"GEN": 1, "SC": 1}
        },
        {
            "comp_idx": 3,
            "title": "Industrial Automation & Robotics Trainee",
            "sector": "Manufacturing & Infrastructure",
            "location": "Chennai",
            "is_remote": False,
            "duration": 6,
            "stipend": 21000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Robotics", "PLC", "Python"],
            "pref_skills": ["ROS", "C++", "Motion Planning"],
            "reservations": {"GEN": 1, "EWS": 1}
        },

        # HDFC Bank (idx 4)
        {
            "comp_idx": 4,
            "title": "FinTech Fraud Detection & Risk Analytics Intern",
            "sector": "Banking & FinTech",
            "location": "Mumbai",
            "is_remote": True,
            "duration": 6,
            "stipend": 28000,
            "seats": 2,
            "min_cgpa": 7.5,
            "req_degrees": ["B.Tech / B.E.", "MBA", "MCA"],
            "req_skills": ["Python", "SQL", "Machine Learning"],
            "pref_skills": ["Anomaly Detection", "Risk Models", "Statistics"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 4,
            "title": "Cloud Core Banking Security Intern",
            "sector": "Banking & FinTech",
            "location": "Mumbai",
            "is_remote": False,
            "duration": 6,
            "stipend": 25000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "MCA"],
            "req_skills": ["Cybersecurity", "Network Security", "Linux"],
            "pref_skills": ["Cryptography", "AWS Security", "Audit"],
            "reservations": {"GEN": 1, "PWD": 1}
        },
        {
            "comp_idx": 4,
            "title": "Digital Payment Systems Developer Intern",
            "sector": "Banking & FinTech",
            "location": "Mumbai",
            "is_remote": False,
            "duration": 6,
            "stipend": 26000,
            "seats": 2,
            "min_cgpa": 7.2,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Java", "REST APIs", "SQL"],
            "pref_skills": ["UPI Protocol", "Kafka", "Redis"],
            "reservations": {"GEN": 1, "ST": 1}
        },

        # Sun Pharma (idx 5)
        {
            "comp_idx": 5,
            "title": "Bioinformatics & Genomic Analytics Intern",
            "sector": "Healthcare & Pharma",
            "location": "Hyderabad",
            "is_remote": True,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "B.Sc", "M.Tech"],
            "req_skills": ["Python", "Bioinformatics", "Data Analysis"],
            "pref_skills": ["R", "Biopython", "Molecular Docking"],
            "reservations": {"GEN": 1, "SC": 1}
        },
        {
            "comp_idx": 5,
            "title": "Clinical Trial Data Management Intern",
            "sector": "Healthcare & Pharma",
            "location": "Hyderabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 18000,
            "seats": 2,
            "min_cgpa": 6.5,
            "req_degrees": ["B.Tech / B.E.", "B.Sc", "B.Com"],
            "req_skills": ["SQL", "Excel", "Data Validation"],
            "pref_skills": ["Python", "SAS", "Regulatory Standards"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 5,
            "title": "Pharma Supply Chain Optimization Intern",
            "sector": "Healthcare & Pharma",
            "location": "Hyderabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 19000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E.", "MBA"],
            "req_skills": ["Operations Research", "Python", "Logistics"],
            "pref_skills": ["OR-Tools", "Linear Programming", "Tableau"],
            "reservations": {"GEN": 1, "EWS": 1}
        },

        # Adani Green Energy (idx 6)
        {
            "comp_idx": 6,
            "title": "Solar Photovoltaic Performance Intern",
            "sector": "Green Energy",
            "location": "Ahmedabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 21000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["MATLAB", "Solar Simulation", "Python"],
            "pref_skills": ["PVsyst", "SCADA", "IoT"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 6,
            "title": "Wind Farm SCADA & Analytics Intern",
            "sector": "Green Energy",
            "location": "Ahmedabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Python", "Time Series", "SQL"],
            "pref_skills": ["Machine Learning", "SCADA", "Sensors"],
            "reservations": {"GEN": 1, "SC": 1}
        },
        {
            "comp_idx": 6,
            "title": "Clean Energy Carbon Accounting Intern",
            "sector": "Green Energy",
            "location": "Ahmedabad",
            "is_remote": True,
            "duration": 6,
            "stipend": 17000,
            "seats": 2,
            "min_cgpa": 6.5,
            "req_degrees": ["B.Tech / B.E.", "B.Com", "MBA"],
            "req_skills": ["ESG Metrics", "Excel", "Data Analysis"],
            "pref_skills": ["Python", "GHG Protocols", "Reporting"],
            "reservations": {"GEN": 1, "ST": 1}
        },

        # Mahindra & Mahindra EV (idx 7)
        {
            "comp_idx": 7,
            "title": "EV Battery Management System (BMS) Firmware Intern",
            "sector": "Automotive & Electric Vehicles",
            "location": "Pune",
            "is_remote": False,
            "duration": 6,
            "stipend": 25000,
            "seats": 2,
            "min_cgpa": 7.2,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Embedded C", "Microcontrollers", "CAN Protocol"],
            "pref_skills": ["MATLAB", "Stateflow", "Battery Chemistries"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 7,
            "title": "Connected Vehicle Telemetry & Cloud Intern",
            "sector": "Automotive & Electric Vehicles",
            "location": "Pune",
            "is_remote": True,
            "duration": 6,
            "stipend": 23000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "MCA"],
            "req_skills": ["Python", "MQTT", "AWS IoT"],
            "pref_skills": ["Docker", "FastAPI", "React"],
            "reservations": {"GEN": 1, "EWS": 1}
        },
        {
            "comp_idx": 7,
            "title": "Autonomous Driving Perception Intern",
            "sector": "Automotive & Electric Vehicles",
            "location": "Pune",
            "is_remote": False,
            "duration": 6,
            "stipend": 27000,
            "seats": 2,
            "min_cgpa": 7.5,
            "req_degrees": ["B.Tech / B.E.", "M.Tech"],
            "req_skills": ["Computer Vision", "Python", "PyTorch"],
            "pref_skills": ["OpenCV", "ROS", "LiDAR Processing"],
            "reservations": {"GEN": 1, "SC": 1}
        },

        # Wipro (idx 8)
        {
            "comp_idx": 8,
            "title": "Cloud Security Operations & Threat Hunting Intern",
            "sector": "Cybersecurity & Cloud",
            "location": "Hyderabad",
            "is_remote": True,
            "duration": 6,
            "stipend": 21000,
            "seats": 2,
            "min_cgpa": 6.8,
            "req_degrees": ["B.Tech / B.E.", "BCA", "MCA"],
            "req_skills": ["Cybersecurity", "Networking", "Linux"],
            "pref_skills": ["Wireshark", "Splunk", "Python"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 8,
            "title": "Identity & Access Governance (IAM) Intern",
            "sector": "Cybersecurity & Cloud",
            "location": "Hyderabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 19000,
            "seats": 2,
            "min_cgpa": 6.5,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Active Directory", "Python", "OAuth2"],
            "pref_skills": ["LDAP", "Azure AD", "Security Audit"],
            "reservations": {"GEN": 1, "PWD": 1}
        },
        {
            "comp_idx": 8,
            "title": "Kubernetes & Multi-Cloud Networking Intern",
            "sector": "Cybersecurity & Cloud",
            "location": "Hyderabad",
            "is_remote": False,
            "duration": 6,
            "stipend": 23000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E."],
            "req_skills": ["Kubernetes", "Docker", "Linux"],
            "pref_skills": ["Terraform", "Go", "Helm"],
            "reservations": {"GEN": 1, "ST": 1}
        },

        # NITI Aayog (idx 9)
        {
            "comp_idx": 9,
            "title": "Gov-Tech Digital Infrastructure Fellow",
            "sector": "Public Policy & Gov-Tech",
            "location": "New Delhi",
            "is_remote": False,
            "duration": 6,
            "stipend": 25000,
            "seats": 2,
            "min_cgpa": 7.5,
            "req_degrees": ["B.Tech / B.E.", "MCA", "MBA"],
            "req_skills": ["Python", "SQL", "Public Policy Analysis"],
            "pref_skills": ["Data Visualization", "Open APIs", "Dashboarding"],
            "reservations": {"GEN": 1, "SC": 1}
        },
        {
            "comp_idx": 9,
            "title": "National AI Strategy & Evaluation Intern",
            "sector": "Public Policy & Gov-Tech",
            "location": "New Delhi",
            "is_remote": True,
            "duration": 6,
            "stipend": 25000,
            "seats": 2,
            "min_cgpa": 7.5,
            "req_degrees": ["B.Tech / B.E.", "M.Tech"],
            "req_skills": ["AI Governance", "Python", "Research Analysis"],
            "pref_skills": ["Machine Learning", "Documentation", "Ethics"],
            "reservations": {"GEN": 1, "OBC_NCL": 1}
        },
        {
            "comp_idx": 9,
            "title": "Direct Benefit Transfer (DBT) Data Analyst Intern",
            "sector": "Public Policy & Gov-Tech",
            "location": "New Delhi",
            "is_remote": False,
            "duration": 6,
            "stipend": 22000,
            "seats": 2,
            "min_cgpa": 7.0,
            "req_degrees": ["B.Tech / B.E.", "B.Sc Data Science", "B.Com"],
            "req_skills": ["SQL", "Python", "Statistical Modeling"],
            "pref_skills": ["Power BI", "Data Cleaning", "Tableau"],
            "reservations": {"GEN": 1, "EWS": 1}
        }
    ]

    for item in internships_pool:
        comp_profile = company_profiles[item["comp_idx"]]
        internship = Internship(
            company_id=comp_profile.id,
            title=item["title"],
            sector=item["sector"],
            description=f"Prestigious 6-month hands-on industry internship in {item['sector']} working on real-world national projects.",
            location=item["location"],
            is_remote=item["is_remote"],
            duration_months=item["duration"],
            stipend_amount=item["stipend"],
            seats_total=item["seats"],
            seats_allocated=0,
            min_cgpa=item["min_cgpa"],
            required_degree=item["req_degrees"],
            required_skills=item["req_skills"],
            preferred_skills=item["pref_skills"],
            category_reservations=item["reservations"],
            status="OPEN"
        )
        db.add(internship)

    db.commit()

    # 5. 100 Students
    first_names = [
        "Arjun", "Priya", "Rohit", "Ananya", "Vikram", "Sneha", "Mohammed", "Kavya", "Rahul", "Deepa",
        "Tanvi", "Aman", "Sunita", "Rajesh", "Pooja", "Gaurav", "Divya", "Suresh", "Meera", "Aditya",
        "Neha", "Kunal", "Ritu", "Harish", "Shreya", "Naveen", "Swati", "Abhishek", "Aishwarya", "Manish",
        "Kiran", "Nikhil", "Simran", "Varun", "Pallavi", "Sachin", "Bhavna", "Vishal", "Isha", "Manoj",
        "Rani", "Pradeep", "Alka", "Deepak", "Archana", "Ashok", "Sangeeta", "Dinesh", "Komal", "Ramesh",
        "Preeti", "Sanjay", "Suman", "Vikas", "Sunil", "Anita", "Tarun", "Shweta", "Anil", "Geeta"
    ]
    last_names = [
        "Sharma", "Patel", "Verma", "Iyer", "Singh", "Das", "Zaid", "Reddy", "Meena", "Nair",
        "Joshi", "Gupta", "Murmu", "Kumar", "Choudhary", "Bose", "Rao", "Mishra", "Deshmukh", "Chauhan",
        "Banerjee", "Pillai", "Yadav", "Pandey", "Bhatia", "Aggarwal", "Sengupta", "Thakur", "Goswami", "Kaur"
    ]

    categories = ["GEN"] * 40 + ["OBC_NCL"] * 28 + ["SC"] * 15 + ["ST"] * 8 + ["EWS"] * 6 + ["PWD"] * 3
    random.seed(42)  # Deterministic seed for reproducible testing
    random.shuffle(categories)

    degrees = ["B.Tech / B.E."] * 65 + ["MCA"] * 15 + ["BCA"] * 8 + ["B.Sc Data Science"] * 7 + ["M.Tech"] * 5
    fields = [
        "Computer Science", "Information Technology", "Electronics & Communication",
        "Data Science & AI", "Mechanical Engineering", "Electrical Engineering"
    ]
    cities_states = [
        ("New Delhi", "Delhi"), ("Bengaluru", "Karnataka"), ("Mumbai", "Maharashtra"),
        ("Pune", "Maharashtra"), ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"),
        ("Ahmedabad", "Gujarat"), ("Jaipur", "Rajasthan"), ("Lucknow", "Uttar Pradesh"),
        ("Kolkata", "West Bengal"), ("Chandigarh", "Punjab"), ("Bhopal", "Madhya Pradesh")
    ]
    sectors_pool = [
        "Information Technology", "Green Energy", "Banking & FinTech",
        "Healthcare & Pharma", "Manufacturing & Infrastructure", "Automotive & Electric Vehicles",
        "Cybersecurity & Cloud", "Public Policy & Gov-Tech"
    ]
    skills_pool = [
        ("Python", "Advanced"), ("React", "Intermediate"), ("SQL", "Advanced"), ("Java", "Intermediate"),
        ("Machine Learning", "Intermediate"), ("Docker", "Beginner"), ("PostgreSQL", "Intermediate"),
        ("C++", "Intermediate"), ("PyTorch", "Beginner"), ("Linux", "Advanced"), ("MATLAB", "Intermediate"),
        ("IoT", "Intermediate"), ("AutoCAD", "Intermediate"), ("Tableau", "Beginner"), ("FastAPI", "Intermediate"),
        ("Cybersecurity", "Intermediate"), ("Spring Boot", "Intermediate"), ("Kubernetes", "Beginner"),
        ("Bioinformatics", "Intermediate"), ("Robotics", "Intermediate")
    ]

    # Pre-select student #1 as the primary demo login
    primary_student = {
        "full_name": "Arjun Sharma",
        "email": "arjun.sharma@example.com",
        "category": "GEN",
        "gender": "Male",
        "city": "Bengaluru",
        "state": "Karnataka",
        "degree": "B.Tech / B.E.",
        "field": "Computer Science",
        "cgpa": 8.85,
        "skills": [
            {"name": "Python", "level": "Expert"},
            {"name": "React", "level": "Advanced"},
            {"name": "SQL", "level": "Advanced"},
            {"name": "PostgreSQL", "level": "Advanced"},
            {"name": "Docker", "level": "Intermediate"},
            {"name": "FastAPI", "level": "Advanced"},
            {"name": "Machine Learning", "level": "Intermediate"}
        ],
        "sectors": ["Information Technology", "Banking & FinTech", "Green Energy"],
        "locations": ["Bengaluru", "Remote", "Pune"],
        "work_mode": "Any",
        "exp": 6,
        "projects": 4,
        "bio": "Aspiring Cloud and AI Software Engineer passionate about national public digital infrastructure."
    }

    students_to_create = [primary_student]

    for idx in range(1, 100):
        fn = first_names[idx % len(first_names)]
        ln = last_names[idx % len(last_names)]
        full_name = f"{fn} {ln}"
        email = f"{fn.lower()}.{ln.lower()}{idx}@example.com"
        cat = categories[idx]
        deg = random.choice(degrees)
        fld = random.choice(fields)
        c_tuple = random.choice(cities_states)
        cgpa = round(random.uniform(6.2, 9.6), 2)
        
        # Pick 3-6 random skills with proficiency
        sample_skills = random.sample(skills_pool, k=random.randint(3, 6))
        student_skills = [{"name": s[0], "level": s[1]} for s in sample_skills]
        
        # Pick 1-3 preferred sectors
        pref_s = random.sample(sectors_pool, k=random.randint(1, 3))
        # Pick 1-3 preferred locations
        pref_l = [c_tuple[0]] + random.sample(["Bengaluru", "Mumbai", "Delhi", "Remote", "Pune", "Hyderabad"], k=random.randint(1, 2))
        pref_l = list(set(pref_l))

        students_to_create.append({
            "full_name": full_name,
            "email": email,
            "category": cat,
            "gender": random.choice(["Male", "Female", "Female", "Male"]),
            "city": c_tuple[0],
            "state": c_tuple[1],
            "degree": deg,
            "field": fld,
            "cgpa": cgpa,
            "skills": student_skills,
            "sectors": pref_s,
            "locations": pref_l,
            "work_mode": random.choice(["Any", "Onsite", "Remote", "Hybrid"]),
            "exp": random.choice([0, 0, 3, 6, 12]),
            "projects": random.randint(1, 5),
            "bio": f"Passionate final-year student looking to contribute to {pref_s[0]} during PM Internship 2026."
        })

    for i, s_data in enumerate(students_to_create):
        s_user = User(
            email=s_data["email"],
            hashed_password=hash_password("Student@123"),
            role="student",
            full_name=s_data["full_name"],
            phone=f"+91-98{random.randint(10000000, 99999999)}",
            is_active=True
        )
        db.add(s_user)
        db.flush()

        s_prof = StudentProfile(
            user_id=s_user.id,
            registration_number=f"PMIS-2026-{1001 + i}",
            category=s_data["category"],
            gender=s_data["gender"],
            dob="2003-05-15",
            state=s_data["state"],
            city=s_data["city"],
            preferred_locations=s_data["locations"],
            preferred_sectors=s_data["sectors"],
            work_mode_preference=s_data["work_mode"],
            degree=s_data["degree"],
            field_of_study=s_data["field"],
            cgpa_percentage=s_data["cgpa"],
            graduation_year=2026,
            skills=s_data["skills"],
            experience_months=s_data["exp"],
            projects_count=s_data["projects"],
            bio=s_data["bio"],
            resume_filename=f"{s_data['full_name'].replace(' ', '_')}_Resume.pdf",
            allocation_status="UNALLOCATED"
        )
        db.add(s_prof)

    db.commit()

    # Log audit entry
    log_admin = AuditLog(
        action="DATABASE_INITIALIZED",
        performed_by_email="system@manthan.gov.in",
        performed_by_role="system",
        details_json={
            "students_seeded": 100,
            "companies_seeded": 10,
            "internships_seeded": 30,
            "total_vacancies": sum(item["seats"] for item in internships_pool),
            "status": "ready"
        }
    )
    db.add(log_admin)
    db.commit()
    db.close()
    print("Database seeding completed successfully: 100 students, 10 companies, 30 internships created.")

if __name__ == "__main__":
    seed_database()
