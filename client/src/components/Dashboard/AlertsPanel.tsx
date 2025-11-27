import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
} from '@mui/icons-material';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'info': return <Info />;
      case 'success': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  if (alerts.length === 0) {
    return (
      <Alert severity="success">
        <AlertTitle>Sin Alertas</AlertTitle>
        No hay alertas activas en este momento.
      </Alert>
    );
  }

  return (
    <Box>
      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id} alignItems="flex-start">
            <ListItemIcon>
              {getIcon(alert.type)}
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    {alert.title}
                  </Typography>
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={getSeverityColor(alert.severity) as any}
                  />
                </Box>
              }
              secondary={
                <Box component="div">
                  <Typography variant="body2" color="textSecondary" component="div">
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="div">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AlertsPanel;
