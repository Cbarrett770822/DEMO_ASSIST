import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';

const PptViewer = ({ presentation, width = '100%', height = '600px' }) => {
  const [viewerUrl, setViewerUrl] = useState('');
  const [isLocalFile, setIsLocalFile] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!presentation) return;
    
    // Check if this is a local file or URL
    if (presentation.isLocal) {
      setIsLocalFile(true);
      // For local files, we use the local path directly
      // The file should be in the public folder
      setViewerUrl(`${process.env.PUBLIC_URL}/${presentation.url}`);
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
              href={`/${presentation.url}`} 
              target="_blank"
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
        <Box sx={{ width: '100%', height: height, overflow: 'hidden' }}>
          <iframe
            src={viewerUrl}
            width={width}
            height={height}
            frameBorder="0"
            title={presentation.title}
            allowFullScreen
          />
        </Box>
      )}
    </Paper>
  );
};

export default PptViewer;
