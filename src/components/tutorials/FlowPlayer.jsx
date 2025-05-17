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
    // Get the player wrapper element instead of the internal player
    if (playerRef.current) {
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
  if (currentStepData && currentStepData.videoUrl) {
    videoUrl = typeof currentStepData.videoUrl === 'string' && currentStepData.videoUrl.startsWith('http') ?
      currentStepData.videoUrl : 
      `/videos/${currentStepData.videoUrl}`;
  } else if (process.videoUrl) {
    videoUrl = process.videoUrl;
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
              '& .react-player': {
                width: '100% !important',
                height: 'auto !important',
                aspectRatio: '16/9'
              }
            }}
          >
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              controls={false}
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
                  playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                },
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    disablePictureInPicture: true
                  }
                }
              }}
            />
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
