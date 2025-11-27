import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Grid,
} from '@mui/material';

interface ResourceUtilizationProps {
  data: Array<{
    name: string;
    utilization: number;
    capacity: number;
  }>;
}

const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({ data }) => {
  const getColor = (utilization: number) => {
    if (utilization >= 90) return 'error';
    if (utilization >= 75) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {data.map((resource, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {resource.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {resource.utilization}% / {resource.capacity}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={resource.utilization}
            color={getColor(resource.utilization) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ResourceUtilization;








