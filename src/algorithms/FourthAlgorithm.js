import BaseAlgorithm from './BaseAlgorithm';

class FourthAlgorithm extends BaseAlgorithm {
  calculateAllocation() {
    this.validateInput();
    
    const allocation = {};

    class Graph {
      constructor(numAgents, numHouses) {
          this.numAgents = numAgents;
          this.numHouses = numHouses;
          this.adj = Array.from({ length: numAgents + 1 }, () => []);
      }
  }
  
  let matchH2 = []; // Global variable for house matchings
  
  function bfs(matchA, matchH, dist, graph) {
      let queue = [];
      for (let a = 1; a <= graph.numAgents; a++) {
          if (matchA[a] === 0) {
              dist[a] = 0;
              queue.push(a);
          } else {
              dist[a] = Infinity;
          }
      }
      dist[0] = Infinity;
  
      while (queue.length > 0) {
          let a = queue.shift();
          if (dist[a] < dist[0]) {
              for (let h of graph.adj[a]) {
                  if (dist[matchH[h]] === Infinity) {
                      dist[matchH[h]] = dist[a] + 1;
                      queue.push(matchH[h]);
                  }
              }
          }
      }
      return dist[0] !== Infinity;
  }
  
  function dfs(a, matchA, matchH, dist, graph) {
      if (a !== 0) {
          for (let h of graph.adj[a]) {
              if (dist[matchH[h]] === dist[a] + 1) {
                  if (dfs(matchH[h], matchA, matchH, dist, graph)) {
                      matchH[h] = a;
                      matchA[a] = h;
                      return true;
                  }
              }
          }
          dist[a] = Infinity;
          return false;
      }
      return true;
  }
  
  function hopcroftKarp(graph, matchA, matchH) {
      matchA.length = graph.numAgents + 1;
      matchH.length = graph.numHouses + 1;
      matchA.fill(0);
      matchH.fill(0);
      const dist = Array(graph.numAgents + 1).fill(0);
  
      let matchingSize = 0;
      while (bfs(matchA, matchH, dist, graph)) {
          for (let a = 1; a <= graph.numAgents; a++) {
              if (matchA[a] === 0 && dfs(a, matchA, matchH, dist, graph)) {
                  matchingSize++;
              }
          }
      }
      return [matchingSize, matchA.slice()];
  }
  
  function makeCoalitionFree(matchA, matchH, graph) {
      let ptr = Array(graph.numAgents + 1).fill(0);
      let improved;
  
      do {
          improved = false;
          let visitedAgent = Array(graph.numAgents + 1).fill(false);
          let visitedHouse = Array(graph.numHouses + 1).fill(false);
  
          for (let a = 1; a <= graph.numAgents; ++a) {
              if (matchA[a] === 0 || visitedAgent[a]) continue;
  
              let cycleAgents = [];
              let cycleHouses = [];
              let currentAgent = a;
  
              while (true) {
                  if (visitedAgent[currentAgent]) break;
                  visitedAgent[currentAgent] = true;
  
                  let nextHouse = -1;
                  while (ptr[currentAgent] > graph.adj[currentAgent].length) {
                      nextHouse = graph.adj[currentAgent][ptr[currentAgent]++];
                      if (nextHouse !== matchA[currentAgent] && !visitedHouse[nextHouse]) break;
                  }
                  if (nextHouse === -1) break;
  
                  cycleAgents.push(currentAgent);
                  cycleHouses.push(nextHouse);
                  visitedHouse[nextHouse] = true;
  
                  currentAgent = matchH[nextHouse];
                  if (currentAgent === 0) break;
              }
  
              if (cycleAgents.length > 1) {
                  improved = true;
                  for (let agent of cycleAgents) {
                      if (matchA[agent] !== 0) {
                          matchH[matchA[agent]] = 0;
                      }
                  }
                  for (let i = 0; i < cycleAgents.length; i++) {
                      let agent = cycleAgents[i];
                      let house = cycleHouses[i];
                      matchA[agent] = house;
                      matchH[house] = agent;
                  }
              }
          }
      } while (improved);
  }
  
  function leastDissatisfaction(graph, maxMatchingSize) {
      let left = 1, right = graph.numHouses, result = right;
      let ans = [0, []];
  
      while (left <= right) {
          let mid = Math.floor((left + right) / 2);
          let restrictedGraph = new Graph(graph.numAgents, graph.numHouses);
  
          for (let a = 1; a <= graph.numAgents; ++a) {
              for (let i = 0; i < Math.min(mid, graph.adj[a].length); ++i) {
                  restrictedGraph.adj[a].push(graph.adj[a][i]);
              }
          }
  
          let matchA = [], matchH = [];
          let [matchingSize, currentMatchA] = hopcroftKarp(restrictedGraph, matchA, matchH);
  
          if (matchingSize === maxMatchingSize) {
              result = mid;
              ans = [mid, currentMatchA];
              matchH2 = matchH;
              right = mid - 1;
          } else {
              left = mid + 1;
          }
      }
  
      return ans;
  }


  const numAgents = this.agents, numHouses = this.houses;
  const graph = new Graph(numAgents, numHouses);
  
  // Initialize preferences properly
  for (let i = 1; i <= numAgents; i++) {
    // Convert preferences to array format if needed
    const agentPreferences = [];
    for (let j = 1; j <= Object.keys(this.preferences[i]).length; j++) {
      agentPreferences.push(this.preferences[i][j]);
    }
    graph.adj[i] = agentPreferences;
  }

  
  let matchA = [], matchH = [];
  const [maxSize, initialMatchA] = hopcroftKarp(graph, matchA, matchH);
  const [leastDissatisfactionSize, matchA2] = leastDissatisfaction(graph, maxSize);
  makeCoalitionFree(matchA2, matchH2, graph);
  for (let a = 1; a <= numAgents; ++a) {
    if (matchA2[a] !== 0) {
      allocation[a] = matchA2[a];
      // console.log(`Agent ${a} is assigned to House ${matchA2[a]}`);
    }
  }
 
    
    
    return allocation;
  }
  
  // Helper method to calculate an agent's total preference score
  calculateAgentPreferenceScore(agent) {
    let score = 0;
    const preferences = this.preferences[agent];
    for (let rank = 1; rank <= Object.keys(preferences).length; rank++) {
      score += (Object.keys(preferences).length - rank + 1); // Higher weight for higher preferences
    }
    return score;
  }
}

export default FourthAlgorithm; 