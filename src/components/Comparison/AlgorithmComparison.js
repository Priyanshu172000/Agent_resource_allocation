import React from 'react';
import OriginalAlgorithm from '../../algorithms/OriginalAlgorithm';
import GaleShapleyAlgorithm from '../../algorithms/GaleShapleyAlgorithm';
import './AlgorithmComparison.css';

const AlgorithmComparison = ({ agents, houses, preferences }) => {
  const runAlgorithms = () => {
    const algorithms = [
      { name: 'Original Algorithm', instance: new OriginalAlgorithm(agents, houses, preferences) },
      { name: 'Gale-Shapley Algorithm', instance: new GaleShapleyAlgorithm(agents, houses, preferences) }
    ];

    const results = algorithms.map(alg => {
      try {
        const allocation = alg.instance.calculateAllocation();
        const metrics = alg.instance.calculateMetrics(allocation);
        return {
          name: alg.name,
          allocation,
          metrics,
          error: null
        };
      } catch (error) {
        return {
          name: alg.name,
          allocation: null,
          metrics: null,
          error: error.message
        };
      }
    });

    return results;
  };

  const results = runAlgorithms();

  return (
    <div className="algorithm-comparison">
      <h2>Algorithm Comparison</h2>
      <div className="comparison-grid">
        {results.map((result, index) => (
          <div key={index} className="algorithm-result">
            <h3>{result.name}</h3>
            {result.error ? (
              <div className="error-message">{result.error}</div>
            ) : (
              <>
                <div className="allocation-details">
                  <h4>Allocation Results:</h4>
                  <ul>
                    {Object.entries(result.allocation).map(([agent, house]) => (
                      <li key={agent}>
                        Agent {agent} → House {house}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="metrics-details">
                  <h4>Performance Metrics:</h4>
                  <ul>
                    <li>Total Preference Score: {result.metrics.totalPreferenceScore}</li>
                    <li>Average Preference Score: {result.metrics.averagePreferenceScore.toFixed(2)}</li>
                    <li>Min Preference Score: {result.metrics.minPreferenceScore}</li>
                    <li>Max Preference Score: {result.metrics.maxPreferenceScore}</li>
                    <li>Fairness Score: {result.metrics.fairnessScore}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmComparison; 