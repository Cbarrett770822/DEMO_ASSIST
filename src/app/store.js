import { configureStore } from '@reduxjs/toolkit';
import processesReducer from '../features/processes/processesSlice';
import recordingReducer from '../features/recording/recordingSlice';

export const store = configureStore({
  reducer: {
    processes: processesReducer,
    recording: recordingReducer,
  },
});

export default store;
