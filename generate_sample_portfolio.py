import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf(output_paths):
    doc_margin = 36  # 0.5 inch margins
    
    for path in output_paths:
        doc = SimpleDocTemplate(
            path,
            pagesize=letter,
            leftMargin=doc_margin,
            rightMargin=doc_margin,
            topMargin=doc_margin,
            bottomMargin=doc_margin
        )
        
        styles = getSampleStyleSheet()
        
        # Color palette
        PRIMARY = colors.HexColor("#0F2A4A")     # Deep Executive Navy
        ACCENT = colors.HexColor("#2563EB")      # Vibrant Blue
        TEXT_DARK = colors.HexColor("#1E293B")   # Slate 800
        TEXT_MUTED = colors.HexColor("#64748B")  # Slate 500
        LINE_COLOR = colors.HexColor("#CBD5E1")  # Slate 300
        BG_PILL = colors.HexColor("#F1F5F9")     # Slate 100
        
        # Custom Typography Styles
        name_style = ParagraphStyle(
            'CandidateName',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=PRIMARY,
            spaceAfter=2
        )
        
        title_style = ParagraphStyle(
            'CandidateTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=ACCENT,
            spaceAfter=4
        )
        
        contact_style = ParagraphStyle(
            'ContactInfo',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=TEXT_MUTED,
            spaceAfter=6
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=PRIMARY,
            spaceBefore=8,
            spaceAfter=3,
            textTransform='uppercase'
        )
        
        item_title = ParagraphStyle(
            'ItemTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=12,
            textColor=TEXT_DARK
        )
        
        item_subtitle = ParagraphStyle(
            'ItemSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=11,
            textColor=TEXT_MUTED
        )
        
        body_text = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11.5,
            textColor=TEXT_DARK
        )
        
        bullet_text = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11.5,
            textColor=TEXT_DARK,
            leftIndent=12,
            firstLineIndent=-8,
            spaceAfter=2
        )
        
        story = []
        
        # ================= HEADER =================
        story.append(Paragraph("VANSHIL GUPTA", name_style))
        story.append(Paragraph("B.Tech Computer Science & Engineering &bull; Full-Stack Cloud & AI Aspirant", title_style))
        story.append(Paragraph(
            "Registration No: <b>PMIS-2026-8842</b> &nbsp;|&nbsp; "
            "Email: <b>vanshil.gupta@example.edu</b> &nbsp;|&nbsp; "
            "Mobile: <b>+91-98765-43210</b> &nbsp;|&nbsp; "
            "Location: <b>Bengaluru, Karnataka</b><br/>"
            "Portfolio: <b>github.com/VANSHIL03</b> &nbsp;|&nbsp; "
            "LinkedIn: <b>linkedin.com/in/vanshil-gupta</b> &nbsp;|&nbsp; "
            "Scheme Track: <b>National PM Internship Scheme 2026</b>",
            contact_style
        ))
        
        story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=2, spaceAfter=6))
        
        # ================= PROFILE SUMMARY =================
        story.append(Paragraph("Professional Profile & Career Objective", section_heading))
        story.append(Paragraph(
            "High-achieving 3rd-year B.Tech Computer Science undergraduate (CGPA: <b>8.72/10.0</b>) with verified expertise in Python, React, FastAPI, SQL, and Dockerized microservices. Passionate about participating in the Prime Minister's Internship Scheme to deliver impactful software engineering, cloud optimization, and data-driven solutions for premier Indian enterprises.",
            body_text
        ))
        story.append(Spacer(1, 4))
        
        # ================= ACADEMIC CREDENTIALS =================
        story.append(Paragraph("Academic Qualifications (Verified Hard Constraints)", section_heading))
        
        edu_data = [
            [
                Paragraph("<b>Degree / Qualification</b>", item_title),
                Paragraph("<b>Institution / University</b>", item_title),
                Paragraph("<b>Year</b>", item_title),
                Paragraph("<b>Score / CGPA</b>", item_title)
            ],
            [
                Paragraph("<b>B.Tech</b> Computer Science & Engineering", body_text),
                Paragraph("National Institute of Technology (NIT)", body_text),
                Paragraph("2022 &ndash; 2026", body_text),
                Paragraph("<b>8.72 / 10.0</b> (Top 5%)", body_text)
            ],
            [
                Paragraph("Higher Secondary Certificate (Class XII &ndash; CBSE)", body_text),
                Paragraph("Delhi Public School, R.K. Puram", body_text),
                Paragraph("2022", body_text),
                Paragraph("<b>94.6%</b> (PCM Stream)", body_text)
            ],
            [
                Paragraph("Secondary School Examination (Class X)", body_text),
                Paragraph("St. Xavier's High School", body_text),
                Paragraph("2020", body_text),
                Paragraph("<b>96.2%</b> (Distinction)", body_text)
            ]
        ]
        
        edu_table = Table(edu_data, colWidths=[180, 190, 70, 100])
        edu_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), BG_PILL),
            ('TEXTCOLOR', (0, 0), (-1, 0), PRIMARY),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE_COLOR),
        ]))
        story.append(edu_table)
        story.append(Spacer(1, 4))
        
        # ================= TECHNICAL COMPETENCIES =================
        story.append(Paragraph("Technical Competencies & Multi-Criteria Skills (40% Weight)", section_heading))
        skills_data = [
            [
                Paragraph("<b>Programming Languages:</b>", item_title),
                Paragraph("Python (Advanced), JavaScript / TypeScript, SQL (PostgreSQL, SQLite), C++, Java", body_text)
            ],
            [
                Paragraph("<b>Full-Stack Frameworks:</b>", item_title),
                Paragraph("React 19, FastAPI, Node.js, Express, Tailwind CSS, RESTful API Architecture", body_text)
            ],
            [
                Paragraph("<b>Cloud & DevOps:</b>", item_title),
                Paragraph("Docker, AWS (EC2, S3), Git / GitHub Actions, Linux Shell, Redis, Microservices", body_text)
            ],
            [
                Paragraph("<b>AI, ML & Analytics:</b>", item_title),
                Paragraph("Pandas, NumPy, Scikit-Learn, Google OR-Tools (Linear Programming), Recharts", body_text)
            ]
        ]
        skills_table = Table(skills_data, colWidths=[140, 400])
        skills_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(skills_table)
        story.append(Spacer(1, 4))
        
        # ================= KEY PROJECTS =================
        story.append(Paragraph("Key Engineering & Software Projects", section_heading))
        
        story.append(Paragraph("<b>1. AI-Driven Resource Allocation Clearinghouse</b> &bull; <i>Python, FastAPI, Google OR-Tools, React</i>", item_title))
        story.append(Paragraph("&bull; Formulated high-dimensional Mixed-Integer Linear Programming (MILP) solver balancing candidate skills, location proximity, and category quotas for 1,000+ simulated allocations.", bullet_text))
        story.append(Paragraph("&bull; Guaranteed mathematical zero duplicate placements (&sum; X<sub>s,i</sub> &le; 1) with solve execution latencies below 200 ms.", bullet_text))
        
        story.append(Paragraph("<b>2. Distributed Microservices Telemetry Dashboard</b> &bull; <i>Docker, Node.js, PostgreSQL, Tailwind</i>", item_title))
        story.append(Paragraph("&bull; Architected containerized real-time health-monitoring platform streaming socket events across 12 services with 99.9% uptime.", bullet_text))
        story.append(Paragraph("&bull; Engineered SQL query optimizations and caching strategies reducing API response latency by 38%.", bullet_text))
        
        story.append(Paragraph("<b>3. Smart Agriculture Yield Predictor</b> &bull; <i>Python, Scikit-Learn, FastAPI</i>", item_title))
        story.append(Paragraph("&bull; Built supervised regression model analyzing soil nutrient, rainfall, and temperature datasets with 91.4% prediction accuracy.", bullet_text))
        story.append(Spacer(1, 4))
        
        # ================= EXPERIENCE =================
        story.append(Paragraph("Internship Experience & Certifications", section_heading))
        story.append(Paragraph("<b>Software Engineering Intern</b> &ndash; TechVanguard Solutions, Bengaluru &bull; <i>Jun 2024 &ndash; Aug 2024 (3 Months)</i>", item_title))
        story.append(Paragraph("&bull; Developed responsive frontend components using React and streamlined 14 backend REST API endpoints with FastAPI.", bullet_text))
        story.append(Paragraph("&bull; Authored automated unit test suites with pytest achieving 88% code coverage across authentication and data pipelines.", bullet_text))
        story.append(Paragraph("<b>Certifications:</b> AWS Certified Cloud Practitioner &bull; Python Data Structures (University of Michigan / Coursera)", body_text))
        story.append(Spacer(1, 4))
        
        # ================= SCHEME PREFERENCES =================
        story.append(Paragraph("PM Internship Scheme Preferences & Affirmative Category", section_heading))
        pref_data = [
            [
                Paragraph("<b>Social Category:</b>", item_title),
                Paragraph("General (Unreserved) &bull; Aspirational District Resident: No", body_text),
                Paragraph("<b>Work Mode:</b>", item_title),
                Paragraph("Hybrid / Onsite / Remote Acceptable", body_text)
            ],
            [
                Paragraph("<b>Preferred Sectors:</b>", item_title),
                Paragraph("Information Technology, Banking & FinTech, Green Energy", body_text),
                Paragraph("<b>Preferred Cities:</b>", item_title),
                Paragraph("Bengaluru, Pune, Hyderabad, New Delhi, Remote", body_text)
            ]
        ]
        pref_table = Table(pref_data, colWidths=[110, 190, 80, 160])
        pref_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_PILL),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, LINE_COLOR),
        ]))
        story.append(pref_table)
        
        doc.build(story)
        print(f"Generated PDF successfully at: {path}")

if __name__ == "__main__":
    paths = [
        os.path.abspath("Sample_Student_Portfolio_Vanshil_Gupta.pdf"),
        os.path.abspath("frontend/public/Sample_Student_Portfolio_Vanshil_Gupta.pdf")
    ]
    generate_pdf(paths)
