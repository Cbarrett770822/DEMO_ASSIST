import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadPresentations, savePresentations, hasStoredPresentations } from '../../services/storageService';
import config from '../../config';

// Async thunk for fetching presentations from the API
export const fetchPresentations = createAsyncThunk(
  'presentations/fetchPresentations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('wms_auth_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${config.apiUrl}/getPresentations`, {
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
      
      if (data.success && Array.isArray(data.presentations)) {
        console.log(`Loaded ${data.presentations.length} presentations from API`);
        return data.presentations;
      } else {
        console.warn('API returned success but no presentations array:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching presentations:', error);
      return rejectWithValue(error.message || 'Failed to fetch presentations');
    }
  }
);

// Ensure presentations is always an array
const ensureArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [];
};

// Load presentations from localStorage if available
const loadInitialPresentations = () => {
  try {
    if (hasStoredPresentations()) {
      const presentations = loadPresentations();
      if (Array.isArray(presentations)) {
        return presentations;
      }
    }
    return defaultPresentations;
  } catch (error) {
    console.error('Error loading initial presentations:', error);
    return defaultPresentations;
  }
};

// Default presentations if none are stored
const defaultPresentations = [
  {
    id: 1,
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false
  },
  {
    id: 2,
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false
  }
];

const initialState = {
  presentations: loadInitialPresentations(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const presentationsSlice = createSlice({
  name: 'presentations',
  initialState,
  reducers: {
    updatePresentations: (state, action) => {
      state.presentations = action.payload;
      // Save to localStorage
      savePresentations(action.payload);
    },
    addPresentation: (state, action) => {
      state.presentations.push(action.payload);
      // Save to localStorage
      savePresentations(state.presentations);
    },
    updatePresentation: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.presentations.findIndex(p => p.id === id);
      if (index !== -1) {
        // Update only the fields provided in the changes object
        state.presentations[index] = { ...state.presentations[index], ...changes };
        // Save to localStorage
        savePresentations(state.presentations);
      }
    },
    deletePresentation: (state, action) => {
      state.presentations = state.presentations.filter(p => p.id !== action.payload);
      // Save to localStorage
      savePresentations(state.presentations);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresentations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPresentations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Only update presentations if we got data from the API
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.presentations = action.payload;
          // Save to localStorage for offline access
          savePresentations(action.payload);
        }
      })
      .addCase(fetchPresentations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { 
  updatePresentations,
  addPresentation,
  updatePresentation,
  deletePresentation
} = presentationsSlice.actions;

// Ensure data is always an array
const ensureArrayResult = (data) => {
  return Array.isArray(data) ? data : [];
};

// Selectors
export const selectPresentations = (state) => ensureArrayResult(state.presentations.presentations);
export const selectPresentationsStatus = (state) => state.presentations.status;
export const selectPresentationsError = (state) => state.presentations.error;

export default presentationsSlice.reducer;
