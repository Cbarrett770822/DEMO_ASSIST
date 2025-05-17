import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { loadPresentations, savePresentations } from '../../services/storageService';

const PresentationSettings = () => {
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
  const [presentationSource, setPresentationSource] = useState('online');
  const [newPresentationTitle, setNewPresentationTitle] = useState('');
  const [newPresentationUrl, setNewPresentationUrl] = useState('');
  const [newPresentationDescription, setNewPresentationDescription] = useState('');
  const [localFilePath, setLocalFilePath] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editMode, setEditMode] = useState(false);
  const [editingPresentationId, setEditingPresentationId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState(null);
  const fileInputRef = useRef(null);
  
  // Load presentations from localStorage on component mount
  useEffect(() => {
    const storedPresentations = loadPresentations();
    if (storedPresentations && storedPresentations.length > 0) {
      setPresentations(storedPresentations);
    } else {
      setPresentations(defaultPresentations);
      // Save default presentations to localStorage
      savePresentations(defaultPresentations);
    }
  }, []);
  
  const handlePresentationSourceChange = (event) => {
    setPresentationSource(event.target.value);
    // Reset fields when changing source
    setNewPresentationUrl('');
    setLocalFilePath('');
  };
  
  const handleLocalFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Check if it's a PowerPoint file
      if (!file.name.match(/\.(ppt|pptx)$/i)) {
        setSnackbarMessage('Please select a PowerPoint file (.ppt or .pptx)');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      
      // Get just the filename for storage
      // In a real application, you would upload this file to a server
      // For this demo, we'll use a predefined path in the public folder
      // Assume the file is already in the public/presentations folder
      const filePath = 'presentations/' + file.name;
      setLocalFilePath(filePath);
      
      setSnackbarMessage('Local file selected: ' + file.name + '. Make sure this file exists in the public/presentations folder.');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleAddPresentation = () => {
    // Validate inputs
    if (!newPresentationTitle) {
      setSnackbarMessage('Please provide a title for the presentation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (presentationSource === 'online' && !newPresentationUrl) {
      setSnackbarMessage('Please enter a URL for the presentation');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    // Check if it's a cloud storage link (Dropbox, Google Drive, Google Slides, etc.)
    const isCloudStorageLink = newPresentationUrl.includes('dropbox.com') || 
                              newPresentationUrl.includes('drive.google.com') || 
                              newPresentationUrl.includes('docs.google.com/presentation') || 
                              newPresentationUrl.includes('onedrive.live.com');
    
    if (presentationSource === 'online' && !isCloudStorageLink && !newPresentationUrl.match(/^https?:\/\/.+\.(ppt|pptx)$/i)) {
      setSnackbarMessage('Please enter a valid PowerPoint URL (.ppt or .pptx) or a cloud storage link');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (presentationSource === 'local' && !localFilePath) {
      setSnackbarMessage('Please select a local PowerPoint file');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    const newPresentation = {
      id: editMode ? editingPresentationId : Date.now(),
      title: newPresentationTitle,
      url: presentationSource === 'online' ? newPresentationUrl : localFilePath,
      description: newPresentationDescription || 'No description provided',
      isLocal: presentationSource === 'local'
    };
    
    let updatedPresentations;
    
    if (editMode) {
      // Update existing presentation
      updatedPresentations = presentations.map(p => 
        p.id === editingPresentationId ? newPresentation : p
      );
      setSnackbarMessage('Presentation updated successfully');
    } else {
      // Add new presentation
      updatedPresentations = [...presentations, newPresentation];
      setSnackbarMessage('Presentation added successfully');
    }
    
    // Update state and save to localStorage
    setPresentations(updatedPresentations);
    savePresentations(updatedPresentations);
    
    // Reset form
    setNewPresentationTitle('');
    setNewPresentationUrl('');
    setNewPresentationDescription('');
    setLocalFilePath('');
    setPresentationSource('online');
    setEditMode(false);
    setEditingPresentationId(null);
    
    // Show success message
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };
  
  const handleEditPresentation = (presentation) => {
    setEditMode(true);
    setEditingPresentationId(presentation.id);
    setNewPresentationTitle(presentation.title);
    setNewPresentationDescription(presentation.description);
    
    if (presentation.isLocal) {
      setPresentationSource('local');
      setLocalFilePath(presentation.url);
      setNewPresentationUrl('');
    } else {
      setPresentationSource('online');
      setNewPresentationUrl(presentation.url);
      setLocalFilePath('');
    }
  };
  
  const handleDeleteClick = (presentation) => {
    setPresentationToDelete(presentation);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (presentationToDelete) {
      const updatedPresentations = presentations.filter(p => p.id !== presentationToDelete.id);
      setPresentations(updatedPresentations);
      savePresentations(updatedPresentations);
      
      setSnackbarMessage('Presentation deleted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
    
    setDeleteDialogOpen(false);
    setPresentationToDelete(null);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingPresentationId(null);
    setNewPresentationTitle('');
    setNewPresentationUrl('');
    setNewPresentationDescription('');
    setLocalFilePath('');
    setPresentationSource('online');
  };
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Presentation Management
      </Typography>
      <Typography variant="body1" paragraph>
        Add and manage PowerPoint presentations for your warehouse processes. You can use online presentations or local files.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Current Presentations */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Presentations
        </Typography>
        
        {presentations.length > 0 ? (
          <List>
            {presentations.map((presentation) => (
              <ListItem key={presentation.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                <ListItemIcon>
                  <SlideshowIcon color={presentation.isLocal ? 'primary' : 'secondary'} />
                </ListItemIcon>
                <ListItemText
                  primary={presentation.title}
                  secondary={
                    <>
                      {presentation.description}
                      {presentation.isLocal && (
                        <Typography variant="caption" display="block" color="primary">
                          Local file: {presentation.url}
                        </Typography>
                      )}
                      {!presentation.isLocal && (
                        <Typography variant="caption" display="block" color="secondary">
                          URL: {presentation.url}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEditPresentation(presentation)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteClick(presentation)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            No presentations available. Add your first presentation below.
          </Alert>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Add/Edit Presentation Form */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {editMode ? 'Edit Presentation' : 'Add New Presentation'}
        </Typography>
        
        <TextField
          fullWidth
          label="Presentation Title"
          value={newPresentationTitle}
          onChange={(e) => setNewPresentationTitle(e.target.value)}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Description (optional)"
          value={newPresentationDescription}
          onChange={(e) => setNewPresentationDescription(e.target.value)}
          margin="normal"
          multiline
          rows={2}
        />
        
        <FormControl component="fieldset" sx={{ my: 2 }}>
          <RadioGroup
            row
            name="presentation-source"
            value={presentationSource}
            onChange={handlePresentationSourceChange}
          >
            <FormControlLabel value="online" control={<Radio />} label="Online Presentation" />
            <FormControlLabel value="local" control={<Radio />} label="Local File" />
          </RadioGroup>
        </FormControl>
        
        {presentationSource === 'online' ? (
          <TextField
            fullWidth
            label="Presentation URL"
            value={newPresentationUrl}
            onChange={(e) => setNewPresentationUrl(e.target.value)}
            margin="normal"
            helperText={
              <>
                Enter a publicly accessible URL to a PowerPoint file or a shared link from:
                <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                  <li>Dropbox (use &apos;Copy link&apos; option)</li>
                  <li>Google Drive (use &apos;Share {">"}  Anyone with the link&apos;)</li>
                  <li>Google Slides (use &apos;Share {">"}  Anyone with the link&apos;)</li>
                  <li>OneDrive (use &apos;Share {">"}  Anyone with the link&apos;)</li>
                </ul>
              </>
            }
            required
          />
        ) : (
          <Box sx={{ mt: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ppt,.pptx"
              style={{ display: 'none' }}
              onChange={handleLocalFileChange}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Button
                variant="outlined"
                onClick={triggerFileInput}
                startIcon={<AddIcon />}
              >
                Select PowerPoint File
              </Button>
              <Typography variant="body2" sx={{ ml: 2 }}>
                {localFilePath || 'No file selected'}
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> For local files to work, you must:
                <ol>
                  <li>Place your PowerPoint files in the <code>public/presentations</code> folder of the application</li>
                  <li>The file you select here must match the name of the file in that folder</li>
                  <li>Example: If you select "example.pptx", make sure it exists at "public/presentations/example.pptx"</li>
                </ol>
                <Typography variant="caption" color="text.secondary">
                  Note: Local files cannot be displayed directly in the browser. Users will be provided with a download link instead.
                </Typography>
              </Typography>
            </Alert>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={editMode ? <SaveIcon /> : <AddIcon />}
            onClick={handleAddPresentation}
          >
            {editMode ? 'Save Changes' : 'Add Presentation'}
          </Button>
          
          {editMode && (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the presentation "{presentationToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PresentationSettings;
