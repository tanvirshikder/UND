from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_admin_or_account

router = APIRouter(prefix="/api/deposits", tags=["deposits"])

@router.post("/", response_model=schemas.DepositOut)
def create_deposit(data: schemas.DepositCreate, db: Session = Depends(get_db), current_user=Depends(require_admin_or_account)):
    deposit = models.Deposit(**data.model_dump(), created_by=current_user.id)
    db.add(deposit)
    db.commit()
    db.refresh(deposit)
    return deposit

@router.get("/", response_model=List[schemas.DepositOut])
def list_deposits(
    user_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    deposit_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Deposit)
    if current_user.role == models.RoleEnum.member:
        query = query.filter(models.Deposit.user_id == current_user.id)
    elif user_id:
        query = query.filter(models.Deposit.user_id == user_id)
    if year:
        query = query.filter(models.Deposit.year == year)
    if month:
        query = query.filter(models.Deposit.month == month)
    if deposit_type:
        query = query.filter(models.Deposit.deposit_type == deposit_type)
    return query.order_by(models.Deposit.deposit_date.desc()).all()

@router.delete("/{deposit_id}")
def delete_deposit(deposit_id: int, db: Session = Depends(get_db), _=Depends(require_admin_or_account)):
    deposit = db.query(models.Deposit).filter(models.Deposit.id == deposit_id).first()
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    db.delete(deposit)
    db.commit()
    return {"message": "Deleted"}
