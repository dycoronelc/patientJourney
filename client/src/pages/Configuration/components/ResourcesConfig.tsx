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
  Build,
  Person,
  LocalHospital,
  Room,
} from '@mui/icons-material';

const ResourcesConfig: React.FC = () => {
  const resources = [
    {
      name: 'Dr. Juan Pérez',
      type: 'doctor',
      category: 'Cardiólogo',
      availability: 'available',
      capacity: 1,
      currentUtilization: 0,
    },
    {
      name: 'Enfermera María García',
      type: 'nurse',
      category: 'Enfermera General',
      availability: 'busy',
      capacity: 1,
      currentUtilization: 100,
    },
    {
      name: 'Ecógrafo Cardíaco',
      type: 'equipment',
      category: 'Imagenología',
      availability: 'available',
      capacity: 1,
      currentUtilization: 0,
    },
    {
      name: 'Sala de Consulta 1',
      type: 'room',
      category: 'Consultorio',
      availability: 'available',
      capacity: 1,
      currentUtilization: 0,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'doctor': return <Person />;
      case 'nurse': return <Person />;
      case 'equipment': return <Build />;
      case 'room': return <Room />;
      default: return <LocalHospital />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'maintenance': return 'error';
      case 'unavailable': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestión de Recursos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTypeIcon(resource.type)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {resource.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {resource.category}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={resource.type}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={resource.availability}
                    size="small"
                    color={getAvailabilityColor(resource.availability) as any}
                  />
                </Box>
                <Typography variant="body2">
                  Utilización: {resource.currentUtilization}% / {resource.capacity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Recursos en Desarrollo
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Esta sección está en desarrollo. Próximamente incluirá:
        </Typography>
        <ul>
          <li>CRUD completo de recursos</li>
          <li>Asignación de recursos a centros</li>
          <li>Monitoreo de utilización en tiempo real</li>
          <li>Programación de mantenimiento</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default ResourcesConfig;










