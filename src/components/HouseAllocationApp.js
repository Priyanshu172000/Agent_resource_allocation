import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import AlgorithmComparison from './Comparison/AlgorithmComparison';
import './HouseAllocationApp.css';

const HouseAllocationApp = () => {
  const [agents, setAgents] = useState(2);
  const [houses, setHouses] = useState(3);
  const [prefLength, setPrefLength] = useState(2);
  const [preferences, setPreferences] = useState({});
  const [allocation, setAllocation] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllocationAnimation, setShowAllocationAnimation] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Reset preferences when params change
//   useEffect(() => {
//     setPreferences({});
//     setAllocation(null);
//     setError('');
//   }, [agents, houses, prefLength]);

  // Handle changes to preference values
  const handlePreferenceChange = (agentId, prefIndex, houseId) => {
    setPreferences(prev => ({
      ...prev,
      [agentId]: {
        ...(prev[agentId] || {}),
        [prefIndex]: parseInt(houseId) || ''
      }
    }));
  };

  // Check if preferences are valid
  const arePreferencesValid = () => {
    // Check if all agents have complete preference lists
    for (let i = 1; i <= agents; i++) {
      if (!preferences[i]) return false;
      
      for (let j = 1; j <= prefLength; j++) {
        if (preferences[i][j] === undefined || preferences[i][j] === '' || isNaN(preferences[i][j])) {
          return false;
        }
        
        // Check if the house ID is valid
        if (preferences[i][j] < 1 || preferences[i][j] > houses) {
          return false;
        }
      }
      
      // Check for duplicates in preferences
      const preferenceValues = Object.values(preferences[i]);
      const uniqueValues = new Set(preferenceValues);
      if (uniqueValues.size !== preferenceValues.length) {
        return false;
      }
    }
    return true;
  };

  // Algorithm to allocate houses
  const allocateHouses = async () => {
    if (!arePreferencesValid()) {
      setError('Please fill in all preferences with valid house numbers without duplicates.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Simulating calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Implementation of a simple house allocation algorithm
      // Initialize allocation
      const result = {};
      const freeAgents = Array.from({ length: agents }, (_, i) => i + 1);
      const houseAllocated = {};
      const agentPreferenceIndex = {};
      
      for (let i = 1; i <= agents; i++) {
        agentPreferenceIndex[i] = 1; // Start with first preference
      }
      
      // Continue until all agents are allocated or have exhausted preferences
      while (freeAgents.length > 0) {
        const currentAgent = freeAgents[0];
        
        // If agent has exhausted all preferences
        if (agentPreferenceIndex[currentAgent] > prefLength) {
          freeAgents.shift();
          continue;
        }
        
        // Get current house preference of the agent
        const preferredHouse = preferences[currentAgent][agentPreferenceIndex[currentAgent]];
        
        // If house is free, allocate it
        if (!houseAllocated[preferredHouse]) {
          houseAllocated[preferredHouse] = currentAgent;
          result[currentAgent] = preferredHouse;
          freeAgents.shift();
        } else {
          // House is already allocated, move to next preference
          agentPreferenceIndex[currentAgent]++;
        }
      }
      
      setAllocation(result);
      setShowAllocationAnimation(true);
      
      // Optional: Save to database via API
      try {
        await axios.post('http://localhost:5000/api/allocate', {
          agents,
          houses,
          prefLength,
          preferences,
          allocation: result
        });
      } catch (error) {
        console.error('Error saving allocation:', error);
        // Not showing this error to user as it's non-critical
      }
      
    } catch (error) {
      setError('An error occurred during allocation.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate the preference input fields
  const renderPreferenceInputs = () => {
    const rows = [];
    
    for (let i = 1; i <= agents; i++) {
      const prefInputs = [];
      
      for (let j = 1; j <= prefLength; j++) {
        prefInputs.push(
          <div key={`agent-${i}-pref-${j}`} className="preference-input">
            <label>
              Choice {j}:
            </label>
            <input
              type="number"
              min="1"
              max={houses}
              value={(preferences[i] && preferences[i][j]) || ''}
              onChange={(e) => handlePreferenceChange(i, j, e.target.value)}
            />
          </div>
        );
      }
      
      rows.push(
        <div key={`agent-${i}`} className="agent-preferences">
          <div className="agent-label">
            <div className="agent-icon">👤</div>
            <div>Student {i}</div>
          </div>
          <div className="preference-list">
            {prefInputs}
          </div>
        </div>
      );
    }
    
    return rows;
  };

  // Render allocation results
  const renderAllocation = () => {
    if (!allocation) return null;
    
    const allocatedAgents = Object.keys(allocation);
    if (allocatedAgents.length === 0) {
      return <div className="no-allocation">No valid allocation possible.</div>;
    }
    
    return (
      <div className={`allocation-results ${showAllocationAnimation ? 'show-animation' : ''}`}>
        <h3>Room Allocation Results:</h3>
        <div className="allocation-grid">
          {allocatedAgents.map(agent => (
            <div key={`result-${agent}`} className="allocation-item">
              <div className="agent-house-icons">
                <div className="agent-result-icon">👤</div>
                <div className="allocation-arrow">→</div>
                <div className="house-result-icon">🏠</div>
              </div>
              <div className="allocation-text">
                Student {agent} is allocated Room {allocation[agent]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Validate the data structure
        if (jsonData.length < 2) {
          setFileError('Excel file must have at least 2 rows (header and data)');
          return;
        }

        // Process the data
        const newPreferences = {};
        let validData = true;

        for (let i = 1; i < Math.min(jsonData.length, agents+1); i++) {
          const row = jsonData[i];
          if (!row || row.length < prefLength + 1) {
            validData = false;
            break;
          }

          const agentId = parseInt(row[0]);
          if (isNaN(agentId) || agentId < 1 || agentId > agents) {
            validData = false;
            break;
          }

          newPreferences[agentId] = {};
          for (let j = 1; j <= prefLength; j++) {
            const houseId = parseInt(row[j]);
            if (isNaN(houseId) || houseId < 1 || houseId > houses) {
              validData = false;
              break;
            }
            newPreferences[agentId][j] = houseId;
          }
        }

        if (!validData) {
          setFileError('Invalid data format in Excel file. Please check the structure.');
          return;
        }

        setPreferences(newPreferences);
        setFileError('');
        setError('');
      } catch (error) {
        setFileError('Error processing Excel file. Please check the format.');
        console.error('Excel processing error:', error);
      }
    };

    reader.onerror = () => {
      setFileError('Error reading file');
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="Room-allocation-container">
      <div className="app-header">
        <h1>Room Allocation Problem with Student Preferences</h1>
        <p className="app-description">
          Assign Rooms to Students based on preference rankings
        </p>
      </div>
      
      <div className="input-parameters">
        <div className="parameter-input">
          <label>
            Number of Students (n):
          </label>
          <input
            type="number"
            min="1"
            value={agents}
            onChange={(e) => setAgents(parseInt(e.target.value)||1)}
          />
        </div>
        
        <div className="parameter-input">
          <label>
            Number of Houses (m):
          </label>
          <input
            type="number"
            min="1"
            value={houses}
            onChange={(e) => setHouses(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <div className="parameter-input">
          <label>
            Preference List Length (r):
          </label>
          <input
            type="number"
            min="1"
            max={houses}
            value={prefLength}
            onChange={(e) => {
              const newVal = parseInt(e.target.value) || 1;
              setPrefLength(Math.min(newVal, houses));
            }}
          />
        </div>
      </div>

      <div className="file-upload-section">
        <h3>Upload Preferences (Excel)</h3>
        <div className="file-upload-container">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="file-input"
          />
          <p className="file-format-info">
            Excel format: First column should be Student ID, followed by preference columns (1 to r)
          </p>
          {fileError && <div className="error-message">{fileError}</div>}
        </div>
      </div>
      
      <div className="preferences-container">
        <div className="preferences-header">
          <h2>Student Preferences:</h2>
          <button 
            className="toggle-preferences-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Show Preferences' : 'Hide Preferences'}
          </button>
        </div>
        <p className="preferences-help">
          For each Student, enter Room numbers (1 to {houses}) in order of preference.
        </p>
        <div className={`preferences-list ${isCollapsed ? 'collapsed' : ''}`}>
          {renderPreferenceInputs()}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button
        className={`calculate-button ${isLoading ? 'loading' : ''}`}
        onClick={allocateHouses}
        disabled={isLoading}
      >
        {isLoading ? 'Calculating...' : 'Calculate Allocation'}
      </button>
      
      {allocation && (
        <>
          {/* {renderAllocation()} */}
          <AlgorithmComparison
            agents={agents}
            houses={houses}
            preferences={preferences}
          />
        </>
      )}
    </div>
  );
};

export default HouseAllocationApp;
