import BaseAlgorithm from './BaseAlgorithm';

class ThirdAlgorithm extends BaseAlgorithm {
  calculateAllocation() {
    this.validateInput();
    
    const allocation = {};


    // House Allocation Algorithm with Trade-in-Free and Coalition-Free Matching in JavaScript

    class Graph {
      constructor(numAgents, numHouses) {
          this.numAgents = numAgents;
          this.numHouses = numHouses;
          this.adj = Array.from({ length: numAgents + 1 }, () => []); // One-based indexing
      }
    }

    function bfs(matchA, matchH, dist, graph) {
      const queue = [];
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
          const a = queue.shift();
          if (dist[a] < dist[0]) {
              for (const h of graph.adj[a]) {
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
          for (const h of graph.adj[a]) {
              if (dist[matchH[h]] === dist[a] + 1 && dfs(matchH[h], matchA, matchH, dist, graph)) {
                  matchH[h] = a;
                  matchA[a] = h;
                  return true;
              }
          }
          dist[a] = Infinity;
          return false;
      }
      return true;
    }

    function hopcroftKarp(graph, matchA, matchH) {
      matchA.fill(0);
      matchH.fill(0);
      const dist = new Array(graph.numAgents + 1).fill(0);

      let matchingSize = 0;
      while (bfs(matchA, matchH, dist, graph)) {
          for (let a = 1; a <= graph.numAgents; a++) {
              if (matchA[a] === 0 && dfs(a, matchA, matchH, dist, graph)) {
                  matchingSize++;
              }
          }
      }
      return matchingSize;
    }

    function makeTradeInFree(matchA, matchH, graph) {
      const prefLists = Array.from({ length: graph.numHouses + 1 }, () => []);
      const curRank = new Array(graph.numAgents + 1).fill(-1);
      const unmatchedHouses = [];

      for (let a = 1; a <= graph.numAgents; a++) {
          if (matchA[a] !== 0) {
              const h = matchA[a];
              curRank[a] = graph.adj[a].indexOf(h);
              prefLists[h].push([a, curRank[a]]);
          }
      }

      for (let h = 1; h <= graph.numHouses; h++) {
          if (matchH[h] === 0 && prefLists[h].length > 0) {
              unmatchedHouses.push(h);
          }
      }

      while (unmatchedHouses.length > 0) {
          const h = unmatchedHouses.shift();
          while (prefLists[h].length > 0) {
              const [a, rank] = prefLists[h].shift();
              if (rank < curRank[a]) {
                  const oldH = matchA[a];
                  matchA[a] = h;
                  matchH[h] = a;
                  if (prefLists[oldH].length > 0) {
                      unmatchedHouses.push(oldH);
                  }
                  break;
              }
          }
      }
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

    // Example usage:
    // Define your input here manually or using a parser
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

    const matchA = new Array(numAgents + 1).fill(0);
    const matchH = new Array(numHouses + 1).fill(0);

    hopcroftKarp(graph, matchA, matchH);
    makeTradeInFree(matchA, matchH, graph);
    makeCoalitionFree(matchA, matchH, graph);

    // console.log("Pareto Optimal Matching:");
    for (let a = 1; a <= numAgents; a++) {
      if (matchA[a] !== 0) {
        allocation[a] = matchA[a];
          // console.log(`Agent ${a} is assigned to House ${matchA[a]}`);
      }
    }
    
    return allocation;
  }
}

export default ThirdAlgorithm; 