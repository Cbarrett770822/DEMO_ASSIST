import { configureStore } from '@reduxjs/toolkit';
import processesReducer from '../features/processes/processesSlice';

export const store = configureStore({
  reducer: {
    processes: processesReducer,
  },
});

export default store;
