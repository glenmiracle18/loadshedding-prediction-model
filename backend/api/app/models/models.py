from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with predictions
    predictions = relationship("Prediction", back_populates="user")


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input features
    location = Column(String, nullable=False)
    date_time = Column(DateTime, nullable=False)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    demand_forecast = Column(Float)
    generation_capacity = Column(Float)
    historical_avg = Column(Float)
    
    # Prediction results
    predicted_stage = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=False)
    model_used = Column(String, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user = relationship("User", back_populates="predictions")


class HistoricalData(Base):
    __tablename__ = "historical_data"
    
    id = Column(Integer, primary_key=True, index=True)
    date_time = Column(DateTime, nullable=False, index=True)
    location = Column(String, nullable=False, index=True)
    
    # Weather data
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    
    # Grid data
    demand = Column(Float)
    generation = Column(Float)
    available_capacity = Column(Float)
    
    # Load shedding data
    actual_stage = Column(Integer, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CostCalculation(Base):
    __tablename__ = "cost_calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input parameters
    location = Column(String, nullable=False)
    household_size = Column(Integer, nullable=False)
    monthly_consumption = Column(Float, nullable=False)  # kWh
    backup_solution = Column(String)  # generator, ups, solar, etc.
    
    # Calculated costs
    backup_cost = Column(Float, nullable=False)
    fuel_cost_monthly = Column(Float)
    equipment_cost = Column(Float)
    maintenance_cost_yearly = Column(Float)
    total_yearly_cost = Column(Float, nullable=False)
    
    # Savings analysis
    potential_savings = Column(Float)
    payback_period_months = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user = relationship("User")