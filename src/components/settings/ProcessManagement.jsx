import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Chip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { 
  selectAllProcesses, 
  addProcess, 
  updateProcess, 
  deleteProcess,
  fetchProcesses,
  selectProcessesStatus,
  selectProcessesError
} from '../../features/processes/processesSlice';

const ProcessManagement = ({ showNotification }) => {
  const dispatch = useDispatch();
  const allProcesses = useSelector(selectAllProcesses);
  const status = useSelector(selectProcessesStatus);
  const error = useSelector(selectProcessesError);
  
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newProcessDialogOpen, setNewProcessDialogOpen] = useState(false);
  const [editProcessDialogOpen, setEditProcessDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState(null);
  // Using parent component's notification system via props
  
  // Form state for new/edit process
  const [processForm, setProcessForm] = useState({
    id: '',
    title: '',
    description: '',
    category: 'inbound',
    videoUrl: '',
    steps: []
  });
  
  // Form state for new step
  const [stepForm, setStepForm] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });
  
  // Load processes from API and Redux store
  useEffect(() => {
    // Fetch processes from API if not already loading or loaded
    if (status === 'idle') {
      dispatch(fetchProcesses());
    }
    
    // Update local state when processes change in Redux
    if (allProcesses) {
      setProcesses(allProcesses);
    }
    
    // Show error notification if API fetch failed
    if (status === 'failed' && error) {
      showNotification(`Failed to load processes: ${error}`, 'error');
    }
  }, [allProcesses, dispatch, status, error, showNotification]);
  
  const handleProcessSelect = (process) => {
    setSelectedProcess(process);
    setProcessForm({
      id: process.id,
      title: process.title,
      description: process.description,
      category: process.category || 'inbound',
      videoUrl: process.videoUrl || '',
      steps: process.steps || []
    });
    setEditMode(true);
  };
  
  const handleNewProcessClick = () => {
    setProcessForm({
      id: `process-${Date.now()}`,
      title: '',
      description: '',
      category: 'inbound',
      videoUrl: '',
      steps: []
    });
    setNewProcessDialogOpen(true);
    setEditMode(false);
  };
  
  const handleEditProcessClick = (process) => {
    handleProcessSelect(process);
    setEditProcessDialogOpen(true);
  };
  
  const handleDeleteProcessClick = (process) => {
    setProcessToDelete(process);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (processToDelete) {
      dispatch(deleteProcess(processToDelete.id));
      
      showNotification(`Process "${processToDelete.title}" deleted successfully`, 'success');
      
      if (selectedProcess && selectedProcess.id === processToDelete.id) {
        setSelectedProcess(null);
        setEditMode(false);
      }
    }
    
    setDeleteDialogOpen(false);
    setProcessToDelete(null);
  };
  
  const handleProcessFormChange = (e) => {
    const { name, value } = e.target;
    setProcessForm({
      ...processForm,
      [name]: value
    });
  };
  
  const handleStepFormChange = (e) => {
    const { name, value } = e.target;
    setStepForm({
      ...stepForm,
      [name]: value
    });
  };
  
  const handleAddStep = () => {
    // Validate step form
    if (!stepForm.title) {
      showNotification('Step title is required', 'error');
      return;
    }
    
    const newStep = {
      ...stepForm
    };
    
    setProcessForm({
      ...processForm,
      steps: [...processForm.steps, newStep]
    });
    
    // Reset step form
    setStepForm({
      title: '',
      description: '',
      videoUrl: ''
    });
  };
  
  const handleEditStep = (index, updatedStep) => {
    const updatedSteps = [...processForm.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      ...updatedStep
    };
    
    setProcessForm({
      ...processForm,
      steps: updatedSteps
    });
  };
  
  const handleDeleteStep = (index) => {
    setProcessForm({
      ...processForm,
      steps: processForm.steps.filter((_, i) => i !== index)
    });
  };
  
  const handleSaveProcess = () => {
    // Validate process form
    if (!processForm.title) {
      showNotification('Process title is required', 'error');
      return;
    }
    
    if (processForm.steps.length === 0) {
      showNotification('At least one step is required', 'error');
      return;
    }
    
    // Create or update process
    if (editMode) {
      dispatch(updateProcess({
        id: processForm.id,
        changes: {
          title: processForm.title,
          description: processForm.description,
          category: processForm.category,
          videoUrl: processForm.videoUrl,
          steps: processForm.steps
        }
      }));
      
      showNotification(`Process "${processForm.title}" updated successfully`, 'success');
    } else {
      dispatch(addProcess({
        id: processForm.id,
        title: processForm.title,
        description: processForm.description,
        category: processForm.category,
        videoUrl: processForm.videoUrl,
        steps: processForm.steps
      }));
      
      showNotification(`Process "${processForm.title}" created successfully`, 'success');
    }
    
    // Close dialogs
    setNewProcessDialogOpen(false);
    setEditProcessDialogOpen(false);
    
    // Reset form
    setProcessForm({
      id: '',
      title: '',
      description: '',
      category: 'inbound',
      videoUrl: '',
      steps: []
    });
  };
  
  // Using parent component's notification system
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Process Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewProcessClick}
        >
          New Process
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Create and manage warehouse processes. Each process can have multiple steps with associated videos.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Processes
        </Typography>
        
        {status === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Loading processes...
            </Typography>
          </Box>
        ) : status === 'failed' ? (
          <Alert severity="error" sx={{ my: 2 }}>
            Failed to load processes. {error}
          </Alert>
        ) : processes.length > 0 ? (
          <List>
            {processes.map((process) => (
              <ListItem 
                key={process.id} 
                sx={{ 
                  bgcolor: 'background.paper', 
                  mb: 1, 
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <ListItemText
                  primary={process.title}
                  secondary={process.description}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEditProcessClick(process)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteProcessClick(process)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            No processes available. Click "New Process" to create one.
          </Alert>
        )}

      </Box>
      
      {selectedProcess && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Selected Process: {selectedProcess.title}
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Process Steps</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {selectedProcess.steps && selectedProcess.steps.length > 0 ? (
                <List>
                  {selectedProcess.steps.map((step, index) => (
                    <ListItem key={index} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid divider' }}>
                      <ListItemText
                        primary={`${index + 1}. ${step.title}`}
                        secondary={<Typography component="span" variant="body2">{step.description}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  This process has no steps defined.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleEditProcessClick(selectedProcess)}
            >
              Edit Process
            </Button>
          </Box>
        </Box>
      )}
      
      {/* New Process Dialog */}
      <Dialog open={newProcessDialogOpen} onClose={() => setNewProcessDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Process</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Enter the details for the new warehouse process. You'll be able to add steps after creating the basic process information.
          </DialogContentText>
          
          <TextField
            fullWidth
            label="Process Title"
            name="title"
            value={processForm.title}
            onChange={handleProcessFormChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Process Description"
            name="description"
            value={processForm.description}
            onChange={handleProcessFormChange}
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={processForm.category}
              onChange={handleProcessFormChange}
              label="Category"
            >
              <MenuItem value="inbound">Inbound</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="outbound">Outbound</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Default Video URL (optional)"
            name="videoUrl"
            value={processForm.videoUrl}
            onChange={handleProcessFormChange}
            margin="normal"
            helperText="This video will be used if a step doesn't have its own video"
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Process Steps
          </Typography>
          
          {processForm.steps.length > 0 ? (
            <List sx={{ mb: 3 }}>
              {processForm.steps.map((step, index) => (
                <ListItem key={index} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid divider' }}>
                  <ListItemText
                    primary={`${index + 1}. ${step.title}`}
                    secondary={
                      <Typography component="span" variant="body2">
                        {step.description}
                        {step.videoUrl && (
                          <Typography component="span" variant="caption" display="block" color="primary">
                            Video: {step.videoUrl}
                          </Typography>
                        )}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteStep(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No steps added yet. Add at least one step below.
            </Alert>
          )}
          
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid divider' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Step
            </Typography>
            
            <TextField
              fullWidth
              label="Step Title"
              name="title"
              value={stepForm.title}
              onChange={handleStepFormChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Step Description"
              name="description"
              value={stepForm.description}
              onChange={handleStepFormChange}
              margin="normal"
              multiline
              rows={2}
            />
            
            <TextField
              fullWidth
              label="Step Video URL"
              name="videoUrl"
              value={stepForm.videoUrl}
              onChange={handleStepFormChange}
              margin="normal"
              helperText="URL to a video for this specific step"
            />
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddStep}
              sx={{ mt: 2 }}
            >
              Add Step
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProcessDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProcess} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={processForm.title === '' || processForm.steps.length === 0}
          >
            Save Process
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Process Dialog */}
      <Dialog open={editProcessDialogOpen} onClose={() => setEditProcessDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Process: {processForm.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Process Title"
            name="title"
            value={processForm.title}
            onChange={handleProcessFormChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Process Description"
            name="description"
            value={processForm.description}
            onChange={handleProcessFormChange}
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={processForm.category}
              onChange={handleProcessFormChange}
              label="Category"
            >
              <MenuItem value="inbound">Inbound</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="outbound">Outbound</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Default Video URL (optional)"
            name="videoUrl"
            value={processForm.videoUrl}
            onChange={handleProcessFormChange}
            margin="normal"
            helperText="This video will be used if a step doesn't have its own video"
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Process Steps
          </Typography>
          
          {processForm.steps.length > 0 ? (
            <List sx={{ mb: 3 }}>
              {processForm.steps.map((step, index) => (
                <ListItem key={index} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid divider' }}>
                  <ListItemText
                    primary={`${index + 1}. ${step.title}`}
                    secondary={
                      <>
                        {step.description}
                        {step.videoUrl && (
                          <Typography variant="caption" display="block" color="primary">
                            Video: {step.videoUrl}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteStep(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No steps added yet. Add at least one step below.
            </Alert>
          )}
          
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid divider' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Step
            </Typography>
            
            <TextField
              fullWidth
              label="Step Title"
              name="title"
              value={stepForm.title}
              onChange={handleStepFormChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Step Description"
              name="description"
              value={stepForm.description}
              onChange={handleStepFormChange}
              margin="normal"
              multiline
              rows={2}
            />
            
            <TextField
              fullWidth
              label="Step Video URL"
              name="videoUrl"
              value={stepForm.videoUrl}
              onChange={handleStepFormChange}
              margin="normal"
              helperText="URL to a video for this specific step"
            />
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddStep}
              sx={{ mt: 2 }}
            >
              Add Step
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProcessDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProcess} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={processForm.title === '' || processForm.steps.length === 0}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the process "{processToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Using parent component's notification system */}
    </Paper>
  );
};

export default ProcessManagement;
