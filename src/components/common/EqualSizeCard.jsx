import React from 'react';
import { Box } from '@mui/material';

// This component ensures all cards have exactly the same dimensions
const EqualSizeCard = ({ children, height = 320, width = '100%' }) => {
  return (
    <Box
      sx={{
        height,
        width,
        display: 'flex',
        '& > *': {
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: height,
          maxHeight: height
        }
      }}
    >
      {children}
    </Box>
  );
};

export default EqualSizeCard;
