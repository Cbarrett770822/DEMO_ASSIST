import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  DialogActions,
  CircularProgress
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { 
  fetchPresentations, 
  selectPresentations, 
  selectPresentationsStatus, 
  selectPresentationsError,
  addPresentation,
  updatePresentation,
  deletePresentation
} from '../../features/presentations/presentationsSlice';

const PresentationSettings = ({ showNotification }) => {
  const dispatch = useDispatch();
  const presentations = useSelector(selectPresentations);
  const status = useSelector(selectPresentationsStatus);
  const error = useSelector(selectPresentationsError);
  const [presentationSource, setPresentationSource] = useState('online');
  const [newPresentationTitle, setNewPresentationTitle] = useState('');
  const [newPresentationUrl, setNewPresentationUrl] = useState('');
  const [newPresentationDescription, setNewPresentationDescription] = useState('');
  const [localFilePath, setLocalFilePath] = useState('');
  // Using parent component's notification system via showNotification prop
  const [editMode, setEditMode] = useState(false);
  const [editingPresentationId, setEditingPresentationId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState(null);
  const fileInputRef = useRef(null);
  
  // Fetch presentations from API on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPresentations());
    }
  }, [status, dispatch]);
  
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
        showNotification('Please select a PowerPoint file (.ppt or .pptx)', 'error');
        return;
      }
      
      // Get just the filename for storage
      // In a real application, you would upload this file to a server
      // For this demo, we'll use a predefined path in the public folder
      // Assume the file is already in the public/presentations folder
      const filePath = 'presentations/' + file.name;
      setLocalFilePath(filePath);
      
      showNotification('Local file selected: ' + file.name + '. Make sure this file exists in the public/presentations folder.', 'info');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleAddPresentation = () => {
    // Validate inputs
    if (!newPresentationTitle) {
      showNotification('Please provide a title for the presentation', 'error');
      return;
    }
    
    if (presentationSource === 'online' && !newPresentationUrl) {
      showNotification('Please enter a URL for the presentation', 'error');
      return;
    }
    
    // Check if it's a cloud storage link (Dropbox, Google Drive, Google Slides, etc.)
    const isCloudStorageLink = newPresentationUrl.includes('dropbox.com') || 
                              newPresentationUrl.includes('drive.google.com') || 
                              newPresentationUrl.includes('docs.google.com/presentation') || 
                              newPresentationUrl.includes('onedrive.live.com');
    
    if (presentationSource === 'online' && !isCloudStorageLink && !newPresentationUrl.match(/^https?:\/\/.+\.(ppt|pptx)$/i)) {
      showNotification('Please enter a valid PowerPoint URL (.ppt or .pptx) or a cloud storage link', 'error');
      return;
    }
    
    if (presentationSource === 'local' && !localFilePath) {
      showNotification('Please select a local PowerPoint file', 'error');
      return;
    }
    
    // Create new presentation object
    const newPresentation = {
      id: editMode ? editingPresentationId : Date.now(),
      title: newPresentationTitle,
      url: presentationSource === 'online' ? newPresentationUrl : localFilePath,
      description: newPresentationDescription,
      isLocal: presentationSource === 'local'
    };
    
    // Add to presentations array or update existing using Redux
    if (editMode) {
      dispatch(updatePresentation({
        id: editingPresentationId,
        changes: {
          title: newPresentationTitle,
          url: presentationSource === 'online' ? newPresentationUrl : localFilePath,
          description: newPresentationDescription,
          isLocal: presentationSource === 'local'
        }
      }));
      showNotification(`Presentation "${newPresentationTitle}" updated successfully`, 'success');
    } else {
      dispatch(addPresentation(newPresentation));
      showNotification(`Presentation "${newPresentationTitle}" added successfully`, 'success');
    }
    
    // Reset form
    setNewPresentationTitle('');
    setNewPresentationUrl('');
    setNewPresentationDescription('');
    setLocalFilePath('');
    setEditMode(false);
    setEditingPresentationId(null);
  };
  
  const handleEditPresentation = (presentation) => {
    setEditMode(true);
    setEditingPresentationId(presentation.id);
    setNewPresentationTitle(presentation.title);
    setNewPresentationDescription(presentation.description || '');
    
    if (presentation.isLocal) {
      setPresentationSource('local');
      setLocalFilePath(presentation.url);
      setNewPresentationUrl('');
    } else {
      setPresentationSource('online');
      setNewPresentationUrl(presentation.url);
      setLocalFilePath('');
    }
    
    showNotification(`Editing presentation "${presentation.title}"`, 'info');
  };
  
  const handleDeleteClick = (presentation) => {
    setPresentationToDelete(presentation);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (presentationToDelete) {
      dispatch(deletePresentation(presentationToDelete.id));
      showNotification(`Presentation "${presentationToDelete.title}" deleted successfully`, 'success');
      setDeleteDialogOpen(false);
      setPresentationToDelete(null);
      
      // If we were editing this presentation, reset the form
      if (editMode && editingPresentationId === presentationToDelete.id) {
        setNewPresentationTitle('');
        setNewPresentationUrl('');
        setNewPresentationDescription('');
        setLocalFilePath('');
        setEditMode(false);
        setEditingPresentationId(null);
      }
    }
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
  
  // Using parent component's notification system
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Presentation Management
      </Typography>
      <Typography variant="body1" paragraph>
        Add and manage PowerPoint presentations for your warehouse processes. You can use online presentations or local files.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      {/* List of existing presentations */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Presentations
        </Typography>
        
        {status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {status === 'failed' && (
          <Alert severity="error" sx={{ my: 2 }}>
            Error loading presentations: {error}
          </Alert>
        )}
        
        {presentations && presentations.length > 0 ? (
          <List>
            {presentations.map((presentation) => (
              <ListItem 
                key={presentation.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemIcon>
                  <SlideshowIcon color={presentation.isLocal ? 'primary' : 'secondary'} />
                </ListItemIcon>
                <ListItemText
                  primary={presentation.title}
                  secondary={<>
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
                  <IconButton edge="end" onClick={() => handleEditPresentation(presentation)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteClick(presentation)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : status !== 'loading' && (
          <Alert severity="info" sx={{ my: 2 }}>
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
          <React.Fragment>
            <TextField
              fullWidth
              label="Presentation URL"
              value={newPresentationUrl}
              onChange={(e) => setNewPresentationUrl(e.target.value)}
              margin="normal"
              helperText="Enter a publicly accessible URL to a PowerPoint file or a shared link"
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Supported services:
              </Typography>
              <Box sx={{ mt: 0.5, ml: 3, mb: 2 }}>
                <Typography component="div" variant="caption">
                  <Box component="ul" sx={{ m: 0, p: 0, listStylePosition: 'inside' }}>
                    <li>Dropbox (use 'Copy link' option)</li>
                    <li>Google Drive (use 'Share &gt; Anyone with the link')</li>
                    <li>Google Slides (use 'Share &gt; Anyone with the link')</li>
                    <li>OneDrive (use 'Share &gt; Anyone with the link')</li>
                  </Box>
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
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
              <Typography variant="body2" gutterBottom>
                <strong>Important:</strong> For local files to work, you must:
              </Typography>
              <Typography component="div" variant="body2">
                <Box component="ol" sx={{ mt: 1, ml: 2, mb: 2, pl: 1 }}>
                  <li>Place your PowerPoint files in the <code>public/presentations</code> folder of the application</li>
                  <li>The file you select here must match the name of the file in that folder</li>
                  <li>Example: If you select "example.pptx", make sure it exists at "public/presentations/example.pptx"</li>
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Note: Local files cannot be displayed directly in the browser. Users will be provided with a download link instead.
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
      
      {/* Using parent component's notification system */}
      
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
