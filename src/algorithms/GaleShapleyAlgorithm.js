import BaseAlgorithm from './BaseAlgorithm';

class GaleShapleyAlgorithm extends BaseAlgorithm {
  calculateAllocation() {
    this.validateInput();
    
    const allocation = { };
    const freeAgents = Array.from({ length: this.agents }, (_, i) => i + 1);
    const houseProposals = {};
    
    // Initialize house proposals
    for (let i = 1;i <= this.houses; i++) {
      houseProposals[i] = null;
    }
    
    // Continue until all agents are allocated
    while (freeAgents.length > 0) {
      const currentAgent = freeAgents[0];
      const agentPreferences = this.preferences[currentAgent];
      
      // Find the highest-ranked house that currentAgent hasn't proposed to yet
      let nextHouseToPropose = null;
      for (let rank = 1; rank <= Object.keys(agentPreferences).length; rank++) {
        const house = agentPreferences[rank];
        if (!allocation[currentAgent] && !houseProposals[house]) {
          nextHouseToPropose = house;
          break;
        }
      }
      
      if (!nextHouseToPropose) {
        // Agent has proposed to all houses and got rejected
        freeAgents.shift();
        continue;
      }
      
      // If house is free, allocate it
      if (!houseProposals[nextHouseToPropose]) {
        houseProposals[nextHouseToPropose] = currentAgent;
        allocation[currentAgent] = nextHouseToPropose;
        freeAgents.shift();
      } else {
        // House is already allocated, check if current agent is preferred
        const currentOccupant = houseProposals[nextHouseToPropose];
        const currentOccupantRank = this.getHousePreferenceRank(nextHouseToPropose, currentOccupant);
        const newAgentRank = this.getHousePreferenceRank(nextHouseToPropose, currentAgent);
        
        if (newAgentRank < currentOccupantRank) {
          // Current agent is preferred, swap allocation
          houseProposals[nextHouseToPropose] = currentAgent;
          allocation[currentAgent] = nextHouseToPropose;
          delete allocation[currentOccupant];
          freeAgents.shift();
          freeAgents.push(currentOccupant);
        } else {
          // Current occupant is preferred, move to next preference
          freeAgents.shift();
          freeAgents.push(currentAgent);
        }
      }
    }
    
    return allocation;
  }
  
  // Helper method to get the rank of an agent in a house's preference list
  getHousePreferenceRank(house, agent) {
    // In this implementation, we assume houses prefer agents with lower IDs
    // You can modify this to implement different house preferences
    return agent;
  }
}

export default GaleShapleyAlgorithm; 