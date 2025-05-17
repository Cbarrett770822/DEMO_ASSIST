import React from 'react';
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
  Grid
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { selectSelectedProcess } from '../../features/processes/processesSlice';

const BenefitsSection = () => {
  const process = useSelector(selectSelectedProcess);

  if (!process) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Benefits of WMS for {process.title}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Key Benefits
            </Typography>
            <List>
              {process.benefits && process.benefits.length > 0 ? (
                process.benefits.map((benefit, index) => (
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
        </Grid>
        
        <Grid item xs={12} md={6}>
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
                {process.beforeAfterComparison && process.beforeAfterComparison.before ? (
                  process.beforeAfterComparison.before.map((item, index) => (
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
                        {process.beforeAfterComparison.after && process.beforeAfterComparison.after[index]}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No comparison information available</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BenefitsSection;
