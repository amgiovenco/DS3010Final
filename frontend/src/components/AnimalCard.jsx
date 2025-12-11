import React, { useState } from 'react';
import { usePrediction } from '../hooks/usePrediction';

const AnimalCard = ({ animal, onPredict }) => {
  const { predict, loading } = usePrediction();
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async () => {
    const result = await predict({
      population_size: animal.population_size,
      life_span: animal.life_span,
      top_speed: animal.top_speed,
      weight: animal.weight,
      height: animal.height,
      length: animal.length,
      class_category: animal.class_category,
      diet_type: animal.diet_type,
      size_category: animal.size_category,
      population_risk: animal.population_risk
    });

    if (result) {
      setPrediction(result);
      setShowPrediction(true);
      
      if (onPredict) {
        onPredict({
          animalName: animal.name,
          riskCategory: result.risk_category,
          confidence: result.confidence,
          populationRisk: animal.population_risk,
          timestamp: new Date().toLocaleString()
        });
      }
    }
  };

  const getRiskColor = (category) => {
    if (!category) return '#6b7280';
    if (category.includes('High')) return '#dc2626';
    if (category.includes('Medium')) return '#f97316';
    if (category.includes('Low')) return '#22c55e';
    return '#6b7280';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    }}
    >
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
          {animal.name}
        </h3>
        {animal.actual_status && (
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            <strong>Current Status:</strong> {animal.actual_status}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '15px' }}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            <strong>Population:</strong> {animal.population_size.toLocaleString()}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            <strong>Weight:</strong> {animal.weight} kg
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            <strong>Life Span:</strong> {animal.life_span} years
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            <strong>Diet:</strong> {animal.diet_type}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            <strong>Size:</strong> {animal.size_category}
          </p>
        </div>

        {/* Prediction Button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Predicting...' : '🎯 Predict Risk'}
        </button>
      </div>

      {/* Prediction Result */}
      {showPrediction && prediction && (
        <div style={{
          padding: '15px',
          backgroundColor: getRiskColor(prediction.risk_category),
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>
            {prediction.risk_category}
          </p>
          <p style={{ margin: 0, fontSize: '12px' }}>
            Confidence: {(prediction.confidence * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimalCard;