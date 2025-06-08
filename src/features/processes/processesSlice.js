import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import processData from './data/processData';
import { loadProcesses, saveProcesses, hasStoredProcesses } from '../../services/storageService';
import config from '../../config';

// Async thunk for fetching processes from the API
export const fetchProcesses = createAsyncThunk(
  'processes/fetchProcesses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('wms_auth_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/getProcesses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.processes)) {
        console.log(`Loaded ${data.processes.length} processes from API`);
        return data.processes;
      } else {
        console.warn('API returned success but no processes array:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching processes:', error);
      return rejectWithValue(error.message || 'Failed to fetch processes');
    }
  }
);

// Load processes from localStorage if available, otherwise use default data
const savedProcesses = hasStoredProcesses() ? loadProcesses() : null;

// Ensure processes is always an array
const ensureArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [];
};

const initialState = {
  processes: ensureArray(savedProcesses || processData),
  selectedProcessId: null,
  selectedCategory: 'all',
  currentStep: 0,
  isVideoPlaying: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const processesSlice = createSlice({
  name: 'processes',
  initialState,
  reducers: {
    selectProcess: (state, action) => {
      state.selectedProcessId = action.payload;
      state.currentStep = 0;
      state.isVideoPlaying = false;
    },
    clearSelectedProcess: (state) => {
      state.selectedProcessId = null;
      state.currentStep = 0;
      state.isVideoPlaying = false;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.selectedProcessId && state.currentStep < state.processes.find(p => p.id === state.selectedProcessId)?.steps.length - 1) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    setVideoPlaying: (state, action) => {
      state.isVideoPlaying = action.payload;
    },
    filterByCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    updateProcesses: (state, action) => {
      state.processes = action.payload;
      // Save to localStorage
      saveProcesses(action.payload);
    },
    addProcess: (state, action) => {
      state.processes.push(action.payload);
      // Save to localStorage
      saveProcesses(state.processes);
    },
    updateProcess: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.processes.findIndex(p => p.id === id);
      if (index !== -1) {
        // Update only the fields provided in the changes object
        state.processes[index] = { ...state.processes[index], ...changes };
        // Save to localStorage
        saveProcesses(state.processes);
      }
    },
    deleteProcess: (state, action) => {
      state.processes = state.processes.filter(p => p.id !== action.payload);
      // If the deleted process was selected, clear the selection
      if (state.selectedProcessId === action.payload) {
        state.selectedProcessId = null;
        state.currentStep = 0;
      }
      // Save to localStorage
      saveProcesses(state.processes);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcesses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProcesses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Only update processes if we got data from the API
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.processes = action.payload;
          // Save to localStorage for offline access
          saveProcesses(action.payload);
        }
      })
      .addCase(fetchProcesses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { 
  selectProcess, 
  clearSelectedProcess, 
  setCurrentStep, 
  nextStep, 
  previousStep, 
  setVideoPlaying, 
  filterByCategory, 
  updateProcesses,
  addProcess,
  updateProcess,
  deleteProcess
} = processesSlice.actions;

// Ensure data is always an array
const ensureArrayResult = (data) => {
  return Array.isArray(data) ? data : [];
};

// Selectors
export const selectProcesses = (state) => ensureArrayResult(state.processes.processes);
export const selectAllProcesses = (state) => ensureArrayResult(state.processes.processes);
export const selectFilteredProcesses = (state) => {
  const category = state.processes.selectedCategory;
  if (category === 'all') {
    return ensureArrayResult(state.processes.processes);
  }
  
  // Handle both 'returns' and 'advanced' categories
  const processes = ensureArrayResult(state.processes.processes);
  
  if (category === 'returns' || category === 'advanced') {
    return processes.filter(process => 
      process.category === 'returns' || process.category === 'advanced'
    );
  }
  
  return processes.filter(process => process.category === category);
};
export const selectSelectedProcess = (state) => {
  const processes = ensureArrayResult(state.processes.processes);
  return processes.find(process => process.id === state.processes.selectedProcessId) || null;
};
export const selectCurrentStep = (state) => state.processes.currentStep;
export const selectIsVideoPlaying = (state) => state.processes.isVideoPlaying;
export const selectSelectedCategory = (state) => state.processes.selectedCategory;
export const selectProcessesStatus = (state) => state.processes.status;
export const selectProcessesError = (state) => state.processes.error;

export default processesSlice.reducer;
