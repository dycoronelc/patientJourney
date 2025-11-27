import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  isLoading, 
  message = 'Actualizando...' 
}) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
      }}
    >
      <CircularProgress size={16} />
      <Typography variant="caption" sx={{ color: '#6e6b7b' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;
