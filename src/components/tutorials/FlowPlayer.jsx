import React, { useState, useRef } from 'react';
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
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import {
  selectSelectedProcess,
  selectCurrentStep,
  setCurrentStep,
  nextStep,
  previousStep,
  setVideoPlaying
} from '../../features/processes/processesSlice';

const FlowPlayer = () => {
  const dispatch = useDispatch();
  const process = useSelector(selectSelectedProcess);
  const currentStep = useSelector(selectCurrentStep);
  const isPlaying = useSelector(state => state.processes.isVideoPlaying);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If no process is selected, show a message
  if (!process) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">No process selected</Typography>
      </Box>
    );
  }

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
          // Auto-play video when entering fullscreen
          if (!isPlaying) {
            dispatch(setVideoPlaying(true));
          }
        }
      }
    }
  };

  // Safe access to current step
  const currentStepData = process.steps && process.steps[currentStep] ? process.steps[currentStep] : null;
  
  // Safe access to video URL
  let videoUrl = '';
  let isGoogleDrive = false;
  
  if (currentStepData && currentStepData.videoUrl) {
    // Handle different video URL formats
    if (typeof currentStepData.videoUrl === 'string') {
      if (currentStepData.videoUrl.startsWith('http')) {
        // Check if it's a Google Drive URL
        if (currentStepData.videoUrl.includes('drive.google.com')) {
          isGoogleDrive = true;
          // Convert Google Drive link to direct download link
          const fileId = extractGoogleDriveFileId(currentStepData.videoUrl);
          if (fileId) {
            videoUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          } else {
            videoUrl = currentStepData.videoUrl;
          }
        } else {
          videoUrl = currentStepData.videoUrl;
        }
      } else {
        // For local videos, ensure we have the correct path
        videoUrl = `/videos/${currentStepData.videoUrl}`;
      }
    }
  } else if (process.videoUrl) {
    // Use process-level video URL as fallback
    if (typeof process.videoUrl === 'string') {
      if (process.videoUrl.startsWith('http')) {
        // Check if it's a Google Drive URL
        if (process.videoUrl.includes('drive.google.com')) {
          isGoogleDrive = true;
          // Convert Google Drive link to direct download link
          const fileId = extractGoogleDriveFileId(process.videoUrl);
          if (fileId) {
            videoUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          } else {
            videoUrl = process.videoUrl;
          }
        } else {
          videoUrl = process.videoUrl;
        }
      } else {
        videoUrl = `/videos/${process.videoUrl}`;
      }
    }
  }
  
  // Default video if none is specified
  if (!videoUrl) {
    videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  
  console.log('Current video URL:', videoUrl, 'Is Google Drive:', isGoogleDrive);
  
  // Function to extract Google Drive file ID from URL
  function extractGoogleDriveFileId(url) {
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
      const match = url.match(/open\?id=([^\/&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Format: https://docs.google.com/presentation/d/FILE_ID/edit
    else if (url.includes('/presentation/d/')) {
      const match = url.match(/\/presentation\/d\/([^\/]+)/);
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
    
    return fileId;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {process.title} Flow
      </Typography>
      
      <Typography variant="body1" paragraph>
        {process.description}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              '& .react-player': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100% !important',
                height: '100% !important'
              }
            }}
          >
            {isGoogleDrive ? (
              // For Google Drive videos, use an iframe with direct embed URL
              <iframe
                ref={iframeRef}
                src={videoUrl.replace('uc?export=download&id=', 'file/d/').concat('/preview')}
                width="100%"
                height="100%"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="Google Drive Video"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : (
              // For other videos, use ReactPlayer
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                playing={isPlaying}
                controls={true}
                width="100%"
                height="100%"
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
                  disabled={currentStep === process.steps.length - 1}
                >
                  <SkipNextIcon />
                </IconButton>
              </Box>
              {currentStepData && (
                <Typography variant="caption" sx={{ color: 'white' }}>
                  Step {currentStep + 1} of {process.steps.length}: {currentStepData.title}
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
              {process.steps && process.steps.map((step, index) => (
                <Step key={step.title || `step-${index}`}>
                  <StepLabel
                    onClick={() => handleStepChange(index)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {step.title}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === process.steps.length - 1}
                        >
                          {index === process.steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default FlowPlayer;
