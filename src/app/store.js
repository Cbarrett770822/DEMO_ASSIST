import { configureStore } from '@reduxjs/toolkit';
import processesReducer from '../features/processes/processesSlice';
import presentationsReducer from '../features/presentations/presentationsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    processes: processesReducer,
    presentations: presentationsReducer,
    auth: authReducer,
  },
});

export default store;
