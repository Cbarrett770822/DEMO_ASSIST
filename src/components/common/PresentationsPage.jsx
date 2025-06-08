import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPresentations, addPresentation, updatePresentation, deletePresentation } from '../../services/presentationService';
import { selectIsAdmin, selectIsAuthenticated } from '../../features/auth/authSlice';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Alert, 
  CircularProgress
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PptViewer from './PptViewer';

const PresentationsPage = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Load presentations using the presentation service
  useEffect(() => {
    const loadPresentations = async () => {
      try {
        setLoading(true);
        const data = await getPresentations();
        setPresentations(data);
        setError(null);
        
        // If there's a selected presentation, update it with the latest data
        if (selectedPresentation) {
          const updated = data.find(p => p.id === selectedPresentation.id || 
                                      String(p.id) === String(selectedPresentation.id));
          if (updated) {
            setSelectedPresentation(updated);
          }
        }
      } catch (err) {
        console.error('Error loading presentations:', err);
        setError('Failed to load presentations. Please try again later.');
        
        // Retry loading after a delay if authentication state changes
        if (retryCount < 3 && isAuthenticated) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPresentations();
  }, [isAuthenticated, retryCount, selectedPresentation?.id]);
  
  const handlePresentationSelect = (presentation) => {
    setSelectedPresentation(presentation);
  };
  
  // Handle presentation errors
  const handlePresentationError = (message) => {
    setError(message || 'An error occurred with the presentation');
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PowerPoint Presentations
        </Typography>
        
        <Typography variant="body1" component="div">
          Browse and view presentations related to warehouse management processes.
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      
      {!loading && !error && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Presentations
                </Typography>
                {presentations.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    {presentations.map((presentation) => (
                      <Card 
                        key={presentation.id}
                        variant="outlined" 
                        sx={{ 
                          height: 140,
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          bgcolor: selectedPresentation?.id === presentation.id || 
                                  String(selectedPresentation?.id) === String(presentation.id) ? 
                                  'rgba(25, 118, 210, 0.08)' : 'transparent',
                          border: selectedPresentation?.id === presentation.id || 
                                 String(selectedPresentation?.id) === String(presentation.id) ? 
                                 '1px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderColor: '#1976d2'
                          }
                        }}
                        onClick={() => handlePresentationSelect(presentation)}
                      >
                        <CardContent sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          p: 2,
                          '&:last-child': { pb: 2 } // Override Material UI's default padding
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SlideshowIcon sx={{ mr: 1, color: 'primary.main', flexShrink: 0 }} />
                            <Typography variant="subtitle1" component="div" noWrap sx={{ fontWeight: 'medium' }}>
                              {presentation.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexGrow: 1,
                            mb: 1
                          }}>
                            {presentation.description}
                          </Typography>
                          {presentation.isLocal && (
                            <Typography variant="caption" display="block" color="primary" sx={{ mt: 'auto' }}>
                              Local file
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No presentations available. Add presentations in the Settings page.
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {isAdmin ? (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" component="div">
                  To add or manage presentations, go to the <strong>Settings</strong> page.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" component="div">
                  Contact an administrator to add or manage presentations.
                </Typography>
              </Alert>
            )}
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.667% - 16px)' }, minWidth: { xs: '100%', md: 'calc(66.667% - 16px)' } }}>
            {selectedPresentation ? (
              <PptViewer 
                presentation={selectedPresentation} 
                height="600px"
              />
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '600px',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center'
                }}
              >
                <SlideshowIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a presentation from the list to view it
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Browse presentations from the list on the left
                </Typography>
              </Box>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" component="div">
                Note: The PowerPoint viewer requires the presentation to be hosted at a publicly accessible URL.
                For security reasons, Microsoft's Office Online viewer only works with presentations hosted on public servers.
              </Typography>
            </Alert>
          </Box>
        </Box>
      )}
      </Box>
    </Container>
  );
};

export default PresentationsPage;
