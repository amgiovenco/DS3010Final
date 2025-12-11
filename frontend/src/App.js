import React, { useState, useEffect } from 'react';
import './App.css';
import PredictiveSankeyDiagram from './components/PredictiveSankeyDiagram';
import PredictionForm from './components/PredictionForm';
import AnimalCard from './components/AnimalCard';
import { usePrediction, useFetchAnimals } from './hooks/usePrediction';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentPredictions, setRecentPredictions] = useState([]);
  const { animals, loading: animalsLoading, fetchAnimals } = useFetchAnimals();

  useEffect(() => {
    // Fetch sample animals on app load
    fetchAnimals();
  }, [fetchAnimals]);

  const handlePredictionComplete = (prediction) => {
    setRecentPredictions(prev => [prediction, ...prev.slice(0, 4)]);
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Animal Conservation
          </h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: activeTab === 'dashboard' ? '#667eea' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'dashboard' ? '600' : '400'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('predict')}
              style={{
                background: activeTab === 'predict' ? '#667eea' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'predict' ? '600' : '400'
              }}
            >
              Predict
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              style={{
                background: activeTab === 'samples' ? '#667eea' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === 'samples' ? '600' : '400'
              }}
            >
              Samples
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc' }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <PredictiveSankeyDiagram />

            {/* Recent Predictions */}
            {recentPredictions.length > 0 && (
              <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                  Recent Predictions
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {recentPredictions.map((pred, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
                        {pred.animalName || 'Unknown'}
                      </h3>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        <strong>Risk:</strong> {pred.riskCategory}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        <strong>Confidence:</strong> {(pred.confidence * 100).toFixed(1)}%
                      </p>
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        Population Risk: {pred.populationRisk}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prediction Form Tab */}
        {activeTab === 'predict' && (
          <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '40px'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '30px' }}>
                Predict Conservation Risk
              </h2>
              <PredictionForm onPredictionComplete={handlePredictionComplete} />
            </div>
          </div>
        )}

        {/* Sample Animals Tab */}
        {activeTab === 'samples' && (
          <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', paddingBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '30px' }}>
              Sample Animals from Dataset
            </h2>
            
            {animalsLoading ? (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                Loading animals...
              </div>
            ) : animals.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {animals.map((animal, idx) => (
                  <AnimalCard
                    key={idx}
                    animal={animal}
                    onPredict={handlePredictionComplete}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                No animals available. Make sure the backend is running.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: '#9ca3af',
        padding: '30px 20px',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          🌍 Animal Conservation Risk Prediction using Machine Learning
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px' }}>
          Built with React, D3.js, and TensorFlow
        </p>
      </footer>
    </div>
  );
}

export default App;