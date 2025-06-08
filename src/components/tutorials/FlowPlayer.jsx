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
  const [videoError, setVideoError] = useState(false);

  // Reset video error state when current step changes
  useEffect(() => {
    setVideoError(false);
  }, [currentStep, process]);

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
  
  // Initialize video variables
  let videoUrl = '';
  let isGoogleDrive = false;
  let youtubeEmbedUrl = null;
  let isYouTube = false;
  let googleDriveEmbedUrl = null;
  // Using the videoError state instead of a local variable
  
  // Helper function to sanitize URLs for CSP compliance
  const sanitizeUrl = (url) => {
    if (!url) return '';
    try {
      // Create a URL object to validate and sanitize the URL
      const urlObj = new URL(url);
      // Only allow specific domains for security
      if (['youtube.com', 'www.youtube.com', 'youtu.be', 'drive.google.com', 'docs.google.com'].includes(urlObj.hostname) ||
          urlObj.hostname.endsWith('.googleapis.com')) {
        return url;
      }
      // For other domains, check if it's a relative URL
      if (urlObj.hostname === window.location.hostname) {
        return url;
      }
      console.warn('Potentially unsafe URL blocked:', url);
      return '';
    } catch (error) {
      // If URL parsing fails, check if it's a relative path
      if (url.startsWith('/')) {
        return url;
      }
      console.error('Invalid URL:', url, error);
      return '';
    }
  };
  
  if (currentStepData && currentStepData.videoUrl) {
    try {
      // Handle different video URL formats
      if (typeof currentStepData.videoUrl === 'string') {
        const rawUrl = currentStepData.videoUrl.trim();
        
        if (rawUrl.startsWith('http')) {
          // Check if it's a Google Drive URL
          if (rawUrl.includes('drive.google.com') || rawUrl.includes('docs.google.com')) {
            isGoogleDrive = true;
            videoUrl = sanitizeUrl(rawUrl);
            
            // Extract Google Drive file ID
            const fileId = extractGoogleDriveFileId(rawUrl);
            
            if (fileId) {
              // Create a proper Google Drive embed URL that works with CSP
              googleDriveEmbedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
              console.log('Created Google Drive embed URL:', googleDriveEmbedUrl);
              
              // If there's a fallback video URL provided (should be YouTube), use that as well
              if (currentStepData.fallbackVideoUrl) {
                const fallbackYoutubeId = extractYoutubeId(currentStepData.fallbackVideoUrl);
                if (fallbackYoutubeId) {
                  youtubeEmbedUrl = `https://www.youtube.com/embed/${fallbackYoutubeId}?autoplay=0&rel=0&showinfo=1&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;
                  console.log('Using YouTube fallback URL:', youtubeEmbedUrl);
                }
              }
            } else {
              console.error('Could not extract Google Drive file ID from URL:', rawUrl);
              setVideoError(true);
            }
          } else if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
            // Handle YouTube videos
            isYouTube = true;
            videoUrl = sanitizeUrl(rawUrl);
            
            // Extract YouTube video ID
            const youtubeId = extractYoutubeId(rawUrl);
            if (youtubeId) {
              youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&showinfo=1&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;
              console.log('Created YouTube embed URL:', youtubeEmbedUrl);
            } else {
              console.error('Could not extract YouTube video ID from URL:', rawUrl);
              setVideoError(true);
            }
          } else {
            // Other external videos - apply sanitization
            videoUrl = sanitizeUrl(rawUrl);
            if (!videoUrl) {
              console.warn('External video URL blocked by sanitizer:', rawUrl);
              setVideoError(true);
            }
          }
        } else {
          // For local videos, ensure we have the correct path
          videoUrl = `/videos/${rawUrl}`;
          console.log('Using local video path:', videoUrl);
        }
      }
    } catch (error) {
      console.error('Error processing video URL:', error);
      setVideoError(true);
    }
  }
  
  // Use process-level video URL as fallback if no step-specific video
  if ((!videoUrl || videoError) && process.videoUrl) {
    try {
      console.log('Using process-level video URL as fallback');
      // Reset video variables
      videoUrl = '';
      isGoogleDrive = false;
      youtubeEmbedUrl = null;
      isYouTube = false;
      googleDriveEmbedUrl = null;
      setVideoError(false);
      
      // Use process-level video URL as fallback
      if (typeof process.videoUrl === 'string') {
        const rawUrl = process.videoUrl.trim();
        
        if (rawUrl.startsWith('http')) {
          // Check if it's a Google Drive URL
          if (rawUrl.includes('drive.google.com') || rawUrl.includes('docs.google.com')) {
            isGoogleDrive = true;
            videoUrl = sanitizeUrl(rawUrl);
            
            // Extract Google Drive file ID
            const fileId = extractGoogleDriveFileId(rawUrl);
            
            if (fileId) {
              // Create a proper Google Drive embed URL that works with CSP
              googleDriveEmbedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
              console.log('Created Google Drive embed URL from process:', googleDriveEmbedUrl);
              
              // If there's a fallback video URL provided (should be YouTube), use that as well
              if (process.fallbackVideoUrl) {
                const fallbackYoutubeId = extractYoutubeId(process.fallbackVideoUrl);
                if (fallbackYoutubeId) {
                  youtubeEmbedUrl = `https://www.youtube.com/embed/${fallbackYoutubeId}?autoplay=0&rel=0&showinfo=1&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;
                  console.log('Using YouTube fallback URL from process:', youtubeEmbedUrl);
                }
              }
            } else {
              console.error('Could not extract Google Drive file ID from process URL:', rawUrl);
              setVideoError(true);
            }
          } else if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
            // Handle YouTube videos
            isYouTube = true;
            videoUrl = sanitizeUrl(rawUrl);
            
            // Extract YouTube video ID
            const youtubeId = extractYoutubeId(rawUrl);
            if (youtubeId) {
              youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&showinfo=1&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;
              console.log('Created YouTube embed URL from process:', youtubeEmbedUrl);
            } else {
              console.error('Could not extract YouTube video ID from process URL:', rawUrl);
              setVideoError(true);
            }
          } else {
            // Other external videos - apply sanitization
            videoUrl = sanitizeUrl(rawUrl);
            if (!videoUrl) {
              console.warn('External process video URL blocked by sanitizer:', rawUrl);
              setVideoError(true);
            }
          }
        } else {
          // For local videos, ensure we have the correct path
          videoUrl = `/videos/${rawUrl}`;
          console.log('Using local video path from process:', videoUrl);
        }
      }
    } catch (error) {
      console.error('Error processing process-level video URL:', error);
      setVideoError(true);
    }
  }
  
  // Default video if none is specified
  if (!videoUrl) {
    videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  
  console.log('Current video URL:', videoUrl, 'Is Google Drive:', isGoogleDrive);
  
  // Function to extract Google Drive file ID from URL
  function extractGoogleDriveFileId(url) {
    if (!url) return null;
    
    try {
      // Handle different Google Drive URL formats
      let fileId = null;
      
      // Format: https://drive.google.com/file/d/FILE_ID/view
      if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^\/\?&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      // Format: https://drive.google.com/open?id=FILE_ID
      else if (url.includes('open?id=')) {
        const match = url.match(/open\?id=([^\/\?&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      // Format: https://docs.google.com/presentation/d/FILE_ID/edit
      else if (url.includes('/presentation/d/')) {
        const match = url.match(/\/presentation\/d\/([^\/\?&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      // Format: https://docs.google.com/document/d/FILE_ID/edit
      else if (url.includes('/document/d/')) {
        const match = url.match(/\/document\/d\/([^\/\?&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      // Format: https://drive.google.com/uc?id=FILE_ID
      else if (url.includes('drive.google.com/uc')) {
        const urlObj = new URL(url);
        fileId = urlObj.searchParams.get('id');
      }
      // Format: https://drive.google.com/drive/folders/FILE_ID
      else if (url.includes('/drive/folders/')) {
        const match = url.match(/\/drive\/folders\/([^\/\?&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
      
      // Clean up the file ID by removing any query parameters or hash
      if (fileId) {
        fileId = fileId.split('?')[0].split('#')[0];
      }
      
      console.log('Extracted Google Drive file ID:', fileId, 'from URL:', url);
      return fileId;
    } catch (error) {
      console.error('Error extracting Google Drive file ID:', error);
      return null;
    }
  }
  
  // Function to extract YouTube video ID from URL
  function extractYoutubeId(url) {
    if (!url) return null;
    
    try {
      let videoId = null;
      
      // Try to parse the URL properly first
      try {
        const urlObj = new URL(url);
        
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/watch')) {
          videoId = urlObj.searchParams.get('v');
        }
        // Format: https://www.youtube.com/embed/VIDEO_ID
        else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/embed/')) {
          const match = urlObj.pathname.match(/\/embed\/([^\/?&]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        // Format: https://youtu.be/VIDEO_ID
        else if (urlObj.hostname === 'youtu.be') {
          // The path starts with a slash, so we need to remove it
          videoId = urlObj.pathname.substring(1).split('/')[0];
        }
      } catch (urlError) {
        console.warn('Error parsing URL, falling back to regex:', urlError);
        
        // Fallback to regex if URL parsing fails
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        if (url.includes('youtube.com/watch')) {
          const match = url.match(/[?&]v=([^&]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        // Format: https://youtu.be/VIDEO_ID
        else if (url.includes('youtu.be/')) {
          const match = url.match(/youtu\.be\/([^\/?&]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        // Format: https://www.youtube.com/embed/VIDEO_ID
        else if (url.includes('youtube.com/embed/')) {
          const match = url.match(/\/embed\/([^\/?&]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
      }
      
      // Clean up the video ID by removing any query parameters or hash
      if (videoId) {
        videoId = videoId.split('?')[0].split('#')[0];
      }
      
      console.log('Extracted YouTube video ID:', videoId, 'from URL:', url);
      return videoId;
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
      return null;
    }
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
            {videoError ? (
              // Show error message if video URL processing failed
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Video Playback Error
                </Typography>
                <Typography variant="body2">
                  The video could not be loaded. Please check the URL or try a different video.
                </Typography>
              </Box>
            ) : isGoogleDrive && googleDriveEmbedUrl ? (
              // For Google Drive videos, use the proper Google Drive embed URL
              <iframe
                ref={iframeRef}
                src={googleDriveEmbedUrl}
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
                onError={(e) => {
                  console.error('Google Drive iframe error:', e);
                  // If Google Drive embed fails, try YouTube fallback if available
                  if (youtubeEmbedUrl) {
                    console.log('Falling back to YouTube embed');
                  }
                }}
              />
            ) : isGoogleDrive && youtubeEmbedUrl ? (
              // For Google Drive videos with YouTube fallback
              <iframe
                ref={iframeRef}
                src={youtubeEmbedUrl}
                width="100%"
                height="100%"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="YouTube Fallback Video"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : isYouTube && youtubeEmbedUrl ? (
              // For YouTube videos, use the embed URL for better performance and CSP compliance
              <iframe
                ref={iframeRef}
                src={youtubeEmbedUrl}
                width="100%"
                height="100%"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="YouTube Video"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : videoUrl ? (
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
                onError={(e) => {
                  console.error('ReactPlayer error:', e);
                  setVideoError(true);
                }}
              />
            ) : (
              // No valid video URL
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}
              >
                <Typography variant="body1">
                  No video available for this step.
                </Typography>
              </Box>
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
