from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..auth import require_admin_or_account, require_admin

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

@router.post("/", response_model=schemas.ExpenseOut)
def create_expense(data: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user=Depends(require_admin_or_account)):
    expense = models.Expense(**data.model_dump(), created_by=current_user.id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/", response_model=List[schemas.ExpenseOut])
def list_expenses(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    query = db.query(models.Expense)
    if year:
        from sqlalchemy import extract
        query = query.filter(extract('year', models.Expense.expense_date) == year)
    if month:
        from sqlalchemy import extract
        query = query.filter(extract('month', models.Expense.expense_date) == month)
    return query.order_by(models.Expense.expense_date.desc()).all()

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}
