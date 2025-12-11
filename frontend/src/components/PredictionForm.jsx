import React, { useState } from 'react';
import { usePrediction } from '../hooks/usePrediction';

const PredictionForm = ({ onPredictionComplete }) => {
  const { predict, loading, error } = usePrediction();
  const [formData, setFormData] = useState({
    population_size: 50000,
    life_span: 15,
    top_speed: 50,
    weight: 100,
    height: 1.5,
    length: 2,
    class_category: 'Mammalia',
    diet_type: 'Carnivore',
    size_category: 'Medium',
    population_risk: 'Low Population',
    animalName: ''
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prediction = await predict({
      population_size: formData.population_size,
      life_span: formData.life_span,
      top_speed: formData.top_speed,
      weight: formData.weight,
      height: formData.height,
      length: formData.length,
      class_category: formData.class_category,
      diet_type: formData.diet_type,
      size_category: formData.size_category,
      population_risk: formData.population_risk
    });

    if (prediction) {
      setResult(prediction);
      
      // Notify parent component
      if (onPredictionComplete) {
        onPredictionComplete({
          animalName: formData.animalName || 'Unknown',
          riskCategory: prediction.risk_category,
          confidence: prediction.confidence,
          populationRisk: formData.population_risk,
          timestamp: new Date().toLocaleString()
        });
      }
    }
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'High Risk': return '#dc2626';
      case 'Medium Risk': return '#f97316';
      case 'Low Risk': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        {/* Animal Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Animal Name (optional)
          </label>
          <input
            type="text"
            name="animalName"
            placeholder="e.g., My Tiger"
            value={formData.animalName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Two column layout for numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Population Size
            </label>
            <input
              type="number"
              name="population_size"
              value={formData.population_size}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Life Span (years)
            </label>
            <input
              type="number"
              name="life_span"
              value={formData.life_span}
              onChange={handleChange}
              step="0.5"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Top Speed (km/h)
            </label>
            <input
              type="number"
              name="top_speed"
              value={formData.top_speed}
              onChange={handleChange}
              step="1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Height (m)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              step="0.1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Length (m)
            </label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              step="0.1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Categorical fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Class Category
            </label>
            <select
              name="class_category"
              value={formData.class_category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Mammalia">Mammalia</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Diet Type
            </label>
            <select
              name="diet_type"
              value={formData.diet_type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Herbivore">Herbivore</option>
              <option value="Carnivore">Carnivore</option>
              <option value="Omnivore">Omnivore</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Size Category
            </label>
            <select
              name="size_category"
              value={formData.size_category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Tiny">Tiny</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Population Risk
            </label>
            <select
              name="population_risk"
              value={formData.population_risk}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Critical Population">Critical Population</option>
              <option value="Low Population">Low Population</option>
              <option value="Moderate Population">Moderate Population</option>
              <option value="Stable Population">Stable Population</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '16px',
            opacity: loading ? 0.6 : 1,
            marginBottom: '20px'
          }}
        >
          {loading ? '🔄 Predicting...' : '🎯 Predict Risk'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f9ff',
          border: `2px solid ${getRiskColor(result.risk_category)}`,
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Prediction Result
          </h3>
          <div style={{
            padding: '15px',
            backgroundColor: getRiskColor(result.risk_category),
            color: 'white',
            borderRadius: '6px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {result.risk_category}
            </div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </div>
          </div>

          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Probability Distribution:
          </h4>
          {Object.entries(result.probabilities).map(([category, prob]) => (
            <div key={category} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>{category}</span>
                <span style={{ fontWeight: '600', color: '#667eea' }}>
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: prob * 100 + '%',
                  height: '100%',
                  backgroundColor: '#667eea',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionForm;