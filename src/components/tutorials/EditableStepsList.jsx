import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { selectSelectedProcess, updateProcess } from '../../features/processes/processesSlice';

const EditableStepsList = () => {
  const process = useSelector(selectSelectedProcess);
  const dispatch = useDispatch();
  
  const [steps, setSteps] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditStep, setCurrentEditStep] = useState(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepDescription, setEditStepDescription] = useState('');
  const [editStepVideoUrl, setEditStepVideoUrl] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepVideoUrl, setNewStepVideoUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Initialize steps from process data
  useEffect(() => {
    if (process && process.steps) {
      setSteps([...process.steps]);
    }
  }, [process]);

  if (!process) {
    return null;
  }

  const handleEditStep = (index) => {
    setCurrentEditStep(index);
    setEditStepTitle(steps[index].title || '');
    setEditStepDescription(steps[index].description || '');
    setEditStepVideoUrl(steps[index].videoUrl || '');
    setEditDialogOpen(true);
  };

  const handleSaveEditStep = () => {
    if (editStepTitle.trim()) {
      const updatedSteps = [...steps];
      updatedSteps[currentEditStep] = {
        ...updatedSteps[currentEditStep],
        title: editStepTitle.trim(),
        description: editStepDescription.trim(),
        videoUrl: editStepVideoUrl.trim()
      };
      
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      setEditDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Step updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = [...steps];
      updatedSteps.splice(index, 1);
      
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      
      // Show success message
      setSnackbarMessage('Step deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      // Show error message if trying to delete the only step
      setSnackbarMessage('Cannot delete the only step in the process');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAddStep = () => {
    setNewStepTitle('');
    setNewStepDescription('');
    setNewStepVideoUrl('');
    setAddDialogOpen(true);
  };

  const handleSaveNewStep = () => {
    if (newStepTitle.trim()) {
      const newStep = {
        title: newStepTitle.trim(),
        description: newStepDescription.trim(),
        videoUrl: newStepVideoUrl.trim()
      };
      
      const updatedSteps = [...steps, newStep];
      setSteps(updatedSteps);
      saveProcessSteps(updatedSteps);
      setAddDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('New step added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const saveProcessSteps = (updatedSteps) => {
    // Create updated process with new steps
    const updatedProcess = {
      ...process,
      steps: updatedSteps
    };
    
    // Dispatch update action
    dispatch(updateProcess(updatedProcess));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Edit Process Steps
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddStep}
        >
          Add New Step
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          {steps.map((step, index) => (
            <ListItem
              key={index}
              divider={index < steps.length - 1}
              secondaryAction={
                <Box>
                  <IconButton 
                    edge="end" 
                    color="primary"
                    onClick={() => handleEditStep(index)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    color="error"
                    onClick={() => handleDeleteStep(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={`Step ${index + 1}: ${step.title}`}
                secondary={<Typography component="span" variant="body2">{step.description || 'No description provided'}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Edit Step Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Process Step</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Step Title"
            fullWidth
            value={editStepTitle}
            onChange={(e) => setEditStepTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Step Description"
            fullWidth
            value={editStepDescription}
            onChange={(e) => setEditStepDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Video URL (YouTube or Google Drive)"
            fullWidth
            value={editStepVideoUrl}
            onChange={(e) => setEditStepVideoUrl(e.target.value)}
            helperText="Enter a YouTube URL or Google Drive link"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEditStep} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Step Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Process Step</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Step Title"
            fullWidth
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Step Description"
            fullWidth
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Video URL (YouTube or Google Drive)"
            fullWidth
            value={newStepVideoUrl}
            onChange={(e) => setNewStepVideoUrl(e.target.value)}
            helperText="Enter a YouTube URL or Google Drive link"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNewStep} variant="contained" color="primary">
            Add Step
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditableStepsList;
