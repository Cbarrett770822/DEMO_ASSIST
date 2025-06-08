import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { selectSelectedProcess, updateProcess } from '../../features/processes/processesSlice';

const EditableBenefitsSection = () => {
  const process = useSelector(selectSelectedProcess);
  const dispatch = useDispatch();
  
  const [benefits, setBenefits] = useState([]);
  const [beforeItems, setBeforeItems] = useState([]);
  const [afterItems, setAfterItems] = useState([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [newBeforeItem, setNewBeforeItem] = useState('');
  const [newAfterItem, setNewAfterItem] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editBeforeIndex, setEditBeforeIndex] = useState(-1);
  const [editAfterIndex, setEditAfterIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Initialize state from process data
  useEffect(() => {
    if (process) {
      setBenefits(process.benefits || []);
      
      if (process.beforeAfterComparison) {
        setBeforeItems(process.beforeAfterComparison.before || []);
        setAfterItems(process.beforeAfterComparison.after || []);
      } else {
        setBeforeItems([]);
        setAfterItems([]);
      }
    }
  }, [process]);

  if (!process) {
    return null;
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleDeleteBenefit = (index) => {
    const updatedBenefits = [...benefits];
    updatedBenefits.splice(index, 1);
    setBenefits(updatedBenefits);
  };

  const handleEditBenefit = (index) => {
    setEditIndex(index);
    setEditText(benefits[index]);
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      const updatedBenefits = [...benefits];
      updatedBenefits[editIndex] = editText.trim();
      setBenefits(updatedBenefits);
    }
    setEditIndex(-1);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditIndex(-1);
    setEditText('');
  };

  const handleAddBeforeAfterItem = () => {
    if (newBeforeItem.trim() && newAfterItem.trim()) {
      setBeforeItems([...beforeItems, newBeforeItem.trim()]);
      setAfterItems([...afterItems, newAfterItem.trim()]);
      setNewBeforeItem('');
      setNewAfterItem('');
    }
  };

  const handleDeleteBeforeAfterItem = (index) => {
    const updatedBeforeItems = [...beforeItems];
    const updatedAfterItems = [...afterItems];
    updatedBeforeItems.splice(index, 1);
    updatedAfterItems.splice(index, 1);
    setBeforeItems(updatedBeforeItems);
    setAfterItems(updatedAfterItems);
  };

  const handleEditBeforeItem = (index) => {
    setEditBeforeIndex(index);
    setEditText(beforeItems[index]);
  };

  const handleSaveBeforeEdit = () => {
    if (editText.trim()) {
      const updatedItems = [...beforeItems];
      updatedItems[editBeforeIndex] = editText.trim();
      setBeforeItems(updatedItems);
    }
    setEditBeforeIndex(-1);
    setEditText('');
  };

  const handleEditAfterItem = (index) => {
    setEditAfterIndex(index);
    setEditText(afterItems[index]);
  };

  const handleSaveAfterEdit = () => {
    if (editText.trim()) {
      const updatedItems = [...afterItems];
      updatedItems[editAfterIndex] = editText.trim();
      setAfterItems(updatedItems);
    }
    setEditAfterIndex(-1);
    setEditText('');
  };

  const handleSaveAll = () => {
    // Create updated process with new benefits data
    const updatedProcess = {
      ...process,
      benefits: benefits,
      beforeAfterComparison: {
        before: beforeItems,
        after: afterItems
      }
    };
    
    // Dispatch update action
    dispatch(updateProcess(updatedProcess));
    
    // Show success message
    setSnackbarMessage('Benefits saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Benefits of WMS for {process.title}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSaveAll}
        >
          Save All Changes
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Key Benefits
            </Typography>
            
            <List>
              {benefits.map((benefit, index) => (
                <ListItem 
                  key={index} 
                  alignItems="flex-start"
                  secondaryAction={
                    editIndex === index ? (
                      <>
                        <IconButton edge="end" onClick={handleSaveEdit} size="small">
                          <SaveIcon fontSize="small" />
                        </IconButton>
                        <IconButton edge="end" onClick={handleCancelEdit} size="small">
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton edge="end" onClick={() => handleEditBenefit(index)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteBenefit(index)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )
                  }
                >
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="success" />
                  </ListItemIcon>
                  {editIndex === index ? (
                    <TextField
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <ListItemText primary={benefit} />
                  )}
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                fullWidth
                label="Add new benefit"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                size="small"
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddBenefit}
                sx={{ ml: 1 }}
              >
                Add
              </Button>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Before & After WMS Implementation
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '50%', textAlign: 'center' }}>
                Before
              </Typography>
              <CompareArrowsIcon sx={{ mx: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '50%', textAlign: 'center' }}>
                After
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              {beforeItems.map((beforeItem, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                  <Box sx={{ width: '45%' }}>
                    {editBeforeIndex === index ? (
                      <TextField
                        fullWidth
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'text.secondary' }}
                      >
                        {beforeItem}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ width: '10%', display: 'flex', justifyContent: 'center' }}>
                    <CompareArrowsIcon sx={{ color: 'text.disabled' }} />
                  </Box>
                  
                  <Box sx={{ width: '45%' }}>
                    {editAfterIndex === index ? (
                      <TextField
                        fullWidth
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'success.main', fontWeight: 'medium' }}
                      >
                        {afterItems[index]}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column' }}>
                    {editBeforeIndex === index ? (
                      <IconButton size="small" onClick={handleSaveBeforeEdit}>
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={() => handleEditBeforeItem(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    {editAfterIndex === index ? (
                      <IconButton size="small" onClick={handleSaveAfterEdit}>
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={() => handleEditAfterItem(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    <IconButton size="small" onClick={() => handleDeleteBeforeAfterItem(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)' } }}>
                <TextField
                  fullWidth
                  label="Before WMS"
                  value={newBeforeItem}
                  onChange={(e) => setNewBeforeItem(e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)' } }}>
                <TextField
                  fullWidth
                  label="After WMS"
                  value={newAfterItem}
                  onChange={(e) => setNewAfterItem(e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddBeforeAfterItem}
                >
                  Add Before/After Comparison
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      
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

export default EditableBenefitsSection;
