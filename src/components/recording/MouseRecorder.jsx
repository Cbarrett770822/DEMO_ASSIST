import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  startRecording, 
  stopRecording, 
  recordEvent, 
  startPlayback, 
  stopPlayback, 
  setPlaybackSpeed,
  deleteRecording,
  renameRecording,
  selectRecordings,
  selectIsRecording,
  selectIsPlaying,
  selectCurrentPlayback,
  selectPlaybackSpeed
} from '../../features/recording/recordingSlice';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Tooltip,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  FiberManualRecord as RecordIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Speed as SpeedIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const MouseRecorder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const recordings = useSelector(selectRecordings);
  const isRecording = useSelector(selectIsRecording);
  const isPlaying = useSelector(selectIsPlaying);
  const currentPlayback = useSelector(selectCurrentPlayback);
  const playbackSpeed = useSelector(selectPlaybackSpeed);
  
  const [recordingName, setRecordingName] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [speedDialogOpen, setSpeedDialogOpen] = useState(false);
  const [tempSpeed, setTempSpeed] = useState(1);
  
  const cursorRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  
  // Function to handle mouse movement recording
  const handleMouseMove = (e) => {
    if (isRecording) {
      dispatch(recordEvent({
        type: 'mousemove',
        x: e.clientX,
        y: e.clientY,
        path: window.location.pathname
      }));
    }
  };
  
  // Function to handle mouse click recording
  const handleMouseClick = (e) => {
    if (isRecording) {
      // Check if this is a navigation link click
      let isNavigation = false;
      let navigationPath = '';
      
      // Check if the click is on a link or within a link
      let targetElement = e.target;
      while (targetElement && targetElement !== document.body) {
        if (targetElement.tagName === 'A' && targetElement.getAttribute('href')) {
          isNavigation = true;
          navigationPath = targetElement.getAttribute('href');
          break;
        }
        targetElement = targetElement.parentElement;
      }
      
      dispatch(recordEvent({
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        target: e.target.tagName,
        path: window.location.pathname,
        isNavigation: isNavigation,
        navigationPath: navigationPath
      }));
    }
  };
  
  // Function to handle keyboard input recording
  const handleKeyPress = (e) => {
    if (isRecording) {
      // Don't record actual key values for security, just the fact that a key was pressed
      dispatch(recordEvent({
        type: 'keypress',
        key: e.key === 'Enter' ? 'Enter' : 'key',
        path: window.location.pathname
      }));
    }
  };
  
  // Function to handle scroll recording
  const handleScroll = () => {
    if (isRecording) {
      dispatch(recordEvent({
        type: 'scroll',
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        path: window.location.pathname
      }));
    }
  };
  
  // Function to handle starting a recording
  const handleStartRecording = () => {
    const name = recordingName.trim() || `Recording ${recordings.length + 1}`;
    dispatch(startRecording(name));
    setRecordingName('');
  };
  
  // Function to handle stopping a recording
  const handleStopRecording = () => {
    dispatch(stopRecording());
  };
  
  // Function to handle playing back a recording
  const handlePlayRecording = (id) => {
    dispatch(startPlayback(id));
  };
  
  // Function to handle stopping playback
  const handleStopPlayback = () => {
    dispatch(stopPlayback());
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    
    // Hide the cursor element
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
  };
  
  // Function to handle deleting a recording
  const handleDeleteRecording = (id) => {
    dispatch(deleteRecording(id));
  };
  
  // Function to open the edit dialog
  const handleOpenEditDialog = (id, name) => {
    setCurrentEditId(id);
    setEditName(name);
    setEditDialogOpen(true);
  };
  
  // Function to save the edited name
  const handleSaveEdit = () => {
    if (editName.trim()) {
      dispatch(renameRecording({
        id: currentEditId,
        name: editName.trim()
      }));
    }
    setEditDialogOpen(false);
  };
  
  // Function to open the speed dialog
  const handleOpenSpeedDialog = () => {
    setTempSpeed(playbackSpeed);
    setSpeedDialogOpen(true);
  };
  
  // Function to save the playback speed
  const handleSaveSpeed = () => {
    dispatch(setPlaybackSpeed(tempSpeed));
    setSpeedDialogOpen(false);
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Function to format duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Effect to add event listeners when recording
  useEffect(() => {
    if (isRecording) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleMouseClick);
      window.addEventListener('keypress', handleKeyPress);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleMouseClick);
        window.removeEventListener('keypress', handleKeyPress);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isRecording]);
  
  // Effect to handle playback
  useEffect(() => {
    if (isPlaying && currentPlayback) {
      // Create a cursor element if it doesn't exist
      if (!cursorRef.current) {
        const cursor = document.createElement('div');
        cursor.style.position = 'fixed';
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.borderRadius = '50%';
        cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        document.body.appendChild(cursor);
        cursorRef.current = cursor;
      }
      
      // Show the cursor
      cursorRef.current.style.display = 'block';
      
      // Play back the events
      let lastTimestamp = 0;
      
      const playEvents = async (events, index) => {
        if (!isPlaying || index >= events.length) {
          handleStopPlayback();
          return;
        }
        
        const event = events[index];
        const delay = index === 0 ? 0 : (event.timestamp - lastTimestamp) / playbackSpeed;
        
        // Use a promise to handle both synchronous and asynchronous event handling
        await new Promise(resolve => {
          playbackTimeoutRef.current = setTimeout(async () => {
            // Handle the event based on its type
            switch (event.type) {
            case 'mousemove':
              if (cursorRef.current) {
                cursorRef.current.style.left = `${event.x}px`;
                cursorRef.current.style.top = `${event.y}px`;
              }
              break;
            case 'click':
              if (cursorRef.current) {
                cursorRef.current.style.left = `${event.x}px`;
                cursorRef.current.style.top = `${event.y}px`;
                cursorRef.current.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                setTimeout(() => {
                  if (cursorRef.current) {
                    cursorRef.current.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                  }
                }, 200);
                
                // Handle navigation if this was a navigation click
                if (event.isNavigation && event.navigationPath) {
                  // Check if we need to navigate to a different page
                  if (location.pathname !== event.navigationPath) {
                    console.log(`Navigating to ${event.navigationPath} during playback`);
                    navigate(event.navigationPath);
                    
                    // Add a delay to allow the page to load before continuing
                    await new Promise(navResolve => setTimeout(navResolve, 500));
                  }
                }
              }
              break;
            case 'scroll':
              window.scrollTo(event.scrollX, event.scrollY);
              break;
            default:
              break;
            }
            
            lastTimestamp = event.timestamp;
            resolve();
          }, delay);
        });
        
        // Continue to the next event
        await playEvents(events, index + 1);
      };
      
      playEvents(currentPlayback.events, 0);
      
      return () => {
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current);
        }
      };
    }
  }, [isPlaying, currentPlayback, playbackSpeed]);
  
  // Effect to clean up cursor element on unmount
  useEffect(() => {
    return () => {
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
      }
    };
  }, []);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mouse and Input Recording
        </Typography>
        
        <Typography variant="body2" paragraph>
          Record your mouse movements and interactions to demonstrate warehouse processes. 
          You can play back recordings to show how to navigate through the system.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {!isRecording ? (
            <>
              <TextField
                label="Recording Name"
                variant="outlined"
                size="small"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                sx={{ mr: 2, flexGrow: 1 }}
                placeholder="Enter a name for your recording"
              />
              <Button
                variant="contained"
                color="error"
                startIcon={<RecordIcon />}
                onClick={handleStartRecording}
              >
                Start Recording
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <RecordIcon color="error" sx={{ mr: 1, animation: 'pulse 1.5s infinite' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Recording in progress...
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<StopIcon />}
                onClick={handleStopRecording}
              >
                Stop Recording
              </Button>
            </>
          )}
        </Box>
      </Paper>
      
      {isPlaying && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayIcon sx={{ mr: 1, animation: 'pulse 1.5s infinite' }} />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Playing: {currentPlayback?.name}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Change Playback Speed">
              <IconButton 
                color="inherit" 
                onClick={handleOpenSpeedDialog}
                sx={{ mr: 1 }}
              >
                <SpeedIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<StopIcon />}
              onClick={handleStopPlayback}
            >
              Stop Playback
            </Button>
          </Box>
        </Paper>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saved Recordings
        </Typography>
        
        {recordings.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', py: 2 }}>
            No recordings yet. Start recording to capture your interactions.
          </Typography>
        ) : (
          <List>
            {recordings.map((recording) => (
              <React.Fragment key={recording.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Play Recording">
                        <IconButton 
                          edge="end" 
                          color="primary"
                          onClick={() => handlePlayRecording(recording.id)}
                          disabled={isPlaying || isRecording}
                        >
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Name">
                        <IconButton 
                          edge="end" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(recording.id, recording.name)}
                          disabled={isPlaying || isRecording}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Recording">
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleDeleteRecording(recording.id)}
                          disabled={isPlaying || isRecording}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={recording.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="textSecondary">
                          Recorded on: {formatDate(recording.startTime)}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="textSecondary">
                          Duration: {formatDuration(recording.duration)}
                        </Typography>
                        <br />
                        <Chip 
                          size="small" 
                          label={`${recording.events.length} events`} 
                          sx={{ mt: 1, mr: 1 }} 
                        />
                        <Chip 
                          size="small" 
                          label={recording.path} 
                          sx={{ mt: 1 }} 
                        />
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Recording Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Recording Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Speed Dialog */}
      <Dialog open={speedDialogOpen} onClose={() => setSpeedDialogOpen(false)}>
        <DialogTitle>Playback Speed</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 300, mt: 2 }}>
            <Typography gutterBottom>
              Speed: {tempSpeed}x
            </Typography>
            <Slider
              value={tempSpeed}
              min={0.25}
              max={2}
              step={0.25}
              marks={[
                { value: 0.25, label: '0.25x' },
                { value: 1, label: '1x' },
                { value: 2, label: '2x' }
              ]}
              onChange={(_, newValue) => setTempSpeed(newValue)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpeedDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveSpeed} color="primary" startIcon={<SaveIcon />}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default MouseRecorder;
