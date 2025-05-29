import { configureStore } from '@reduxjs/toolkit';
import processesReducer from '../features/processes/processesSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    processes: processesReducer,
    auth: authReducer,
  },
});

export default store;
