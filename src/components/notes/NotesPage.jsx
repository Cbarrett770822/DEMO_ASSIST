import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import VoiceNotes from './VoiceNotes';

const NotesPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Warehouse Process Notes
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1" paragraph>
            Use this tool to record voice notes about warehouse processes and roles. This feature is particularly useful for documenting:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Role Responsibilities</strong> - Document specific tasks and responsibilities for different warehouse roles in each process.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Process Observations</strong> - Record observations about how processes are performed in your warehouse.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Improvement Ideas</strong> - Capture ideas for process improvements as they occur to you.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Training Notes</strong> - Create notes for training new staff on warehouse roles and responsibilities.
              </Typography>
            </li>
          </ul>
        </Paper>
        
        <VoiceNotes />
      </Box>
    </Container>
  );
};

export default NotesPage;
