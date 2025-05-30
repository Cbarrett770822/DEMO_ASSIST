import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PresentationSettings from './PresentationSettings';
import ProcessManagement from './ProcessManagement';
import UserManagement from './UserManagement';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import { clearProcesses } from '../../services/storageService';
import processData from '../../features/processes/data/processData';
import { selectProcesses, updateProcesses } from '../../features/processes/processesSlice';
import { selectIsAdmin } from '../../features/auth/authSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const processes = useSelector(selectProcesses);
  const isAdmin = useSelector(selectIsAdmin);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedStep, setSelectedStep] = useState('');
  const [videoSource, setVideoSource] = useState('online');
  const [videoUrl, setVideoUrl] = useState('');
  const [localVideoPath, setLocalVideoPath] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Reset step selection when process changes
  useEffect(() => {
    setSelectedStep('');
  }, [selectedProcess]);

  // Get the current process object
  const currentProcess = selectedProcess 
    ? processes.find(p => p.id === selectedProcess) 
    : null;

  // Get the current step object
  const currentStep = currentProcess && selectedStep !== '' 
    ? currentProcess.steps[selectedStep] 
    : null;

  // Handle process selection
  const handleProcessChange = (event) => {
    setSelectedProcess(event.target.value);
  };

  // Handle step selection
  const handleStepChange = (event) => {
    setSelectedStep(event.target.value);
    
    // Load the current video URL if it exists
    if (currentProcess && currentProcess.steps[event.target.value]) {
      const step = currentProcess.steps[event.target.value];
      if (step.videoUrl) {
        if (step.videoUrl.startsWith('http')) {
          setVideoSource('online');
          setVideoUrl(step.videoUrl);
          setLocalVideoPath('');
        } else {
          setVideoSource('local');
          setLocalVideoPath(step.videoUrl);
          setVideoUrl('');
        }
      } else {
        setVideoSource('online');
        setVideoUrl('');
        setLocalVideoPath('');
      }
    }
  };

  // Handle video source change
  const handleVideoSourceChange = (event) => {
    setVideoSource(event.target.value);
    if (event.target.value === 'online') {
      setLocalVideoPath('');
    } else {
      setVideoUrl('');
    }
  };

  // Handle online video URL change
  const handleVideoUrlChange = (event) => {
    setVideoUrl(event.target.value);
  };

  // Handle local video path change
  const handleLocalVideoPathChange = (event) => {
    setLocalVideoPath(event.target.value);
  };

  // Handle save button click
  // Handle reset to default video assignments
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all video assignments to their default values? This cannot be undone.')) {
      // Clear localStorage
      clearProcesses();
      
      // Dispatch action to update processes with default data
      dispatch(updateProcesses([...processData]));
      
      // Show success message
      setSnackbarMessage('All video assignments have been reset to default values');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Reset form
      setSelectedProcess('');
      setSelectedStep('');
      setVideoUrl('');
      setLocalVideoPath('');
      
      // Reload the page after a short delay to ensure everything is reset
      setTimeout(() => {
        navigate(0); // This will refresh the page
      }, 1500);
    }
  };

  const handleSave = () => {
    if (!selectedProcess || selectedStep === '') {
      setSnackbarMessage('Please select a process and step first');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (videoSource === 'online' && !videoUrl) {
      setSnackbarMessage('Please enter a valid video URL');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (videoSource === 'local' && !localVideoPath) {
      setSnackbarMessage('Please enter a valid local video path');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Create a copy of the processes array
    const updatedProcesses = [...processes];
    
    // Find the process to update
    const processIndex = updatedProcesses.findIndex(p => p.id === selectedProcess);
    
    if (processIndex !== -1) {
      // Create a copy of the process steps array
      const updatedSteps = [...updatedProcesses[processIndex].steps];
      
      // Update the video URL for the selected step
      updatedSteps[selectedStep] = {
        ...updatedSteps[selectedStep],
        videoUrl: videoSource === 'online' ? videoUrl : localVideoPath
      };
      
      // Update the process with the new steps array
      updatedProcesses[processIndex] = {
        ...updatedProcesses[processIndex],
        steps: updatedSteps
      };
      
      // Dispatch an action to update the processes in the Redux store
      dispatch(updateProcesses(updatedProcesses));
      
      // Show success message
      setSnackbarMessage('Video assignment saved successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Video Assignment
          </Typography>
          <Typography variant="body1" paragraph>
            Assign videos to each step of the warehouse processes. You can use online videos (YouTube, Vimeo, etc.) or local videos from your hard drive.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="process-select-label">Process</InputLabel>
                <Select
                  labelId="process-select-label"
                  id="process-select"
                  value={selectedProcess}
                  label="Process"
                  onChange={handleProcessChange}
                >
                  {processes.map((process) => (
                    <MenuItem key={process.id} value={process.id}>
                      {process.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedProcess}>
                <InputLabel id="step-select-label">Step</InputLabel>
                <Select
                  labelId="step-select-label"
                  id="step-select"
                  value={selectedStep}
                  label="Step"
                  onChange={handleStepChange}
                >
                  {currentProcess && currentProcess.steps.map((step, index) => (
                    <MenuItem key={index} value={index}>
                      {step.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset" disabled={!selectedProcess || selectedStep === ''}>
              <FormLabel component="legend">Video Source</FormLabel>
              <RadioGroup
                row
                name="video-source"
                value={videoSource}
                onChange={handleVideoSourceChange}
              >
                <FormControlLabel value="online" control={<Radio />} label="Online Video" />
                <FormControlLabel value="local" control={<Radio />} label="Local Video" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          {videoSource === 'online' && (
            <TextField
              fullWidth
              label="Video URL (YouTube, Vimeo, etc.)"
              variant="outlined"
              value={videoUrl}
              onChange={handleVideoUrlChange}
              disabled={!selectedProcess || selectedStep === ''}
              placeholder="https://www.youtube.com/watch?v=..."
              sx={{ mb: 3 }}
            />
          )}
          
          {videoSource === 'local' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Local Video Path"
                variant="outlined"
                value={localVideoPath}
                onChange={handleLocalVideoPathChange}
                disabled={!selectedProcess || selectedStep === ''}
                placeholder="videos/my-video.mp4"
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Note: Local videos should be placed in the 'public/videos' folder of the application.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!selectedProcess || selectedStep === '' || (videoSource === 'online' && !videoUrl) || (videoSource === 'local' && !localVideoPath)}
            >
              Save Video Assignment
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
          </Box>
        </Paper>
        
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Process Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ProcessManagement />
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Presentation Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PresentationSettings />
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Bulk Video Upload</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Upload multiple videos at once for batch processing. This feature is coming soon.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              disabled
            >
              Upload Videos
            </Button>
          </AccordionDetails>
        </Accordion>
        
        {isAdmin && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">User Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <UserManagement />
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
