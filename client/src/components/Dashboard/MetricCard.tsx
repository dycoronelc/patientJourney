import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import InfoTooltip from '../Common/InfoTooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'teal' | 'orange' | 'red' | 'blue' | 'green';
  tooltip?: {
    title: string;
    description?: string;
    calculation?: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  tooltip,
}) => {
  const getColor = () => {
    switch (color) {
      case 'primary': return '#7367f0'; // Púrpura principal de BieniMedico
      case 'secondary': return '#7367f0'; // Púrpura de BieniMedico
      case 'success': return '#55bcba'; // Verde/Azul claro de BieniMedico
      case 'warning': return '#ff9800'; // Naranja
      case 'error': return '#ea5455'; // Rojo de BieniMedico
      case 'info': return '#2196f3'; // Azul
      case 'purple': return '#9c27b0'; // Púrpura
      case 'teal': return '#20c997'; // Verde teal
      case 'orange': return '#ff9800'; // Naranja
      case 'red': return '#f44336'; // Rojo
      case 'blue': return '#2196f3'; // Azul
      case 'green': return '#4caf50'; // Verde
      default: return '#7367f0';
    }
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f0f0f0',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-2px)',
      },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              sx={{ 
                color: '#6e6b7b',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {title}
              {tooltip && (
                <InfoTooltip
                  title={tooltip.title}
                  description={tooltip.description}
                  calculation={tooltip.calculation}
                />
              )}
            </Typography>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#3e4954',
                fontSize: '2rem',
                mb: trend ? 1 : 0,
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend.isPositive ? (
                  <TrendingUp sx={{ 
                    color: '#55bcba', 
                    fontSize: 18, 
                    mr: 0.5 
                  }} />
                ) : (
                  <TrendingDown sx={{ 
                    color: '#ea5455', 
                    fontSize: 18, 
                    mr: 0.5 
                  }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend.isPositive ? '#55bcba' : '#ea5455',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {Math.abs(trend.value)}%
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    color: '#6e6b7b',
                    fontSize: '0.75rem',
                  }}
                >
                  vs mes anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: getColor(),
              width: 64,
              height: 64,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;








