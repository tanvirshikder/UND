from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from .models import RoleEnum, DepositTypeEnum


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# User
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: RoleEnum = RoleEnum.member

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[RoleEnum] = None

class PasswordReset(BaseModel):
    new_password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role: RoleEnum
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


# Settings
class SettingsUpdate(BaseModel):
    monthly_amount: Optional[float] = None
    yearly_amount: Optional[float] = None

class SettingsOut(BaseModel):
    id: int
    monthly_amount: float
    yearly_amount: float
    updated_at: datetime
    class Config:
        from_attributes = True


# Deposit
class DepositCreate(BaseModel):
    user_id: int
    deposit_type: DepositTypeEnum
    amount: float
    deposit_date: date
    year: int
    month: Optional[int] = None
    note: Optional[str] = None

class DepositOut(BaseModel):
    id: int
    user_id: int
    deposit_type: DepositTypeEnum
    amount: float
    deposit_date: date
    year: int
    month: Optional[int]
    note: Optional[str]
    created_at: datetime
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True


# Expense
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    expense_date: date
    category: Optional[str] = None
    note: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    expense_date: date
    category: Optional[str]
    note: Optional[str]
    created_at: datetime
    creator: Optional[UserOut] = None
    class Config:
        from_attributes = True


# Dashboard
class MemberDashboard(BaseModel):
    total_paid: float
    paid_this_month: float
    yearly_target: float
    total_paid_this_year: float
    due_this_year: float
    monthly_amount: float
    yearly_amount: float
    current_year: int

class AdminDashboard(BaseModel):
    total_members: int
    total_deposits: float
    total_expenses: float
    net_balance: float
    this_month_collection: float
    this_year_collection: float
