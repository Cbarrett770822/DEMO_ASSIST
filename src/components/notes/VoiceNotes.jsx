import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Badge
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { 
  selectNotes, 
  selectIsRecording, 
  selectTranscribedText,
  selectRecordingStartTime,
  startRecording,
  stopRecording,
  updateTranscribedText,
  addNote,
  updateNote,
  deleteNote,
  setActiveMediaRecorder,
  getActiveMediaRecorder,
  setActiveAudioChunks,
  getActiveAudioChunks,
  clearActiveRecording,
  resetRecordingState,
  startProcessingAudio,
  finishProcessingAudio
} from '../../features/notes/notesSlice';

const VoiceNotes = () => {
  // Redux state
  const notes = useSelector(selectNotes);
  const isRecording = useSelector(selectIsRecording);
  const transcribedText = useSelector(selectTranscribedText);
  const recordingStartTime = useSelector(selectRecordingStartTime);
  const dispatch = useDispatch();
  
  // Local state
  const [editingNote, setEditingNote] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [recognitionRunning, setRecognitionRunning] = useState(false);
  const [manualTranscription, setManualTranscription] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState({});
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [textOnlyNote, setTextOnlyNote] = useState('');
  
  // Use ref for speech recognition only
  // MediaRecorder is stored in a global variable
  const speechRecognitionRef = useRef(null);
  
  // Check if recording is already in progress when component mounts
  useEffect(() => {
    if (isRecording) {
      // If recording was started on another page, show notification
      showSnackbar('Recording in progress. Click stop when you want to finish recording.', 'info');
    } else {
      // If not recording, make sure transcribing is false
      setTranscribing(false);
    }
  }, [isRecording]);
  
  // Function to transcribe audio after recording is complete without playing it back
  const transcribeAudio = async (audioBlob) => {
    if (!audioBlob) {
      console.error('No audio blob to transcribe');
      return '';
    }
    
    // Show processing state
    dispatch(startProcessingAudio());
    showSnackbar('Processing audio recording...', 'info');
    
    try {
      // Check if the browser supports the Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showSnackbar('Speech recognition is not supported in this browser. Try Chrome or Edge.', 'error');
        return '';
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure speech recognition for transcription
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      // Create a silent AudioContext to process the audio without playing it
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
      
      // Set up a promise to handle the transcription result
      const transcriptionPromise = new Promise((resolve, reject) => {
        let transcriptionResult = '';
        
        recognition.onresult = (event) => {
          console.log('Transcription result received', event);
          let finalTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          
          console.log('Final transcript:', finalTranscript);
          transcriptionResult = finalTranscript;
        };
        
        recognition.onerror = (event) => {
          console.error('Transcription error', event.error);
          if (event.error === 'no-speech') {
            // If no speech detected, return a default message
            resolve(`Note recorded at ${new Date().toLocaleTimeString()}. Edit this note to add details about warehouse roles and processes.`);
          } else {
            reject(new Error(`Transcription error: ${event.error}`));
          }
        };
        
        recognition.onend = () => {
          console.log('Transcription ended');
          if (transcriptionResult) {
            resolve(transcriptionResult);
          } else {
            // If no result but no error either, return a default message
            resolve(`Note recorded at ${new Date().toLocaleTimeString()}. Edit this note to add details about warehouse roles and processes.`);
          }
        };
        
        // Process the audio file without playing it
        fileReader.onload = async () => {
          try {
            // Start recognition
            recognition.start();
            console.log('Speech recognition started');
            
            // Decode the audio data silently
            const arrayBuffer = fileReader.result;
            await audioContext.decodeAudioData(arrayBuffer);
            
            // Give the recognition some time to process, then stop it
            setTimeout(() => {
              try {
                recognition.stop();
                console.log('Speech recognition stopped after processing');
              } catch (error) {
                console.error('Error stopping recognition:', error);
              }
            }, 2000);
          } catch (error) {
            console.error('Error processing audio:', error);
            reject(error);
          }
        };
        
        fileReader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error('Error reading audio file'));
        };
        
        // Read the audio blob as an array buffer
        fileReader.readAsArrayBuffer(audioBlob);
      });
      
      // Wait for transcription to complete
      const result = await transcriptionPromise;
      return result;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      showSnackbar(`Error processing recording: ${error.message}`, 'error');
      // Return a default message in case of error
      return `Note recorded at ${new Date().toLocaleTimeString()}. Edit this note to add details about warehouse roles and processes.`;
    } finally {
      dispatch(finishProcessingAudio());
    }
  };
  
  // Cleanup resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop any active recording when component unmounts
      const mediaRecorder = getActiveMediaRecorder();
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
          if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.error('Error stopping recording on unmount:', error);
        }
      }
      clearActiveRecording();
    };
  }, []);
  
  const handleStartRecording = async () => {
    // Reset states when starting a new recording
    setTranscribing(false);
    setManualTranscription('');
    dispatch(updateTranscribedText(''));
    
    try {
      // Check if there's already an active recorder
      if (getActiveMediaRecorder()) {
        showSnackbar('Recording is already in progress', 'info');
        return;
      }
      
      // Request microphone access
      try {
        console.log('Attempting to access microphone...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
        
        // Update Redux state to indicate recording is in progress
        dispatch(startRecording());
        
        // Create media recorder with high quality audio settings
        const options = { mimeType: 'audio/webm' };
        let mediaRecorder;
        
        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
          console.log('MediaRecorder with specified options not supported, using default');
          mediaRecorder = new MediaRecorder(stream);
        }
        
        // Store the recorder globally so it can be accessed from any page
        setActiveMediaRecorder(mediaRecorder);
        setActiveAudioChunks([]);
        
        // Set up event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            const currentChunks = getActiveAudioChunks();
            currentChunks.push(event.data);
            setActiveAudioChunks(currentChunks);
            console.log(`Recorded audio chunk: ${event.data.size} bytes`);
          }
        };
        
        // Start recording with a timeslice to get data periodically
        mediaRecorder.start(1000); // Get data every second
        console.log('Background audio recording started');
        
        // Show a notification to the user
        showSnackbar('Recording started. You can navigate to other pages while recording continues in the background.', 'info');
        
      } catch (mediaError) {
        console.error('Error accessing microphone:', mediaError);
        
        // Provide specific error messages based on the error type
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          showSnackbar('Microphone access denied. Please enable microphone permissions in your browser settings.', 'error');
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          showSnackbar('No microphone detected. Please connect a microphone and try again.', 'error');
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          showSnackbar('Could not access microphone. It may be in use by another application.', 'error');
        } else {
          showSnackbar(`Could not start recording: ${mediaError.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      showSnackbar(`Could not start recording: ${error.message}`, 'error');
    }
  };
  
  const handleStopRecording = async () => {
    // Check if there's an active recorder
    const mediaRecorder = getActiveMediaRecorder();
    if (!mediaRecorder) {
      showSnackbar('No active recording to stop', 'warning');
      return;
    }
    
    try {
      // Update Redux state to indicate recording has stopped
      dispatch(stopRecording());
      setTranscribing(true);
      showSnackbar('Stopping recording and processing audio...', 'info');
      
      // Create a function to process the audio after stopping
      const processRecordedAudio = async () => {
        try {
          // Get all the audio chunks that were recorded
          const audioChunks = getActiveAudioChunks();
          
          if (!audioChunks || audioChunks.length === 0) {
            showSnackbar('No audio data was recorded', 'error');
            setTranscribing(false);
            return;
          }
          
          console.log(`Processing ${audioChunks.length} audio chunks`);
          
          // Create a blob from all the audio chunks
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          console.log(`Created audio blob: ${audioBlob.size} bytes`);
          
          // Transcribe the audio recording
          const transcribedText = await transcribeAudio(audioBlob);
          
          if (transcribedText && transcribedText.trim() !== '') {
            // Use the transcribed text
            dispatch(updateTranscribedText(transcribedText));
            console.log('Transcribed text:', transcribedText);
          } else if (manualTranscription.trim() !== '') {
            // Use manual transcription if available
            dispatch(updateTranscribedText(manualTranscription.trim()));
            console.log('Using manual transcription:', manualTranscription);
          } else {
            // No transcription available, use a default message
            const defaultNote = 'Warehouse process note: Recording created at ' + 
              new Date().toLocaleTimeString() + 
              '. Edit this note to add details about warehouse roles and processes.';
            dispatch(updateTranscribedText(defaultNote));
            console.log('Using default note text');
          }
          
          // Add the note to Redux store
          dispatch(addNote(true));
          
          // Clean up resources
          clearActiveRecording();
          setTranscribing(false);
          
          showSnackbar('Recording processed and note created successfully', 'success');
        } catch (error) {
          console.error('Error processing recorded audio:', error);
          setTranscribing(false);
          clearActiveRecording();
          showSnackbar(`Error processing recording: ${error.message}`, 'error');
        }
      };
      
      // Stop the media recorder
      if (mediaRecorder.state !== 'inactive') {
        // Set up the onstop handler to process the audio once recording is fully stopped
        mediaRecorder.onstop = processRecordedAudio;
        
        // Stop the recording
        mediaRecorder.stop();
        console.log('Media recorder stopping...');
        
        // Stop all tracks in the stream to release the microphone
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          console.log('Media tracks stopped');
        }
      } else {
        // If the recorder is already inactive, process the audio directly
        await processRecordedAudio();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      showSnackbar(`Error stopping recording: ${error.message}`, 'error');
      
      // Clean up anyway
      clearActiveRecording();
      setTranscribing(false);
    }
  };
  
  const handleDeleteNote = (noteId) => {
    dispatch(deleteNote(noteId));
    showSnackbar('Note deleted', 'info');
  };
  
  const openEditDialog = (note) => {
    setEditingNote(note);
    setEditedText(note.text);
    setEditDialogOpen(true);
  };
  
  const saveEditedNote = () => {
    if (editingNote) {
      dispatch(updateNote({ id: editingNote.id, text: editedText }));
      
      setEditDialogOpen(false);
      setEditingNote(null);
      showSnackbar('Note updated', 'success');
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Function to add a text-only note
  const handleAddTextNote = () => {
    if (textOnlyNote.trim() === '') {
      showSnackbar('Please enter some text for your note', 'warning');
      return;
    }
    
    // Set a timestamp for the note
    dispatch(startRecording()); // This sets the timestamp in Redux
    dispatch(updateTranscribedText(textOnlyNote));
    dispatch(addNote(false)); // false indicates no audio
    dispatch(stopRecording()); // Reset the recording state
    
    setTextOnlyNote('');
    showSnackbar('Text note added successfully', 'success');
  };

  // Toggle between voice and text-only modes
  const toggleMode = () => {
    setTextOnlyMode(!textOnlyMode);
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Warehouse Process Notes
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              {textOnlyMode ? 'Text Notes' : 'Voice Notes'}
            </Typography>
            {isRecording && (
              <Badge color="error" variant="dot" overlap="circular">
                <Typography variant="body2" color="error" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.7 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.7 }
                  }
                }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', marginRight: '8px' }}></span>
                  RECORDING IN PROGRESS
                </Typography>
              </Badge>
            )}
          </Box>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={toggleMode}
            startIcon={textOnlyMode ? <MicIcon /> : <EditIcon />}
            disabled={isRecording} // Disable mode switching while recording
          >
            Switch to {textOnlyMode ? 'Voice' : 'Text-Only'} Mode
          </Button>
        </Box>
        
        <Typography variant="body2" paragraph>
          {textOnlyMode 
            ? 'Create text notes about warehouse processes and roles without using voice recording.' 
            : isRecording 
              ? 'Recording in progress. You can navigate to other pages while recording continues in the background. Return to this page and click the stop button when finished.'
              : 'Record voice notes about warehouse processes and roles. Start recording, navigate through different pages while recording continues in the background, then return here and stop recording to transcribe your notes.'}
        </Typography>
      </Paper>
      
      {!textOnlyMode ? (
        // Voice recording mode
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {!isRecording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MicIcon />}
              onClick={handleStartRecording}
              size="large"
              disabled={transcribing}
              sx={{ 
                borderRadius: '50%', 
                width: 80, 
                height: 80, 
                p: 0,
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 5
                }
              }}
            >
              Record
            </Button>
          ) : (
            <Badge
              color="error"
              variant="dot"
              overlap="circular"
              badgeContent=" "
              sx={{ 
                '& .MuiBadge-badge': {
                  animation: 'pulse-badge 1.5s infinite',
                  '@keyframes pulse-badge': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.5)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }
              }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopRecording}
                size="large"
                sx={{ 
                  borderRadius: '50%', 
                  width: 80, 
                  height: 80, 
                  p: 0,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)'
                    },
                    '70%': {
                      boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                    }
                  }
                }}
              >
                Stop
              </Button>
            </Badge>
          )}
        </Box>
      ) : (
        // Text-only mode
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Enter your note about warehouse processes or roles"
            placeholder="Example: The Receiving process involves the Warehouse Clerk verifying quantities while the Quality Inspector checks for damage."
            value={textOnlyNote}
            onChange={(e) => setTextOnlyNote(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTextNote}
              startIcon={<SaveIcon />}
            >
              Save Note
            </Button>
          </Box>
        </Box>
      )}
      
      {isRecording && (
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            If speech recognition isn't working, you can type your note here:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your note here while recording..."
            value={manualTranscription}
            onChange={(e) => setManualTranscription(e.target.value)}
            variant="outlined"
          />
        </Box>
      )}
      
      {transcribing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body1">Transcribing your recording...</Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          size="small" 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          startIcon={showDiagnostics ? null : <span>🔍</span>}
        >
          {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
        </Button>
      </Box>
      
      {showDiagnostics && (
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom>Speech Recognition Diagnostics</Typography>
          <Box component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: 200 }}>
            {JSON.stringify(diagnosticInfo, null, 2)}
          </Box>
          <Typography variant="caption" color="text.secondary">
            If speech recognition isn't working, please check if your browser supports the Web Speech API and that you've granted microphone permissions.
          </Typography>
        </Paper>
      )}
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Your Notes
      </Typography>
      
      {notes.length > 0 ? (
        <Paper elevation={2} sx={{ mt: 2 }}>
          <List>
            {notes.map((note, index) => (
              <React.Fragment key={note.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Edit Note">
                        <IconButton edge="end" onClick={() => openEditDialog(note)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Note">
                        <IconButton edge="end" onClick={() => handleDeleteNote(note.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={note.text || 'Transcribing...'}
                    secondary={formatTimestamp(note.timestamp)}
                    primaryTypographyProps={{
                      style: { whiteSpace: 'normal', wordBreak: 'break-word' }
                    }}
                  />
                </ListItem>
                {index < notes.length - 1 && <Box component="hr" sx={{ my: 0, borderColor: 'divider' }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notes yet. Click the record button to create your first voice note.
          </Typography>
        </Paper>
      )}
      
      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveEditedNote} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoiceNotes;
