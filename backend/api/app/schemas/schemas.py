from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class PredictionRequest(BaseModel):
    location: str
    datetime: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    demand_forecast: Optional[float] = None
    generation_capacity: Optional[float] = None
    historical_avg: Optional[float] = None


class PredictionResponse(BaseModel):
    id: int
    predicted_stage: int
    confidence_score: float
    model_used: str
    location: str
    datetime: datetime
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class HistoricalDataResponse(BaseModel):
    id: int
    datetime: datetime
    location: str
    temperature: Optional[float]
    humidity: Optional[float]
    wind_speed: Optional[float]
    demand: Optional[float]
    generation: Optional[float]
    available_capacity: Optional[float]
    actual_stage: int
    
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class CostCalculationRequest(BaseModel):
    location: str
    household_size: int
    monthly_consumption: float
    backup_solution: Optional[str] = None


class CostCalculationResponse(BaseModel):
    id: int
    location: str
    household_size: int
    monthly_consumption: float
    backup_solution: Optional[str]
    backup_cost: float
    fuel_cost_monthly: Optional[float]
    equipment_cost: Optional[float]
    maintenance_cost_yearly: Optional[float]
    total_yearly_cost: float
    potential_savings: Optional[float]
    payback_period_months: Optional[int]
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str
    cache: str
    ml_models: dict