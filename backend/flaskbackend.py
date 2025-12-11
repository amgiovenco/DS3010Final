"""
Flask Backend for Animal Conservation Risk Prediction
FIXED VERSION: Works with regenerated models
Connects trained ML models to React frontend
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
models_loaded = False


def load_models():
    """
    Load trained models from pickle file
    """
    global models, rf_model, scaler, le_target, le_dict, models_loaded
    
    try:
        model_path = 'C:\\Users\\agiov\\DS3010Final\\backend\\animal_conservation_models.pkl'
        
        if not os.path.exists(model_path):
            logger.error(f"❌ Model file not found at {model_path}")
            logger.error("Make sure animal_conservation_models.pkl is in the same directory as this script")
            return False
        
        logger.info(f"Loading models from {model_path}...")
        models = joblib.load(model_path)
        
        rf_model = models.get('rf_model')
        scaler = models.get('scaler')
        le_target = models.get('le_target')
        le_dict = models.get('le_dict')
        
        if not all([rf_model, scaler, le_target, le_dict]):
            logger.error("❌ Missing required model components")
            return False
        
        models_loaded = True
        logger.info("✓ Models loaded successfully!")
        logger.info(f"✓ Target classes: {le_target.classes_}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        return False


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = 'healthy' if models_loaded else 'unhealthy'
    return jsonify({
        'status': status,
        'service': 'Animal Conservation Risk Prediction API',
        'version': '2.0.0',
        'models_loaded': models_loaded
    }), 200 if models_loaded else 503


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
        "success": true,
        "risk_category": str,
        "confidence": float (0-1),
        "probabilities": {
            "High Risk": float,
            "Low Risk": float,
            "Medium Risk": float,
            "Unknown Risk": float
        }
    }
    """
    try:
        if not models_loaded or rf_model is None:
            logger.error("Models not loaded")
            return jsonify({
                'success': False,
                'error': 'Models not loaded. Please restart the server with animal_conservation_models.pkl in the same directory.'
            }), 503
        
        data = request.json
        logger.info(f"Received prediction request for animal")
        
        # Validate required fields
        required_fields = [
            'population_size', 'life_span', 'top_speed', 'weight', 'height', 'length',
            'class_category', 'diet_type', 'size_category', 'population_risk'
        ]
        
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            logger.warning(f"Missing fields: {missing_fields}")
            return jsonify({
                'success': False,
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
        except (ValueError, TypeError) as e:
            logger.warning(f"Invalid numeric values: {e}")
            return jsonify({
                'success': False,
                'error': f'Invalid numeric values: {str(e)}'
            }), 400
        
        # Encode categorical features
        try:
            class_encoded = le_dict['Class_Category'].transform([data['class_category']])[0]
            diet_encoded = le_dict['Diet_Type'].transform([data['diet_type']])[0]
            size_encoded = le_dict['Size_Category'].transform([data['size_category']])[0]
            pop_risk_encoded = le_dict['Population_Risk'].transform([data['population_risk']])[0]
        except ValueError as e:
            logger.warning(f"Invalid categorical values: {e}")
            return jsonify({
                'success': False,
                'error': f'Invalid categorical values. Valid options: '
                         f'class_category={list(le_dict["Class_Category"].classes_)}, '
                         f'diet_type={list(le_dict["Diet_Type"].classes_)}, '
                         f'size_category={list(le_dict["Size_Category"].classes_)}, '
                         f'population_risk={list(le_dict["Population_Risk"].classes_)}'
            }), 400
        
        # Create feature vector (same order as training)
        features = np.array([[
            *numeric_features,
            class_encoded,
            diet_encoded,
            size_encoded,
            pop_risk_encoded
        ]])
        
        logger.info(f"Feature vector shape: {features.shape}")
        
        # Scale features
        features_scaled = scaler.transform(features)
        logger.info("Features scaled")
        
        # Make prediction
        prediction = rf_model.predict(features_scaled)[0]
        prediction_label = le_target.inverse_transform([prediction])[0]
        logger.info(f"Prediction: {prediction_label}")
        
        # Get probabilities
        probabilities = rf_model.predict_proba(features_scaled)[0]
        confidence = float(max(probabilities))
        prob_dict = {
            label: float(prob)
            for label, prob in zip(le_target.classes_, probabilities)
        }
        
        response = {
            'success': True,
            'risk_category': prediction_label,
            'confidence': confidence,
            'probabilities': prob_dict
        }
        
        logger.info(f"Response: {response}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
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
    """
    try:
        if not models_loaded or rf_model is None:
            return jsonify({
                'success': False,
                'error': 'Models not loaded'
            }), 503
        
        data = request.json
        
        if 'animals' not in data or not isinstance(data['animals'], list):
            return jsonify({
                'success': False,
                'error': 'Expected "animals" field containing a list of animal data'
            }), 400
        
        logger.info(f"Processing batch of {len(data['animals'])} animals")
        results = []
        
        for idx, animal_data in enumerate(data['animals']):
            try:
                numeric_features = [
                    float(animal_data['population_size']),
                    float(animal_data['life_span']),
                    float(animal_data['top_speed']),
                    float(animal_data['weight']),
                    float(animal_data['height']),
                    float(animal_data['length'])
                ]
                
                class_encoded = le_dict['Class_Category'].transform([animal_data['class_category']])[0]
                diet_encoded = le_dict['Diet_Type'].transform([animal_data['diet_type']])[0]
                size_encoded = le_dict['Size_Category'].transform([animal_data['size_category']])[0]
                pop_risk_encoded = le_dict['Population_Risk'].transform([animal_data['population_risk']])[0]
                
                features = np.array([[
                    *numeric_features,
                    class_encoded,
                    diet_encoded,
                    size_encoded,
                    pop_risk_encoded
                ]])
                
                features_scaled = scaler.transform(features)
                prediction = rf_model.predict(features_scaled)[0]
                prediction_label = le_target.inverse_transform([prediction])[0]
                probabilities = rf_model.predict_proba(features_scaled)[0]
                
                results.append({
                    'animal': animal_data.get('name', f'Animal {idx+1}'),
                    'risk_category': prediction_label,
                    'confidence': float(max(probabilities)),
                    'success': True
                })
                
            except Exception as e:
                logger.warning(f"Error predicting animal {idx+1}: {e}")
                results.append({
                    'animal': animal_data.get('name', f'Animal {idx+1}'),
                    'error': str(e),
                    'success': False
                })
        
        logger.info(f"Batch prediction complete: {len([r for r in results if r['success']])}/{len(results)} successful")
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Batch prediction error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Batch prediction failed: {str(e)}'
        }), 500


@app.route('/api/info', methods=['GET'])
def get_info():
    """Get information about the API and valid categories"""
    if not models_loaded:
        return jsonify({
            'service': 'Animal Conservation Risk Prediction API',
            'version': '2.0.0',
            'status': 'error',
            'error': 'Models not loaded'
        }), 503
    
    return jsonify({
        'service': 'Animal Conservation Risk Prediction API',
        'version': '2.0.0',
        'status': 'healthy',
        'endpoints': {
            'POST /api/predict': 'Make a single prediction',
            'POST /api/batch-predict': 'Make batch predictions',
            'GET /api/info': 'Get API information',
            'GET /': 'Health check'
        },
        'valid_categories': {
            'class_category': list(le_dict['Class_Category'].classes_),
            'diet_type': list(le_dict['Diet_Type'].classes_),
            'size_category': list(le_dict['Size_Category'].classes_),
            'population_risk': list(le_dict['Population_Risk'].classes_)
        },
        'target_classes': list(le_target.classes_),
        'models_loaded': True
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found. Try GET /api/info for available endpoints.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    logger.info("=" * 80)
    logger.info("Starting Animal Conservation Risk Prediction API")
    logger.info("=" * 80)
    
    # Load models on startup
    models_loaded = load_models()
    
    if models_loaded:
        logger.info("✓ API ready to make predictions!")
    else:
        logger.error("API starting WITHOUT models - predictions will fail")
        logger.error("Make sure animal_conservation_models.pkl is in the same directory")
    
    logger.info(f"Server starting on http://0.0.0.0:5000")
    
    # Run Flask app
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )