from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.database import get_db
from ..models.models import User, Prediction, HistoricalData
from ..schemas.schemas import PredictionRequest, PredictionResponse, HistoricalDataResponse
from ..routers.auth import get_current_user
from ..services.ml_service import ml_service
from ..services.data_service import data_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    prediction_request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new load shedding prediction"""
    try:
        # Get additional data from external services
        weather_data = await data_service.get_weather_data(prediction_request.location)
        grid_data = await data_service.get_grid_status()
        historical_data = await data_service.get_historical_averages(
            prediction_request.location, 
            prediction_request.date_time.hour
        )
        
        # Prepare data for ML prediction
        ml_input = {
            "location": prediction_request.location,
            "date_time": prediction_request.date_time.isoformat(),
            "temperature": prediction_request.temperature or weather_data.get("temperature", 25.0),
            "humidity": prediction_request.humidity or weather_data.get("humidity", 60.0),
            "wind_speed": prediction_request.wind_speed or weather_data.get("wind_speed", 10.0),
            "demand_forecast": prediction_request.demand_forecast or grid_data.get("demand", 30000),
            "generation_capacity": prediction_request.generation_capacity or grid_data.get("generation", 28000),
            "historical_avg": prediction_request.historical_avg or historical_data.get("historical_stage", 1.5),
        }
        
        # Get ML prediction
        prediction_result = ml_service.predict_loadshedding(ml_input)
        
        # Create database record
        db_prediction = Prediction(
            user_id=current_user.id,
            location=prediction_request.location,
            date_time=prediction_request.date_time,
            temperature=ml_input["temperature"],
            humidity=ml_input["humidity"],
            wind_speed=ml_input["wind_speed"],
            demand_forecast=ml_input["demand_forecast"],
            generation_capacity=ml_input["generation_capacity"],
            historical_avg=ml_input["historical_avg"],
            predicted_stage=prediction_result["predicted_stage"],
            confidence_score=prediction_result["confidence_score"],
            model_used=prediction_result["model_used"]
        )
        
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/", response_model=List[PredictionResponse])
async def get_user_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=10, le=100),
    offset: int = Query(default=0, ge=0)
):
    """Get user's prediction history"""
    predictions = db.query(Prediction)\
        .filter(Prediction.user_id == current_user.id)\
        .order_by(Prediction.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return predictions


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific prediction"""
    prediction = db.query(Prediction)\
        .filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id)\
        .first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    return prediction


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a prediction"""
    prediction = db.query(Prediction)\
        .filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id)\
        .first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    db.delete(prediction)
    db.commit()
    

@router.get("/historical/data", response_model=List[HistoricalDataResponse])
async def get_historical_data(
    location: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(default=100, le=1000),
    db: Session = Depends(get_db)
):
    """Get historical load shedding data"""
    query = db.query(HistoricalData)
    
    if location:
        query = query.filter(HistoricalData.location.ilike(f"%{location}%"))
    
    if start_date:
        query = query.filter(HistoricalData.date_time >= start_date)
    
    if end_date:
        query = query.filter(HistoricalData.date_time <= end_date)
    
    historical_data = query.order_by(HistoricalData.date_time.desc())\
        .limit(limit)\
        .all()
    
    return historical_data


@router.post("/batch", response_model=List[PredictionResponse])
async def create_batch_predictions(
    predictions: List[PredictionRequest],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create multiple predictions at once (max 10)"""
    if len(predictions) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 predictions allowed per batch"
        )
    
    results = []
    
    for pred_request in predictions:
        try:
            # Get additional data
            weather_data = await data_service.get_weather_data(pred_request.location)
            grid_data = await data_service.get_grid_status()
            historical_data = await data_service.get_historical_averages(
                pred_request.location, 
                pred_request.date_time.hour
            )
            
            # Prepare ML input
            ml_input = {
                "location": pred_request.location,
                "date_time": pred_request.date_time.isoformat(),
                "temperature": pred_request.temperature or weather_data.get("temperature", 25.0),
                "humidity": pred_request.humidity or weather_data.get("humidity", 60.0),
                "wind_speed": pred_request.wind_speed or weather_data.get("wind_speed", 10.0),
                "demand_forecast": pred_request.demand_forecast or grid_data.get("demand", 30000),
                "generation_capacity": pred_request.generation_capacity or grid_data.get("generation", 28000),
                "historical_avg": pred_request.historical_avg or historical_data.get("historical_stage", 1.5),
            }
            
            # Get prediction
            prediction_result = ml_service.predict_loadshedding(ml_input)
            
            # Create database record
            db_prediction = Prediction(
                user_id=current_user.id,
                location=pred_request.location,
                date_time=pred_request.date_time,
                temperature=ml_input["temperature"],
                humidity=ml_input["humidity"],
                wind_speed=ml_input["wind_speed"],
                demand_forecast=ml_input["demand_forecast"],
                generation_capacity=ml_input["generation_capacity"],
                historical_avg=ml_input["historical_avg"],
                predicted_stage=prediction_result["predicted_stage"],
                confidence_score=prediction_result["confidence_score"],
                model_used=prediction_result["model_used"]
            )
            
            db.add(db_prediction)
            results.append(db_prediction)
            
        except Exception as e:
            # Continue with other predictions even if one fails
            print(f"Batch prediction error: {e}")
            continue
    
    if results:
        db.commit()
        # Refresh all objects
        for result in results:
            db.refresh(result)
    
    return results