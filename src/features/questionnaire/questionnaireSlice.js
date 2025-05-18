import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { companiesApi, questionnaireApi } from '../../services/api';

// Define the sections of the questionnaire
export const questionnaireSections = [
  {
    id: 'companyProfile',
    title: 'Company Profile',
    description: 'Basic information about the company'
  },
  {
    id: 'warehouseInfrastructure',
    title: 'Warehouse Infrastructure',
    description: 'Information about warehouse facilities and equipment'
  },
  {
    id: 'inventoryManagement',
    title: 'Inventory Management',
    description: 'SKU profile and inventory tracking methods'
  },
  {
    id: 'orderProfile',
    title: 'Order Profile',
    description: 'Order types, frequencies, and patterns'
  },
  {
    id: 'inboundOperations',
    title: 'Inbound Operations',
    description: 'Receiving processes and supplier management'
  },
  {
    id: 'outboundOperations',
    title: 'Outbound Operations',
    description: 'Picking, packing, and shipping processes'
  },
  {
    id: 'systemsTechnology',
    title: 'Systems & Technology',
    description: 'Current WMS/ERP systems and automation technologies'
  },
  {
    id: 'personnelOrganization',
    title: 'Personnel & Organization',
    description: 'Staffing levels, shifts, and training programs'
  },
  {
    id: 'continuousImprovement',
    title: 'Continuous Improvement',
    description: 'KPIs, metrics, and improvement initiatives'
  }
];

