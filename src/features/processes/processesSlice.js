import { createSlice } from '@reduxjs/toolkit';
import processData from './data/processData';
import { loadProcesses, saveProcesses, hasStoredProcesses } from '../../services/storageService';

// Load processes from localStorage if available, otherwise use default data
const savedProcesses = hasStoredProcesses() ? loadProcesses() : null;

const initialState = {
  processes: savedProcesses || processData,
  selectedProcessId: null,
  selectedCategory: 'all',
  currentStep: 0,
  isVideoPlaying: false
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
      const index = state.processes.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.processes[index] = action.payload;
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

// Selectors
export const selectProcesses = (state) => state.processes.processes;
export const selectAllProcesses = (state) => state.processes.processes;
export const selectFilteredProcesses = (state) => {
  const category = state.processes.selectedCategory;
  if (category === 'all') {
    return state.processes.processes;
  }
  
  // Handle both 'returns' and 'advanced' categories
  if (category === 'advanced') {
    return state.processes.processes.filter(process => 
      process.category === 'advanced' || process.category === 'returns'
    );
  }
  
  return state.processes.processes.filter(process => process.category === category);
};
export const selectSelectedProcess = (state) => {
  return state.processes.processes.find(process => process.id === state.processes.selectedProcessId);
};
export const selectCurrentStep = (state) => state.processes.currentStep;
export const selectIsVideoPlaying = (state) => state.processes.isVideoPlaying;
export const selectSelectedCategory = (state) => state.processes.selectedCategory;

export default processesSlice.reducer;
