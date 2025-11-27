import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface InfoTooltipProps {
  title: string;
  description?: string;
  calculation?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  description, 
  calculation, 
  placement = 'top' 
}) => {
  const tooltipContent = (
    <div style={{ maxWidth: 300 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
        {title}
      </div>
      {description && (
        <div style={{ marginBottom: 8 }}>
          {description}
        </div>
      )}
      {calculation && (
        <div style={{ fontSize: '0.85em', fontStyle: 'italic', color: '#e0e0e0' }}>
          <strong>Cálculo:</strong> {calculation}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip 
      title={tooltipContent} 
      placement={placement}
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={3000}
    >
      <IconButton 
        size="small" 
        sx={{ 
          p: 0.5, 
          ml: 0.5,
          '&:hover': { 
            backgroundColor: 'rgba(0, 0, 0, 0.04)' 
          }
        }}
      >
        <InfoOutlined fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  );
};

export default InfoTooltip;


