"""
Flask Backend for Animal Conservation Risk Prediction
Connects your trained ML models from Jupyter to a React frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import logging
from typing import Dict, Any, Optional
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Global variables for models
models = None
rf_model = None
scaler = None
le_target = None
le_dict = None


def load_models():
    """
    Load trained models from pickle file
    
    Place your animal_conservation_models.pkl in the same directory as this file
    
    You can save models from Jupyter using:
    joblib.dump(model_artifacts, 'animal_conservation_models.pkl')
    """
    global models, rf_model, scaler, le_target, le_dict
    
    try:
        model_path = 'animal_conservation_models.pkl'
        
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found at {model_path}")
            logger.warning("Using mock models for demonstration")
            return False
        
        models = joblib.load(model_path)
        rf_model = models['rf_model']
        scaler = models['scaler']
        le_target = models['le_target']
        le_dict = models['le_dict']
        
        logger.info("Models loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load models: {str(e)}")
        return False


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Animal Conservation Risk Prediction API',
        'version': '1.0.0',
        'models_loaded': rf_model is not None
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict conservation risk for an animal
    
    Expected JSON payload:
    {
        "population_size": float,
        "life_span": float,
        "top_speed": float,
        "weight": float,
        "height": float,
        "length": float,
        "class_category": str (Mammalia or Other),
        "diet_type": str (Herbivore, Carnivore, or Omnivore),
        "size_category": str (Tiny, Small, Medium, or Large),
        "population_risk": str (Critical Population, Low Population, Moderate Population, Stable Population)
    }
    
    Returns:
    {
        "risk_category": str,
        "confidence": float (0-1),
        "probabilities": dict
    }
    """
    try:
        if rf_model is None:
            return jsonify({
                'error': 'Models not loaded. Please ensure animal_conservation_models.pkl exists.'
            }), 500
        
        data = request.json
        
        # Validate required fields
        required_fields = [
            'population_size', 'life_span', 'top_speed', 'weight', 'height', 'length',
            'class_category', 'diet_type', 'size_category', 'population_risk'
        ]
        
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Extract and validate numeric features
        try:
            numeric_features = [
                float(data['population_size']),
                float(data['life_span']),
                float(data['top_speed']),
                float(data['weight']),
                float(data['height']),
                float(data['length'])
            ]
        except ValueError as e:
            return jsonify({
                'error': f'Invalid numeric values: {str(e)}'
            }), 400
        
        # Encode categorical features
        try:
            class_encoded = le_dict['Class_Category'].transform([data['class_category']])[0]
            diet_encoded = le_dict['Diet_Type'].transform([data['diet_type']])[0]
            size_encoded = le_dict['Size_Category'].transform([data['size_category']])[0]
            pop_risk_encoded = le_dict['Population_Risk'].transform([data['population_risk']])[0]
        except ValueError as e:
            return jsonify({
                'error': f'Invalid categorical values: {str(e)}. '
                         f'Valid categories: '
                         f'class_category=[Mammalia, Other], '
                         f'diet_type=[Herbivore, Carnivore, Omnivore], '
                         f'size_category=[Tiny, Small, Medium, Large], '
                         f'population_risk=[Critical Population, Low Population, Moderate Population, Stable Population]'
            }), 400
        
        # Create feature vector
        features = np.array([[
            *numeric_features,
            class_encoded,
            diet_encoded,
            size_encoded,
            pop_risk_encoded
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = rf_model.predict(features_scaled)[0]
        prediction_label = le_target.inverse_transform([prediction])[0]
        
        # Get probabilities
        probabilities = rf_model.predict_proba(features_scaled)[0]
        confidence = float(max(probabilities))
        prob_dict = {
            label: float(prob)
            for label, prob in zip(le_target.classes_, probabilities)
        }
        
        return jsonify({
            'success': True,
            'risk_category': prediction_label,
            'confidence': confidence,
            'probabilities': prob_dict
        }), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500


@app.route('/api/animals', methods=['GET'])
def get_animals():
    """
    Get sample animals for demonstration
    
    Returns:
    List of animals with their characteristics
    """
    try:
        # Sample animals from the dataset
        sample_animals = [
            {
                'name': 'Tiger',
                'population_size': 2656.5,
                'life_span': 12.5,
                'top_speed': 96,
                'weight': 185.5,
                'height': 1.0,
                'length': 2.95,
                'class_category': 'Mammalia',
                'diet_type': 'Carnivore',
                'size_category': 'Medium',
                'population_risk': 'Low Population',
                'actual_status': 'Endangered'
            },
            {
                'name': 'Koala',
                'population_size': 300000,
                'life_span': 15,
                'top_speed': 10,
                'weight': 9.5,
                'height': 0.725,
                'length': 0.65,
                'class_category': 'Mammalia',
                'diet_type': 'Herbivore',
                'size_category': 'Tiny',
                'population_risk': 'Moderate Population',
                'actual_status': 'Vulnerable'
            },
            {
                'name': 'Grey Wolf',
                'population_size': 400000,
                'life_span': 15,
                'top_speed': 75,
                'weight': 38,
                'height': 0.825,
                'length': 1.325,
                'class_category': 'Mammalia',
                'diet_type': 'Carnivore',
                'size_category': 'Small',
                'population_risk': 'Stable Population',
                'actual_status': 'Least Concern'
            },
            {
                'name': 'Blue Whale',
                'population_size': 17500,
                'life_span': 85,
                'top_speed': 20,
                'weight': 130000,
                'height': 0.0,
                'length': 27.5,
                'class_category': 'Mammalia',
                'diet_type': 'Carnivore',
                'size_category': 'Large',
                'population_risk': 'Low Population',
                'actual_status': 'Endangered'
            },
            {
                'name': 'Leopard',
                'population_size': 500000,
                'life_span': 15,
                'top_speed': 58,
                'weight': 59,
                'height': 0.635,
                'length': 1.4,
                'class_category': 'Mammalia',
                'diet_type': 'Carnivore',
                'size_category': 'Medium',
                'population_risk': 'Moderate Population',
                'actual_status': 'Vulnerable'
            },
            {
                'name': 'Giant Panda',
                'population_size': 1800,
                'life_span': 25,
                'top_speed': 32,
                'weight': 115,
                'height': 0.75,
                'length': 1.55,
                'class_category': 'Mammalia',
                'diet_type': 'Herbivore',
                'size_category': 'Medium',
                'population_risk': 'Low Population',
                'actual_status': 'Vulnerable'
            },
            {
                'name': 'Red Fox',
                'population_size': 3000000,
                'life_span': 10,
                'top_speed': 50,
                'weight': 8.5,
                'height': 0.425,
                'length': 0.675,
                'class_category': 'Mammalia',
                'diet_type': 'Omnivore',
                'size_category': 'Tiny',
                'population_risk': 'Stable Population',
                'actual_status': 'Least Concern'
            },
            {
                'name': 'Snow Leopard',
                'population_size': 3048,
                'life_span': 18,
                'top_speed': 88,
                'weight': 41,
                'height': 0.6,
                'length': 1.125,
                'class_category': 'Mammalia',
                'diet_type': 'Carnivore',
                'size_category': 'Small',
                'population_risk': 'Low Population',
                'actual_status': 'Endangered'
            }
        ]
        
        return jsonify({
            'success': True,
            'count': len(sample_animals),
            'animals': sample_animals
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching animals: {str(e)}")
        return jsonify({
            'error': f'Failed to fetch animals: {str(e)}'
        }), 500


@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    """
    Make predictions for multiple animals at once
    
    Expected JSON payload:
    {
        "animals": [
            { animal data 1 },
            { animal data 2 },
            ...
        ]
    }
    
    Returns:
    {
        "results": [
            { prediction result 1 },
            { prediction result 2 },
            ...
        ]
    }
    """
    try:
        if rf_model is None:
            return jsonify({
                'error': 'Models not loaded'
            }), 500
        
        data = request.json
        
        if 'animals' not in data or not isinstance(data['animals'], list):
            return jsonify({
                'error': 'Expected "animals" field containing a list of animal data'
            }), 400
        
        results = []
        
        for animal_data in data['animals']:
            try:
                # Extract features
                numeric_features = [
                    float(animal_data['population_size']),
                    float(animal_data['life_span']),
                    float(animal_data['top_speed']),
                    float(animal_data['weight']),
                    float(animal_data['height']),
                    float(animal_data['length'])
                ]
                
                # Encode categorical features
                class_encoded = le_dict['Class_Category'].transform([animal_data['class_category']])[0]
                diet_encoded = le_dict['Diet_Type'].transform([animal_data['diet_type']])[0]
                size_encoded = le_dict['Size_Category'].transform([animal_data['size_category']])[0]
                pop_risk_encoded = le_dict['Population_Risk'].transform([animal_data['population_risk']])[0]
                
                # Create feature vector
                features = np.array([[
                    *numeric_features,
                    class_encoded,
                    diet_encoded,
                    size_encoded,
                    pop_risk_encoded
                ]])
                
                # Scale and predict
                features_scaled = scaler.transform(features)
                prediction = rf_model.predict(features_scaled)[0]
                prediction_label = le_target.inverse_transform([prediction])[0]
                probabilities = rf_model.predict_proba(features_scaled)[0]
                
                results.append({
                    'animal': animal_data.get('name', 'Unknown'),
                    'risk_category': prediction_label,
                    'confidence': float(max(probabilities)),
                    'success': True
                })
                
            except Exception as e:
                results.append({
                    'animal': animal_data.get('name', 'Unknown'),
                    'error': str(e),
                    'success': False
                })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'error': f'Batch prediction failed: {str(e)}'
        }), 500


@app.route('/api/info', methods=['GET'])
def get_info():
    """Get information about the API and available options"""
    return jsonify({
        'service': 'Animal Conservation Risk Prediction API',
        'version': '1.0.0',
        'endpoints': {
            'POST /api/predict': 'Make a single prediction',
            'POST /api/batch-predict': 'Make batch predictions',
            'GET /api/animals': 'Get sample animals',
            'GET /api/info': 'Get API information'
        },
        'valid_categories': {
            'class_category': ['Mammalia', 'Other'],
            'diet_type': ['Herbivore', 'Carnivore', 'Omnivore'],
            'size_category': ['Tiny', 'Small', 'Medium', 'Large'],
            'population_risk': ['Critical Population', 'Low Population', 'Moderate Population', 'Stable Population']
        },
        'models_loaded': rf_model is not None
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found. Try GET /api/info for available endpoints.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Load models on startup
    models_loaded = load_models()
    
    if not models_loaded:
        logger.warning("Starting without models - prediction will fail")
        logger.warning("Make sure you've run: joblib.dump(model_artifacts, 'animal_conservation_models.pkl')")
    
    # Run Flask app
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )