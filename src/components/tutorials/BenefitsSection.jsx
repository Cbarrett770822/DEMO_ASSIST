import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { selectSelectedProcess } from '../../features/processes/processesSlice';
import processData from '../../features/processes/data/processData';

const BenefitsSection = () => {
  const process = useSelector(selectSelectedProcess);
  const [processWithBenefits, setProcessWithBenefits] = useState(null);
  
  useEffect(() => {
    if (process) {
      // If the process doesn't have benefits data, try to find it in the original data
      if (!process.benefits || process.benefits.length === 0) {
        const originalProcess = processData.find(p => p.id === process.id);
        if (originalProcess && originalProcess.benefits) {
          setProcessWithBenefits({
            ...process,
            benefits: originalProcess.benefits,
            beforeAfterComparison: originalProcess.beforeAfterComparison
          });
          return;
        }
      }
      setProcessWithBenefits(process);
    }
  }, [process]);

  if (!process) {
    return null;
  }
  
  // Use the enhanced process data with benefits
  const displayProcess = processWithBenefits || process;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Benefits of WMS for {displayProcess.title}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Key Benefits
            </Typography>
            <List>
              {displayProcess.benefits && displayProcess.benefits.length > 0 ? (
                displayProcess.benefits.map((benefit, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No benefits information available" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Before & After WMS Implementation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {displayProcess.beforeAfterComparison && displayProcess.beforeAfterComparison.before ? (
                  displayProcess.beforeAfterComparison.before.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          width: '50%', 
                          pr: 1,
                          color: 'text.secondary'
                        }}
                      >
                        {item}
                      </Typography>
                      <Box sx={{ width: '0%', borderRight: 1, borderColor: 'divider', mx: 1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          width: '50%', 
                          pl: 1,
                          color: 'success.main',
                          fontWeight: 'medium'
                        }}
                      >
                        {displayProcess.beforeAfterComparison.after && displayProcess.beforeAfterComparison.after[index]}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No comparison information available</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BenefitsSection;
