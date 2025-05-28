import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Calculate icon import removed

/**
 * Navigation component for moving between questionnaire sections
 */
const QuestionnaireNavigation = ({ 
  onNext, 
  onPrevious, 
  onSummary, 
  isFirstSection, 
  isLastSection,
  disableNext = false,
  completionStatus
}) => {
  // Check if all sections are completed
  const isQuestionnaireCompleted = () => {
    if (!completionStatus) return false;
    
    // Get all section IDs from the questionnaire slice
    const sectionIds = Object.keys(completionStatus);
    
    // Check if all sections are marked as complete
    return sectionIds.length > 0 && sectionIds.every(sectionId => completionStatus[sectionId] === 'complete');
  };
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      mt: 4,
      pt: 2,
      borderTop: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Step {isFirstSection ? '1' : isLastSection ? '3' : '2'} of 3: {isFirstSection ? 'Company Info' : isLastSection ? 'Final Review' : 'Questionnaire'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrevious}
          disabled={isFirstSection}
        >
          Previous
        </Button>
        
        {!isLastSection && isQuestionnaireCompleted() && (
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={onSummary}
          >
            Skip to Summary
          </Button>
        )}
        
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={disableNext}
          color={isLastSection ? "secondary" : "primary"}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionnaireNavigation;
