import { createSlice } from '@reduxjs/toolkit';
import { saveNotes, loadNotes } from '../../services/storageService';

// Global variables to store recording state
// These need to be outside Redux since MediaRecorder can't be serialized
let activeMediaRecorder = null;
let activeAudioChunks = [];
let activeAudioBlob = null;
let activeAudioUrl = null;

// Helper functions to access the global recorder
export const setActiveMediaRecorder = (recorder) => {
  activeMediaRecorder = recorder;
};

export const getActiveMediaRecorder = () => {
  return activeMediaRecorder;
};

export const setActiveAudioChunks = (chunks) => {
  activeAudioChunks = chunks;
};

export const getActiveAudioChunks = () => {
  return activeAudioChunks;
};

export const setActiveAudioBlob = (blob) => {
  activeAudioBlob = blob;
  if (blob) {
    activeAudioUrl = URL.createObjectURL(blob);
  } else {
    if (activeAudioUrl) {
      URL.revokeObjectURL(activeAudioUrl);
      activeAudioUrl = null;
    }
  }
};

export const getActiveAudioBlob = () => {
  return activeAudioBlob;
};

export const getActiveAudioUrl = () => {
  return activeAudioUrl;
};

export const clearActiveRecording = () => {
  activeMediaRecorder = null;
  activeAudioChunks = [];
  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = null;
  }
  activeAudioBlob = null;
};

// Load initial notes from localStorage
const initialNotes = loadNotes() || [];

const initialState = {
  notes: initialNotes,
  isRecording: false,
  currentRecording: null,
  transcribedText: '',
  recordingStartTime: null,
  processingAudio: false
};

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    startRecording: (state) => {
      state.isRecording = true;
      state.recordingStartTime = new Date().toISOString();
      // Clear transcribed text when starting a new recording
      state.transcribedText = '';
    },
    stopRecording: (state) => {
      state.isRecording = false;
    },
    startProcessingAudio: (state) => {
      state.processingAudio = true;
    },
    finishProcessingAudio: (state) => {
      state.processingAudio = false;
    },
    updateTranscribedText: (state, action) => {
      state.transcribedText = action.payload;
    },
    addNote: (state, action) => {
      const useCurrentTime = action.payload;
      
      const newNote = {
        id: Date.now().toString(),
        text: state.transcribedText,
        timestamp: useCurrentTime ? new Date().toISOString() : state.recordingStartTime || new Date().toISOString(),
        audioUrl: null // We're not storing audio files permanently
      };
      
      state.notes.unshift(newNote);
      state.transcribedText = '';
      state.recordingStartTime = null;
      state.processingAudio = false;
      
      // Save to localStorage
      saveNotes(state.notes);
    },
    updateNote: (state, action) => {
      const { id, text } = action.payload;
      const noteIndex = state.notes.findIndex(note => note.id === id);
      
      if (noteIndex !== -1) {
        state.notes[noteIndex].text = text;
        
        // Save to localStorage
        saveNotes(state.notes);
      }
    },
    deleteNote: (state, action) => {
      const noteId = action.payload;
      state.notes = state.notes.filter(note => note.id !== noteId);
      
      // Save to localStorage
      saveNotes(state.notes);
    },
    resetRecordingState: (state) => {
      state.isRecording = false;
      state.currentRecording = null;
      state.transcribedText = '';
      state.recordingStartTime = null;
    }
  }
});

export const { 
  startRecording, 
  stopRecording, 
  startProcessingAudio,
  finishProcessingAudio,
  updateTranscribedText, 
  addNote, 
  updateNote, 
  deleteNote,
  resetRecordingState
} = notesSlice.actions;

// Selectors
export const selectNotes = state => state.notes.notes;
export const selectIsRecording = state => state.notes.isRecording;
export const selectCurrentRecording = state => state.notes.currentRecording;
export const selectTranscribedText = state => state.notes.transcribedText;
export const selectRecordingStartTime = state => state.notes.recordingStartTime;

export default notesSlice.reducer;
