import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import MouseRecorder from './MouseRecorder';

const RecordingPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Warehouse Process Recordings
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1" paragraph>
            Use this tool to record and play back your mouse movements and interactions within the WMS application. This feature is particularly useful for:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Training Materials</strong> - Create step-by-step visual guides for warehouse processes
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Process Documentation</strong> - Record the exact steps involved in completing warehouse tasks
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Role Demonstrations</strong> - Show the specific actions performed by different warehouse roles
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Workflow Optimization</strong> - Analyze recorded processes to identify inefficiencies
              </Typography>
            </li>
          </ul>
        </Paper>
        
        <MouseRecorder />
      </Box>
    </Container>
  );
};

export default RecordingPage;
