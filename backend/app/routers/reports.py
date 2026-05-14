from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import Optional
from ..database import get_db
from .. import models
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/deposits")
def deposit_report(
    user_id: Optional[int] = None,
    year: Optional[int] = None,
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

    deposits = query.order_by(models.Deposit.deposit_date).all()
    settings = db.query(models.Settings).first()
    monthly_amt = settings.monthly_amount if settings else 1000.0
    yearly_amt = settings.yearly_amount if settings else 10000.0
    yearly_target = (monthly_amt * 12) + yearly_amt

    result = []
    for d in deposits:
        result.append({
            "id": d.id,
            "user_id": d.user_id,
            "user_name": d.user.full_name if d.user else "",
            "deposit_type": d.deposit_type,
            "amount": d.amount,
            "deposit_date": str(d.deposit_date),
            "year": d.year,
            "month": d.month,
            "note": d.note
        })

    total = sum(d["amount"] for d in result)
    return {"deposits": result, "total": total, "yearly_target": yearly_target}

@router.get("/expenses-summary")
def expense_summary(year: Optional[int] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    query = db.query(models.Expense)
    if year:
        query = query.filter(extract('year', models.Expense.expense_date) == year)
    expenses = query.order_by(models.Expense.expense_date).all()
    total = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        cat = e.category or "General"
        by_category[cat] = by_category.get(cat, 0) + e.amount
    return {
        "expenses": [{"id": e.id, "title": e.title, "amount": e.amount, "expense_date": str(e.expense_date), "category": e.category, "note": e.note} for e in expenses],
        "total": total,
        "by_category": by_category
    }

@router.get("/member-summary")
def member_summary(year: Optional[int] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    from datetime import date
    yr = year or date.today().year
    settings = db.query(models.Settings).first()
    monthly_amt = settings.monthly_amount if settings else 1000.0
    yearly_amt = settings.yearly_amount if settings else 10000.0
    yearly_target = (monthly_amt * 12) + yearly_amt

    members = db.query(models.User).filter(models.User.role == models.RoleEnum.member, models.User.is_active == True).all()
    result = []
    for m in members:
        total = db.query(func.sum(models.Deposit.amount)).filter(
            models.Deposit.user_id == m.id, models.Deposit.year == yr
        ).scalar() or 0.0
        result.append({
            "user_id": m.id,
            "full_name": m.full_name,
            "email": m.email,
            "total_paid": total,
            "yearly_target": yearly_target,
            "due": max(0.0, yearly_target - total)
        })
    return {"year": yr, "members": result, "yearly_target": yearly_target}
