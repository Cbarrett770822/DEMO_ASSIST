import { createSlice } from '@reduxjs/toolkit';

// Helper function to save recordings to localStorage
const saveRecordings = (recordings) => {
  try {
    localStorage.setItem('wmsRecordings', JSON.stringify(recordings));
  } catch (error) {
    console.error('Error saving recordings to localStorage:', error);
  }
};

// Helper function to load recordings from localStorage
const loadRecordings = () => {
  try {
    const recordings = localStorage.getItem('wmsRecordings');
    return recordings ? JSON.parse(recordings) : [];
  } catch (error) {
    console.error('Error loading recordings from localStorage:', error);
    return [];
  }
};

// Load initial recordings from localStorage
const initialRecordings = loadRecordings();

const initialState = {
  recordings: initialRecordings,
  isRecording: false,
  currentRecording: null,
  currentEvents: [],
  recordingStartTime: null,
  isPlaying: false,
  currentPlayback: null,
  playbackSpeed: 1
};

export const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    startRecording: (state, action) => {
      state.isRecording = true;
      state.recordingStartTime = new Date().toISOString();
      state.currentEvents = [];
      state.currentRecording = {
        id: Date.now().toString(),
        name: action.payload || `Recording ${state.recordings.length + 1}`,
        startTime: new Date().toISOString(),
        path: window.location.pathname
      };
    },
    stopRecording: (state) => {
      if (!state.isRecording) return;
      
      state.isRecording = false;
      
      // Create a new recording object
      const newRecording = {
        ...state.currentRecording,
        endTime: new Date().toISOString(),
        events: state.currentEvents,
        duration: new Date() - new Date(state.recordingStartTime)
      };
      
      // Add the recording to the list
      state.recordings.push(newRecording);
      state.currentEvents = [];
      state.recordingStartTime = null;
      state.currentRecording = null;
      
      // Save to localStorage
      saveRecordings(state.recordings);
    },
    recordEvent: (state, action) => {
      if (state.isRecording) {
        // Add timestamp to the event
        const eventWithTimestamp = {
          ...action.payload,
          timestamp: Date.now() - new Date(state.recordingStartTime)
        };
        
        state.currentEvents.push(eventWithTimestamp);
      }
    },
    startPlayback: (state, action) => {
      const recordingId = action.payload;
      const recording = state.recordings.find(r => r.id === recordingId);
      
      if (recording) {
        state.isPlaying = true;
        state.currentPlayback = recording;
      }
    },
    stopPlayback: (state) => {
      state.isPlaying = false;
      state.currentPlayback = null;
    },
    setPlaybackSpeed: (state, action) => {
      state.playbackSpeed = action.payload;
    },
    deleteRecording: (state, action) => {
      const recordingId = action.payload;
      state.recordings = state.recordings.filter(r => r.id !== recordingId);
      
      // Save to localStorage
      saveRecordings(state.recordings);
    },
    renameRecording: (state, action) => {
      const { id, name } = action.payload;
      const recording = state.recordings.find(r => r.id === id);
      
      if (recording) {
        recording.name = name;
        
        // Save to localStorage
        saveRecordings(state.recordings);
      }
    }
  }
});

export const { 
  startRecording, 
  stopRecording, 
  recordEvent, 
  startPlayback, 
  stopPlayback, 
  setPlaybackSpeed,
  deleteRecording,
  renameRecording
} = recordingSlice.actions;

// Selectors
export const selectRecordings = (state) => state.recording.recordings;
export const selectIsRecording = (state) => state.recording.isRecording;
export const selectCurrentEvents = (state) => state.recording.currentEvents;
export const selectIsPlaying = (state) => state.recording.isPlaying;
export const selectCurrentPlayback = (state) => state.recording.currentPlayback;
export const selectPlaybackSpeed = (state) => state.recording.playbackSpeed;

export default recordingSlice.reducer;
