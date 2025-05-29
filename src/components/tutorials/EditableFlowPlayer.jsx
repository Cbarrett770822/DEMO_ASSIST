import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactPlayer from 'react-player';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import {
  selectSelectedProcess,
  selectCurrentStep,
  setCurrentStep,
  nextStep,
  previousStep,
  setVideoPlaying,
  updateProcess
} from '../../features/processes/processesSlice';

const EditableFlowPlayer = () => {
  const dispatch = useDispatch();
  const process = useSelector(selectSelectedProcess);
  const currentStep = useSelector(selectCurrentStep);
  const isPlaying = useSelector(state => state.processes.isVideoPlaying);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State for editing steps
  const [steps, setSteps] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditStep, setCurrentEditStep] = useState(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepDescription, setEditStepDescription] = useState('');
  const [editStepVideoUrl, setEditStepVideoUrl] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepVideoUrl, setNewStepVideoUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Initialize steps from process data
  useEffect(() => {
    if (process && process.steps) {
      setSteps([...process.steps]);
    }
  }, [process]);

  // If no process is selected, show a message
  if (!process) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">No process selected</Typography>
      </Box>
    );
  }
  
  // Make sure steps is initialized
  if (steps.length === 0 && process.steps && process.steps.length > 0) {
    setSteps([...process.steps]);
  }

  const currentStepData = steps[currentStep];
  const videoUrl = currentStepData?.videoUrl || '';
  const isGoogleDrive = videoUrl && videoUrl.includes('drive.google.com');

  const handleStepChange = (step) => {
    dispatch(setCurrentStep(step));
    dispatch(setVideoPlaying(true));
  };

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handlePlayPause = () => {
    dispatch(setVideoPlaying(!isPlaying));
  };

  const handleFullscreen = () => {
    if (isGoogleDrive && iframeRef.current) {
      // Handle fullscreen for Google Drive iframe
      const iframe = iframeRef.current;
      
      if (document.fullscreenElement) {
        // Exit fullscreen if already in fullscreen mode
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        // Enter fullscreen for iframe
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
          iframe.webkitRequestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
          iframe.mozRequestFullScreen();
        } else if (iframe.msRequestFullscreen) {
          iframe.msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } else if (playerRef.current) {
      // Handle fullscreen for ReactPlayer
      const playerWrapper = playerRef.current.wrapper;
      
      if (playerWrapper) {
        if (document.fullscreenElement) {
          // Exit fullscreen if already in fullscreen mode
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          setIsFullscreen(false);
        } else {
          // Enter fullscreen and auto-play video
          if (playerWrapper.requestFullscreen) {
            playerWrapper.requestFullscreen();
          } else if (playerWrapper.webkitRequestFullscreen) {
            playerWrapper.webkitRequestFullscreen();
          } else if (playerWrapper.mozRequestFullScreen) {
            playerWrapper.mozRequestFullScreen();
          } else if (playerWrapper.msRequestFullscreen) {
            playerWrapper.msRequestFullscreen();
          }
          setIsFullscreen(true);
          dispatch(setVideoPlaying(true));
        }
      }
    }
  };

  // Function to extract Google Drive file ID from URL
  const extractGoogleDriveFileId = (url) => {
    if (!url) return null;
    
    // Handle different Google Drive URL formats
    let fileId = null;
    
    // Format: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
      const match = url.match(/open\?id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Format: https://docs.google.com/document/d/FILE_ID/edit
    else if (url.includes('/document/d/')) {
      const match = url.match(/\/document\/d\/([^\/]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Format: https://drive.google.com/uc?id=FILE_ID
    else if (url.includes('uc?id=')) {
      const match = url.match(/uc\?id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    
    return fileId;
  };

  // Functions for editing steps
  const handleEditStep = (index) => {
    setCurrentEditStep(index);
    setEditStepTitle(steps[index].title || '');
    setEditStepDescription(steps[index].description || '');
    setEditStepVideoUrl(steps[index].videoUrl || '');
    setEditDialogOpen(true);
  };

  const handleSaveEditStep = () => {
    if (editStepTitle.trim()) {
      const updatedSteps = [...steps];
      updatedSteps[currentEditStep] = {
        ...updatedSteps[currentEditStep],
        title: editStepTitle.trim(),
        description: editStepDescription.trim(),
        videoUrl: editStepVideoUrl.trim()
      };
      
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      setEditDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Step updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = [...steps];
      updatedSteps.splice(index, 1);
      
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      
      // If we're deleting the current step, adjust the current step
      if (currentStep >= updatedSteps.length) {
        dispatch(setCurrentStep(updatedSteps.length - 1));
      }
      
      // Show success message
      setSnackbarMessage('Step deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      // Show error message if trying to delete the only step
      setSnackbarMessage('Cannot delete the only step in the process');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAddStep = () => {
    setNewStepTitle('');
    setNewStepDescription('');
    setNewStepVideoUrl('');
    setAddDialogOpen(true);
  };

  const handleSaveNewStep = () => {
    if (newStepTitle.trim()) {
      const newStep = {
        title: newStepTitle.trim(),
        description: newStepDescription.trim(),
        videoUrl: newStepVideoUrl.trim()
      };
      
      const updatedSteps = [...steps, newStep];
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      setAddDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('New step added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const saveProcessSteps = (updatedSteps) => {
    // Create updated process with new steps
    const updatedProcess = {
      ...process,
      steps: updatedSteps
    };
    
    // Dispatch update action
    dispatch(updateProcess(updatedProcess));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {process.title} Process Flow
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddStep}
        >
          Add New Step
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          <Paper
            elevation={3}
            sx={{
              position: 'relative',
              pt: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden'
            }}
          >
            {isGoogleDrive ? (
              // Google Drive iframe for videos
              <iframe
                ref={iframeRef}
                src={videoUrl && extractGoogleDriveFileId(videoUrl) ? 
                  `https://drive.google.com/file/d/${extractGoogleDriveFileId(videoUrl)}/preview` : 
                  ''}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              // ReactPlayer for YouTube and other video sources
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                playing={isPlaying}
                controls={true}
                onEnded={() => {
                  if (currentStep < process.steps.length - 1) {
                    dispatch(nextStep());
                  } else {
                    dispatch(setVideoPlaying(false));
                  }
                }}
                className="react-player"
                config={{
                  youtube: {
                    playerVars: { 
                      showinfo: 1, 
                      controls: 1, 
                      modestbranding: 1,
                      origin: window.location.origin 
                    }
                  },
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true
                    },
                    forceVideo: true
                  }
                }}
                onError={(e) => console.error('ReactPlayer error:', e)}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1
              }}
            >
              <Box>
                <IconButton color="primary" onClick={handlePlayPause}>
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton color="primary" onClick={handleBack} disabled={currentStep === 0}>
                  <SkipPreviousIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                >
                  <SkipNextIcon />
                </IconButton>
              </Box>
              {currentStepData && (
                <Typography variant="caption" sx={{ color: 'white' }}>
                  Step {currentStep + 1} of {steps.length}: {currentStepData.title}
                </Typography>
              )}
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton color="primary" onClick={handleFullscreen}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '40%' } }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Process Flow
            </Typography>
            <Stepper activeStep={currentStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.title || `step-${index}`}>
                  <StepLabel
                    onClick={() => handleStepChange(index)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {step.title}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 1 }}>
                      <Box>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === steps.length - 1}
                        >
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </Box>
                      <Box>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStep(index);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStep(index);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>
      </Box>

      {/* Edit Step Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Process Step</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Step Title"
            fullWidth
            value={editStepTitle}
            onChange={(e) => setEditStepTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Step Description"
            fullWidth
            value={editStepDescription}
            onChange={(e) => setEditStepDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Video URL (YouTube or Google Drive)"
            fullWidth
            value={editStepVideoUrl}
            onChange={(e) => setEditStepVideoUrl(e.target.value)}
            helperText="Enter a YouTube URL or Google Drive link"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEditStep} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Step Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Process Step</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Step Title"
            fullWidth
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Step Description"
            fullWidth
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Video URL (YouTube or Google Drive)"
            fullWidth
            value={newStepVideoUrl}
            onChange={(e) => setNewStepVideoUrl(e.target.value)}
            helperText="Enter a YouTube URL or Google Drive link"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNewStep} variant="contained" color="primary">
            Add Step
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditableFlowPlayer;
