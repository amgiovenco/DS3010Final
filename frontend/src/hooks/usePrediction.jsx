import { useState, useCallback } from 'react';

/**
 * Custom hook for making conservation risk predictions
 * Connects to Flask backend running ML models
 * 
 * Usage:
 * const { predict, loading, error, result } = usePrediction();
 * 
 * const result = await predict({
 *   population_size: 50000,
 *   life_span: 15,
 *   top_speed: 80,
 *   weight: 150,
 *   height: 1.5,
 *   length: 2,
 *   class_category: 'Mammalia',
 *   diet_type: 'Carnivore',
 *   size_category: 'Medium',
 *   population_risk: 'Low Population'
 * });
 */
export const usePrediction = (apiUrl = 'http://localhost:5000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const predict = useCallback(async (animalData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate input
      if (!animalData || typeof animalData !== 'object') {
        throw new Error('Invalid animal data');
      }

      // Make API call
      const response = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(animalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error('Prediction error:', err);
      return null;
    }
  }, [apiUrl]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { predict, loading, error, result, reset };
};

/**
 * Hook for batch predictions
 */
export const useBatchPrediction = (apiUrl = 'http://localhost:5000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const predictBatch = useCallback(async (animalDataArray) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      if (!Array.isArray(animalDataArray)) {
        throw new Error('Input must be an array of animal data objects');
      }

      const predictions = [];

      for (const animalData of animalDataArray) {
        try {
          const response = await fetch(`${apiUrl}/api/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(animalData),
          });

          if (!response.ok) {
            throw new Error(`Prediction failed for animal`);
          }

          const data = await response.json();
          predictions.push({
            ...animalData,
            prediction: data
          });
        } catch (err) {
          predictions.push({
            ...animalData,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      setResults(predictions);
      setLoading(false);
      return predictions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [apiUrl]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResults([]);
  }, []);

  return { predictBatch, loading, error, results, reset };
};

/**
 * Hook for fetching sample animals from backend
 */
export const useFetchAnimals = (apiUrl = 'http://localhost:5000') => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/animals`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnimals(data);
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [apiUrl]);

  return { animals, loading, error, fetchAnimals };
};