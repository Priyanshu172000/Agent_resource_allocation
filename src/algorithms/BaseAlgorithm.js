class BaseAlgorithm {
  constructor(agents, houses, preferences) {
    this.agents = agents;
    this.houses = houses;
    this.preferences = preferences;
  }

  // Method to validate input data
  validateInput() {
    if (!this.preferences || Object.keys(this.preferences).length !== this.agents) {
      throw new Error('Invalid preferences data');
    }
    
    // Check if all agents have complete preference lists
    for (let i = 1; i <= this.agents; i++) {
      if (!this.preferences[i]) {
        throw new Error(`Missing preferences for agent ${i}`);
      }
    }
    
    return true;
  }

  // Method to calculate allocation
  calculateAllocation() {
    throw new Error('calculateAllocation method must be implemented by child class');
  }

  // Method to calculate metrics for comparison
  calculateMetrics(allocation) {
    const metrics = {
      totalPreferenceScore: 0,
      averagePreferenceScore: 0,
      minPreferenceScore: Infinity,
      maxPreferenceScore: 0,
      fairnessScore: 0
    };

    // Calculate preference scores
    for (let agent = 1; agent <= this.agents; agent++) {
      const allocatedHouse = allocation[agent];
      const preferenceList = this.preferences[agent];
      let preferenceScore = 0;

      // Find the position of allocated house in preference list
      for (let pos = 1; pos <= Object.keys(preferenceList).length; pos++) {
        if (preferenceList[pos] === allocatedHouse) {
          preferenceScore = pos;
          break;
        }
      }

      metrics.totalPreferenceScore += preferenceScore;
      metrics.minPreferenceScore = Math.min(metrics.minPreferenceScore, preferenceScore);
      metrics.maxPreferenceScore = Math.max(metrics.maxPreferenceScore, preferenceScore);
    }

    metrics.averagePreferenceScore = metrics.totalPreferenceScore / this.agents;
    
    // Calculate fairness score (lower is better)
    metrics.fairnessScore = metrics.maxPreferenceScore - metrics.minPreferenceScore;

    return metrics;
  }
}

export default BaseAlgorithm; 
