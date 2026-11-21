import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from seed_data import seed_database
from routers import (
    auth, students, companies, internships, allocations, analytics
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered PM Internship Matching System",
    description="Intelligent Large-Scale Internship Allocation Platform for Manthan Kriti 2026 Hackathon",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite port 5173 / any)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for resume files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(companies.router)
app.include_router(internships.router)
app.include_router(allocations.router)
app.include_router(analytics.router)

@app.on_event("startup")
def on_startup():
    # Ensure database is seeded with realistic 100 students, 10 companies, 30 internships
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "PM Internship Allocation Engine",
        "hackathon": "Manthan Kriti 2026",
        "solver_backend": "Google OR-Tools MILP (SCIP/CBC)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
