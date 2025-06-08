import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { selectSelectedProcess } from '../../features/processes/processesSlice';

const MetricsSection = () => {
  const process = useSelector(selectSelectedProcess);

  if (!process) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SpeedIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h5" component="h2">
          Key Performance Indicators (KPIs)
        </Typography>
      </Box>
      
      <Typography variant="body1" component="div" sx={{ mb: 2 }}>
        Monitor these metrics to measure the effectiveness of your {process.title.toLowerCase()} process after implementing a WMS.
      </Typography>
      
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="KPI metrics table">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Metric Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Target Value</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Impact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {process.metrics && process.metrics.length > 0 ? (
              process.metrics.map((metric) => (
                <TableRow
                  key={metric.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                    {metric.name}
                  </TableCell>
                  <TableCell>{metric.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={metric.target} 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {getImpactChip(metric.name)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No metrics information available for this process
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          * These KPIs should be tracked regularly to measure the impact of your WMS implementation and identify areas for continuous improvement.
        </Typography>
      </Box>
    </Box>
  );
};

// Helper function to determine the impact level based on the metric name
const getImpactChip = (metricName) => {
  const lowImpactMetrics = ['Damage Rate', 'Return Rate'];
  const mediumImpactMetrics = ['Packing Material Cost', 'Shipping Cost', 'Labor Cost', 'Receipt Processing Cost'];
  const highImpactMetrics = [
    'Inventory Accuracy', 'Picking Accuracy', 'Receiving Accuracy', 'Putaway Accuracy', 
    'On-Time Shipping', 'Dock-to-Stock Time'
  ];
  
  if (highImpactMetrics.some(metric => metricName.includes(metric))) {
    return <Chip label="High Impact" color="error" size="small" />;
  } else if (mediumImpactMetrics.some(metric => metricName.includes(metric))) {
    return <Chip label="Medium Impact" color="warning" size="small" />;
  } else if (lowImpactMetrics.some(metric => metricName.includes(metric))) {
    return <Chip label="Low Impact" color="success" size="small" />;
  } else {
    return <Chip label="Medium Impact" color="warning" size="small" />;
  }
};

export default MetricsSection;
