import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CloudSync,
  Storage,
  Assignment,
  People,
} from '@mui/icons-material';

const Integration: React.FC = () => {
  const integrations = [
    {
      name: 'Sistemas de Laboratorio',
      description: 'Integración con LIS (Laboratory Information System)',
      status: 'Conectado',
      color: 'success' as const,
      icon: <Storage />,
    },
    {
      name: 'Sistemas de Imágenes',
      description: 'Integración con PACS (Picture Archiving and Communication System)',
      status: 'Conectado',
      color: 'success' as const,
      icon: <Assignment />,
    },
    {
      name: 'Sistemas de Citas',
      description: 'Integración con sistemas de agendamiento médico',
      status: 'Pendiente',
      color: 'warning' as const,
      icon: <People />,
    },
    {
      name: 'Sistemas de Referencias',
      description: 'Integración con sistemas de derivación médica',
      status: 'Pendiente',
      color: 'warning' as const,
      icon: <CloudSync />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Integración con Sistemas Externos
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Gestión de conexiones con sistemas hospitalarios externos.
      </Typography>

      <Grid container spacing={3}>
        {integrations.map((integration, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {integration.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {integration.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {integration.description}
                </Typography>
                <Chip
                  label={integration.status}
                  color={integration.color}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Integraciones
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Esta sección está en desarrollo. Próximamente incluirá:
        </Typography>
        <ul>
          <li>Configuración de APIs externas</li>
          <li>Sincronización automática de datos</li>
          <li>Monitoreo de conexiones</li>
          <li>Manejo de errores y reconexión</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default Integration;










