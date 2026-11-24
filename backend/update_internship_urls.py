import sqlite3

def update_db():
    conn = sqlite3.connect('pm_internship.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(internships)")
    cols = [r[1] for r in cursor.fetchall()]
    print("Existing columns in internships:", len(cols))

    if 'apply_url' not in cols:
        cursor.execute("ALTER TABLE internships ADD COLUMN apply_url VARCHAR(500)")
        print("Added apply_url column.")

    if 'official_portal_url' not in cols:
        cursor.execute("ALTER TABLE internships ADD COLUMN official_portal_url VARCHAR(500) DEFAULT 'https://pminternship.mca.gov.in/'")
        print("Added official_portal_url column.")

    # Mapping of company names or sectors to verified real portals
    company_urls = {
        "Tata Consultancy Services": {
            "apply_url": "https://www.tcs.com/careers/india",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Infosys BPM & AI Labs": {
            "apply_url": "https://www.infosys.com/careers/graduates-internships.html",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Reliance New Energy": {
            "apply_url": "https://reliancecareers.com",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Larsen & Toubro Smart Infra": {
            "apply_url": "https://www.larsentoubro.com/corporate/careers/",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "HDFC Bank Digital Labs": {
            "apply_url": "https://www.hdfcbank.com/personal/about-us/careers",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Sun Pharma Biosystems": {
            "apply_url": "https://sunpharma.com/careers/",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Adani Green Energy": {
            "apply_url": "https://www.adanigreenenergy.com/careers",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Mahindra & Mahindra EV": {
            "apply_url": "https://www.mahindra.com/careers",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "Wipro Technologies": {
            "apply_url": "https://careers.wipro.com/",
            "portal": "https://pminternship.mca.gov.in/"
        },
        "National Informatics Centre": {
            "apply_url": "https://www.nic.in/recruitment/",
            "portal": "https://pminternship.mca.gov.in/"
        }
    }

    cursor.execute("""
        SELECT i.id, c.company_name 
        FROM internships i 
        JOIN company_profiles c ON i.company_id = c.id
    """)
    rows = cursor.fetchall()

    for intern_id, comp_name in rows:
        cfg = company_urls.get(comp_name, {
            "apply_url": "https://pminternship.mca.gov.in/",
            "portal": "https://pminternship.mca.gov.in/"
        })
        cursor.execute(
            "UPDATE internships SET apply_url = ?, official_portal_url = ? WHERE id = ?",
            (cfg["apply_url"], cfg["portal"], intern_id)
        )

    conn.commit()
    print(f"Updated {len(rows)} internships with verified official application URLs.")
    conn.close()

if __name__ == "__main__":
    update_db()
