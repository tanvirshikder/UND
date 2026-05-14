"""Run this once to create the initial admin user"""
import sys
sys.path.append(".")
from app.database import SessionLocal, engine
from app import models
from app.auth import hash_password

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create default settings
if not db.query(models.Settings).first():
    db.add(models.Settings(monthly_amount=1000.0, yearly_amount=10000.0))
    db.commit()
    print("Default settings created.")

# Create admin user
if not db.query(models.User).filter(models.User.email == "admin@und.com").first():
    admin = models.User(
        full_name="UND Admin",
        email="admin@und.com",
        hashed_password=hash_password("admin123"),
        role=models.RoleEnum.admin
    )
    db.add(admin)
    db.commit()
    print("Admin user created: admin@und.com / admin123")
else:
    print("Admin already exists.")

db.close()