// Async thunks for API operations
export const fetchCompanies = createAsyncThunk(
  'questionnaire/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const companies = await companiesApi.getAll();
      
      // Transform the array of companies into an object with IDs as keys
      const companiesMap = {};
      for (const company of companies) {
        // Fetch the full company data including responses
        const fullCompanyData = await companiesApi.getById(company.id);
        if (fullCompanyData && fullCompanyData.data) {
          companiesMap[company.id] = fullCompanyData.data;
        }
      }
      
      return companiesMap;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompanyResponses = createAsyncThunk(
  'questionnaire/fetchCompanyResponses',
  async (companyId, { rejectWithValue }) => {
    try {
      const responses = await questionnaireApi.getResponses(companyId);
      return { companyId, responses };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCompanyAsync = createAsyncThunk(
  'questionnaire/createCompanyAsync',
  async (companyData, { rejectWithValue }) => {
    try {
      const companyId = uuidv4();
      const now = new Date().toISOString();
      
      const company = {
        id: companyId,
        name: companyData.companyName,
        data: {
          companyInfo: {
            name: companyData.companyName,
            industry: companyData.industry,
            contactPerson: companyData.contactPerson,
            email: companyData.email,
            phone: companyData.phone
          },
          responses: {},
          completionStatus: questionnaireSections.reduce((acc, section) => {
            acc[section.id] = 'not_started';
            return acc;
          }, {}),
          lastUpdated: now,
          created: now
        }
      };
      
      await companiesApi.create(company);
      
      return { 
        id: companyId, 
        ...company.data
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateResponsesAsync = createAsyncThunk(
  'questionnaire/updateResponsesAsync',
  async ({ companyId, sectionId, responses }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentResponses = state.questionnaire.companies[companyId]?.responses[sectionId] || {};
      
      // Merge current responses with new ones
      const updatedResponses = {
        ...currentResponses,
        ...responses
      };
      
      // Save to API
      await questionnaireApi.saveSection(companyId, sectionId, updatedResponses);
      
      return { companyId, sectionId, responses: updatedResponses };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompanyAsync = createAsyncThunk(
  'questionnaire/deleteCompanyAsync',
  async (companyId, { rejectWithValue }) => {
    try {
      await companiesApi.delete(companyId);
      return companyId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importCompanyDataAsync = createAsyncThunk(
  'questionnaire/importCompanyDataAsync',
  async (importedData, { rejectWithValue }) => {
    try {
      // Validate imported data
      if (!importedData.companyInfo || !importedData.responses) {
        throw new Error('Invalid company data format');
      }
      
      const companyId = uuidv4();
      const now = new Date().toISOString();
      
      const company = {
        id: companyId,
        name: importedData.companyInfo.name || 'Imported Company',
        data: {
          ...importedData,
          lastUpdated: now,
          imported: true
        }
      };
      
      await companiesApi.create(company);
      
      // Save each section's responses
      for (const sectionId in importedData.responses) {
        await questionnaireApi.saveSection(
          companyId, 
          sectionId, 
          importedData.responses[sectionId]
        );
      }
      
      return { 
        id: companyId, 
        ...company.data
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  companies: {},
  activeCompanyId: null,
  activeSection: 'companyProfile',
  isCreatingNewCompany: false,
  error: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  isSaving: false,
  lastSaved: null
};

export const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setActiveCompany: (state, action) => {
      state.activeCompanyId = action.payload;
      state.isCreatingNewCompany = false;
    },
    
    startNewCompany: (state) => {
      state.isCreatingNewCompany = true;
      state.activeCompanyId = null;
    },
    
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Company Responses
      .addCase(fetchCompanyResponses.fulfilled, (state, action) => {
        const { companyId, responses } = action.payload;
        if (state.companies[companyId]) {
          state.companies[companyId].responses = responses;
        }
      })
      
      // Create Company
      .addCase(createCompanyAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createCompanyAsync.fulfilled, (state, action) => {
        const { id, ...companyData } = action.payload;
        state.companies[id] = companyData;
        state.activeCompanyId = id;
        state.activeSection = 'companyProfile';
        state.isCreatingNewCompany = false;
        state.isSaving = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(createCompanyAsync.rejected, (state, action) => {
        state.error = action.payload;
        state.isSaving = false;
      })
      
      // Update Responses
      .addCase(updateResponsesAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateResponsesAsync.fulfilled, (state, action) => {
        const { companyId, sectionId, responses } = action.payload;
        
        if (state.companies[companyId]) {
          // Initialize responses object if it doesn't exist
          if (!state.companies[companyId].responses) {
            state.companies[companyId].responses = {};
          }
          
          // Update responses for the section
          state.companies[companyId].responses[sectionId] = responses;
          
          // Update completion status
          state.companies[companyId].completionStatus[sectionId] = 'complete';
          
          // Update last updated timestamp
          state.companies[companyId].lastUpdated = new Date().toISOString();
        }
        
        state.isSaving = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(updateResponsesAsync.rejected, (state, action) => {
        state.error = action.payload;
        state.isSaving = false;
      })
      
      // Delete Company
      .addCase(deleteCompanyAsync.fulfilled, (state, action) => {
        const companyId = action.payload;
        
        // Remove from companies object
        delete state.companies[companyId];
        
        // Update active company if needed
        if (state.activeCompanyId === companyId) {
          state.activeCompanyId = Object.keys(state.companies)[0] || null;
          state.isCreatingNewCompany = Object.keys(state.companies).length === 0;
        }
      })
      
      // Import Company Data
      .addCase(importCompanyDataAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(importCompanyDataAsync.fulfilled, (state, action) => {
        const { id, ...companyData } = action.payload;
        state.companies[id] = companyData;
        state.activeCompanyId = id;
        state.activeSection = 'companyProfile';
        state.isSaving = false;
      })
      .addCase(importCompanyDataAsync.rejected, (state, action) => {
        state.error = `Import failed: ${action.payload}`;
        state.isSaving = false;
      });
  }
});

export const {
  setActiveCompany,
  startNewCompany,
  setActiveSection,
  clearError
} = questionnaireSlice.actions;

// Selectors
export const selectCompanies = (state) => state.questionnaire.companies;
export const selectActiveCompanyId = (state) => state.questionnaire.activeCompanyId;
export const selectActiveSection = (state) => state.questionnaire.activeSection;
export const selectIsCreatingNewCompany = (state) => state.questionnaire.isCreatingNewCompany;
export const selectStatus = (state) => state.questionnaire.status;
export const selectIsSaving = (state) => state.questionnaire.isSaving;
export const selectActiveCompany = (state) => {
  const activeId = state.questionnaire.activeCompanyId;
  return activeId ? state.questionnaire.companies[activeId] : null;
};
export const selectSectionResponses = (state, sectionId) => {
  const activeId = state.questionnaire.activeCompanyId;
  if (!activeId || !state.questionnaire.companies[activeId]?.responses) return {};
  
  // If sectionId is provided, return only that section's responses
  if (sectionId) {
    return state.questionnaire.companies[activeId].responses[sectionId] || {};
  }
  
  // Otherwise return all responses
  return state.questionnaire.companies[activeId].responses;
};
export const selectCompletionStatus = (state) => {
  const activeId = state.questionnaire.activeCompanyId;
  return activeId ? state.questionnaire.companies[activeId]?.completionStatus : {};
};
export const selectError = (state) => state.questionnaire.error;

export default questionnaireSlice.reducer;
