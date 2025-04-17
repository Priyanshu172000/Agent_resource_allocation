import BaseAlgorithm from './BaseAlgorithm';

class OriginalAlgorithm extends BaseAlgorithm {
  calculateAllocation() {
    this.validateInput();
    
    const allocation = {};
    const freeAgents = Array.from({ length: this.agents }, (_, i) => i + 1);
    const houseAllocated = {};
    const agentPreferenceIndex = {};
    
    // Initialize preference indices
    for (let i = 1; i <= this.agents; i++) {
      agentPreferenceIndex[i] = 1;
    }
    
    // Continue until all agents are allocated or have exhausted preferences
    while (freeAgents.length > 0) {
      const currentAgent = freeAgents[0];
      
      // If agent has exhausted all preferences
      if (agentPreferenceIndex[currentAgent] > Object.keys(this.preferences[currentAgent]).length) {
        freeAgents.shift();
        continue;
      }
      
      // Get current house preference of the agent
      const preferredHouse = this.preferences[currentAgent][agentPreferenceIndex[currentAgent]];
      
      // If house is free, allocate it
      if (!houseAllocated[preferredHouse]) {
        houseAllocated[preferredHouse] = currentAgent;
        allocation[currentAgent] = preferredHouse;
        freeAgents.shift();
      } else {
        // House is already allocated, move to next preference
        agentPreferenceIndex[currentAgent]++;
      }
    }
    
    return allocation;
  }
}

export default OriginalAlgorithm; 