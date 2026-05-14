from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import require_admin_or_account

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/", response_model=schemas.SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=schemas.SettingsOut)
def update_settings(data: schemas.SettingsUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin_or_account)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
    if data.monthly_amount is not None:
        settings.monthly_amount = data.monthly_amount
    if data.yearly_amount is not None:
        settings.yearly_amount = data.yearly_amount
    settings.updated_by = current_user.id
    db.commit()
    db.refresh(settings)
    return settings
