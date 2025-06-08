import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  Button, 
  CircularProgress, 
  Tabs, 
  Tab,
  Link,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getPresentationViewMode, setPresentationViewMode } from '../../services/settingsService';

const PptViewer = ({ presentation, width = '100%', height = '600px' }) => {
  const [viewerUrl, setViewerUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [isLocalFile, setIsLocalFile] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(getPresentationViewMode()); // Load from settings
  const [iframeError, setIframeError] = useState(false);
  
  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true);
    setLoading(false);
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    setLoading(false);
    setIframeError(false);
  };

  // Handle tab change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
    // Save preference to settings
    setPresentationViewMode(newValue);
  };
  
  useEffect(() => {
    if (!presentation) return;
    
    setLoading(true);
    setIframeError(false);
    
    // Check if this is a local file or URL
    if (presentation.isLocal) {
      setIsLocalFile(true);
      // For local files, we use the local path directly
      // The file should be in the public folder
      const localPath = `${process.env.PUBLIC_URL}/${presentation.url}`;
      setDirectUrl(localPath);
      setViewerUrl(''); // No viewer for local files
      setLoading(false);
    } else {
      setIsLocalFile(false);
      
      // Process cloud storage links
      let finalUrl = presentation.url;
      
      // Handle Dropbox links
      if (presentation.url.includes('dropbox.com')) {
        // Convert dropbox.com/s/ links to dropbox.com/s/dl/ links for direct download
        finalUrl = presentation.url.replace('www.dropbox.com/s/', 'www.dropbox.com/s/dl/');
        // Remove any query parameters
        finalUrl = finalUrl.split('?')[0];
      }
      
      // Handle Google Drive links
      else if (presentation.url.includes('drive.google.com/file/d/')) {
        // Extract the file ID from the Google Drive link
        const fileIdMatch = presentation.url.match(/\/file\/d\/([^\/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          // Create a direct download link
          finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }
      
      // Handle Google Slides presentations
      else if (presentation.url.includes('docs.google.com/presentation/d/')) {
        // Extract the presentation ID
        const presentationIdMatch = presentation.url.match(/\/presentation\/d\/([^\/]+)/);
        if (presentationIdMatch && presentationIdMatch[1]) {
          const presentationId = presentationIdMatch[1];
          // Create an export link for the presentation in PPTX format
          finalUrl = `https://docs.google.com/presentation/d/${presentationId}/export/pptx`;
        }
      }
      
      // Handle AWS S3 and other direct links
      // Make sure URL ends with .ppt, .pptx, or other Office formats
      const isOfficeFile = /\.(ppt|pptx|doc|docx|xls|xlsx)$/i.test(finalUrl);
      if (!isOfficeFile) {
        setError('The URL does not appear to be a valid Office document. Please check the URL format.');
      }
      
      // Store the direct URL for download option
      setDirectUrl(finalUrl);
      
      // For online files, use Microsoft Office Online viewer
      const encodedUrl = encodeURIComponent(finalUrl);
      setViewerUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`);
    }
  }, [presentation]);
  
  if (!presentation) {
    return (
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          No presentation selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a presentation from the list to view it.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {presentation.title}
      </Typography>
      {presentation.description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {presentation.description}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isLocalFile ? (
        <Box sx={{ width: '100%', height: height, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', p: 4, borderRadius: 2 }}>
          <Alert severity="info" sx={{ mb: 4, width: '100%' }}>
            This is a local PowerPoint file. Microsoft Office Online viewer cannot display local files directly.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Options for viewing this presentation:
          </Typography>
          
          <Box sx={{ mt: 2, mb: 4, width: '100%' }}>
            <Typography variant="body1" paragraph>
              1. <strong>Download and open locally:</strong>
            </Typography>
            <Button 
              variant="contained" 
              href={directUrl} 
              target="_blank"
              startIcon={<DownloadIcon />}
              sx={{ mb: 3 }}
            >
              Download Presentation
            </Button>
            
            <Typography variant="body1" paragraph sx={{ mt: 3 }}>
              2. <strong>Upload to a cloud service</strong> (like OneDrive, Google Drive) and use the public link instead.
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Tabs 
            value={viewMode} 
            onChange={handleViewModeChange} 
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="embed" label="Embedded Viewer" />
            <Tab value="download" label="Download Options" />
          </Tabs>
          
          {viewMode === 'embed' && (
            <Box sx={{ width: '100%', height: height, overflow: 'hidden', position: 'relative' }}>
              {loading && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}>
                  <CircularProgress />
                </Box>
              )}
              
              {iframeError ? (
                <Box sx={{ 
                  width: '100%', 
                  height: height, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  p: 4,
                  borderRadius: 1
                }}>
                  <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                  <Typography variant="h6" color="error" gutterBottom>
                    Unable to load presentation viewer
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                    The presentation viewer couldn't be loaded. This may be due to security restrictions, 
                    unsupported file format, or the file not being publicly accessible.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setViewMode('download')}
                  >
                    Try Download Options
                  </Button>
                </Box>
              ) : viewerUrl ? (
                <iframe
                  src={viewerUrl}
                  width={width}
                  height={height}
                  frameBorder="0"
                  title={presentation.title}
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: height, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  p: 4,
                  borderRadius: 1
                }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    Preparing presentation viewer...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {viewMode === 'download' && (
            <Box sx={{ 
              width: '100%', 
              height: height, 
              display: 'flex', 
              flexDirection: 'column', 
              p: 4, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2 
            }}>
              <Typography variant="h6" gutterBottom>
                Download Options
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  1. Direct Download
                </Typography>
                <Typography variant="body2" paragraph>
                  Download the presentation file to your computer and open it with Microsoft PowerPoint or another compatible application.
                </Typography>
                <Button 
                  variant="contained" 
                  href={directUrl} 
                  target="_blank"
                  startIcon={<DownloadIcon />}
                >
                  Download Presentation
                </Button>
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  2. Open in Browser (if supported)
                </Typography>
                <Typography variant="body2" paragraph>
                  Try opening the presentation directly in your browser. This may work for some file types and hosting services.
                </Typography>
                <Button 
                  variant="outlined" 
                  href={directUrl} 
                  target="_blank"
                  startIcon={<OpenInNewIcon />}
                >
                  Open in Browser
                </Button>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  3. Open with External Services
                </Typography>
                <Typography variant="body2" paragraph>
                  Use these services to view the presentation online:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(directUrl)}`} 
                    target="_blank"
                  >
                    Google Docs Viewer
                  </Button>
                  <Button 
                    variant="outlined" 
                    href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(directUrl)}`} 
                    target="_blank"
                  >
                    Office Online (New Tab)
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Note: The PowerPoint viewer requires the presentation to be hosted at a publicly accessible URL.
              For security reasons, Microsoft's Office Online viewer only works with presentations hosted on public servers.
            </Typography>
          </Alert>
        </>
      )}
    </Paper>
  );
};

export default PptViewer;
