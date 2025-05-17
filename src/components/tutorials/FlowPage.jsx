import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlowPlayer from './FlowPlayer';
import BenefitsSection from './BenefitsSection';
import MetricsSection from './MetricsSection';
import QuizSection from './QuizSection';
import DownloadResources from './DownloadResources';
import { 
  selectProcess, 
  selectSelectedProcess 
} from '../../features/processes/processesSlice';

const FlowPage = () => {
  const { processId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const process = useSelector(selectSelectedProcess);
  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    // Select the process based on the URL parameter
    if (processId) {
      dispatch(selectProcess(processId));
    }
  }, [processId, dispatch]);

  const handleBackClick = () => {
    navigate('/processes');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!process) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            Process not found. Please select a valid process.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Back to Processes
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          Back to Processes
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="Flow tabs"
        >
          <Tab label="Flow" />
          <Tab label="Benefits" />
          <Tab label="KPI Metrics" />
          <Tab label="Quiz" />
          <Tab label="Resources" />
        </Tabs>
      </Paper>

      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        <FlowPlayer />
      </Box>

      <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
        <BenefitsSection />
      </Box>

      <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
        <MetricsSection />
      </Box>
      
      <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
        <QuizSection />
      </Box>
      
      <Box sx={{ display: tabValue === 4 ? 'block' : 'none' }}>
        <DownloadResources />
      </Box>
    </Container>
  );
};

export default FlowPage;
