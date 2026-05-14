from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from datetime import date
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/member", response_model=schemas.MemberDashboard)
def member_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    settings = db.query(models.Settings).first()
    monthly_amt = settings.monthly_amount if settings else 1000.0
    yearly_amt = settings.yearly_amount if settings else 10000.0

    yearly_target = (monthly_amt * 12) + yearly_amt

    total_paid = db.query(func.sum(models.Deposit.amount)).filter(
        models.Deposit.user_id == current_user.id
    ).scalar() or 0.0

    paid_this_month = db.query(func.sum(models.Deposit.amount)).filter(
        models.Deposit.user_id == current_user.id,
        extract('year', models.Deposit.deposit_date) == today.year,
        extract('month', models.Deposit.deposit_date) == today.month
    ).scalar() or 0.0

    total_paid_this_year = db.query(func.sum(models.Deposit.amount)).filter(
        models.Deposit.user_id == current_user.id,
        models.Deposit.year == today.year
    ).scalar() or 0.0

    due_this_year = max(0.0, yearly_target - total_paid_this_year)

    return {
        "total_paid": total_paid,
        "paid_this_month": paid_this_month,
        "yearly_target": yearly_target,
        "total_paid_this_year": total_paid_this_year,
        "due_this_year": due_this_year,
        "monthly_amount": monthly_amt,
        "yearly_amount": yearly_amt,
        "current_year": today.year
    }

@router.get("/admin", response_model=schemas.AdminDashboard)
def admin_dashboard(db: Session = Depends(get_db), _=Depends(require_admin)):
    today = date.today()

    total_members = db.query(models.User).filter(models.User.role == models.RoleEnum.member).count()
    total_deposits = db.query(func.sum(models.Deposit.amount)).scalar() or 0.0
    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0.0

    this_month_collection = db.query(func.sum(models.Deposit.amount)).filter(
        extract('year', models.Deposit.deposit_date) == today.year,
        extract('month', models.Deposit.deposit_date) == today.month
    ).scalar() or 0.0

    this_year_collection = db.query(func.sum(models.Deposit.amount)).filter(
        models.Deposit.year == today.year
    ).scalar() or 0.0

    return {
        "total_members": total_members,
        "total_deposits": total_deposits,
        "total_expenses": total_expenses,
        "net_balance": total_deposits - total_expenses,
        "this_month_collection": this_month_collection,
        "this_year_collection": this_year_collection
    }
