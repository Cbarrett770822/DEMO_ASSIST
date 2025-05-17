import React, { useState, useEffect } from 'react';
import { loadPresentations } from '../../services/storageService';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AddIcon from '@mui/icons-material/Add';
import PptViewer from './PptViewer';

const PresentationsPage = () => {
  // Default presentations if none are stored
  const defaultPresentations = [
    {
      id: 1,
      title: 'WMS Introduction',
      url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
      description: 'An introduction to Warehouse Management Systems and their benefits',
      isLocal: false
    },
    {
      id: 2,
      title: 'Inbound Processes',
      url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
      description: 'Detailed overview of receiving and putaway processes',
      isLocal: false
    }
  ];
  
  const [presentations, setPresentations] = useState([]);
  
  // Load presentations from localStorage on component mount
  useEffect(() => {
    const storedPresentations = loadPresentations();
    if (storedPresentations && storedPresentations.length > 0) {
      setPresentations(storedPresentations);
    } else {
      setPresentations(defaultPresentations);
    }
  }, []);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  
  const handlePresentationSelect = (presentation) => {
    setSelectedPresentation(presentation);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PowerPoint Presentations
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
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
                          bgcolor: selectedPresentation?.id === presentation.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          border: selectedPresentation?.id === presentation.id ? '1px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)',
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
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                To add or manage presentations, go to the <strong>Settings</strong> page.
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={8}>
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
                  Or add a new presentation using the form below
                </Typography>
              </Box>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Note: The PowerPoint viewer requires the presentation to be hosted at a publicly accessible URL.
                For security reasons, Microsoft's Office Online viewer only works with presentations hosted on public servers.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
      
      {/* Snackbar removed */}
    </Container>
  );
};

export default PresentationsPage;
