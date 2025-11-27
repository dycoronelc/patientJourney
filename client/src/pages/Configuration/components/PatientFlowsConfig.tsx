import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Person,
  LocalHospital,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';

const PatientFlowsConfig: React.FC = () => {
  const flows = [
    {
      name: 'Flujo de Cardiología',
      specialty: 'Cardiología',
      steps: [
        {
          label: 'Consulta Inicial',
          description: 'Evaluación inicial del paciente',
          icon: <Person />,
        },
        {
          label: 'Solicitud de Estudios',
          description: 'ECG, Ecocardiograma, Perfil Lipídico',
          icon: <Assignment />,
        },
        {
          label: 'Interpretación de Resultados',
          description: 'Análisis de estudios complementarios',
          icon: <LocalHospital />,
        },
        {
          label: 'Tratamiento y Seguimiento',
          description: 'Prescripción y control',
          icon: <CheckCircle />,
        },
      ],
    },
    {
      name: 'Flujo de Endocrinología',
      specialty: 'Endocrinología',
      steps: [
        {
          label: 'Consulta Inicial',
          description: 'Evaluación endocrinológica',
          icon: <Person />,
        },
        {
          label: 'Estudios Hormonales',
          description: 'TSH, T3, T4, Glucosa, HbA1c',
          icon: <Assignment />,
        },
        {
          label: 'Interpretación',
          description: 'Análisis de resultados hormonales',
          icon: <LocalHospital />,
        },
        {
          label: 'Tratamiento',
          description: 'Ajuste de medicación',
          icon: <CheckCircle />,
        },
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Configuración de Flujos de Pacientes
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {flows.map((flow, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {flow.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Especialidad: {flow.specialty}
                </Typography>
                <Stepper orientation="vertical">
                  {flow.steps.map((step, stepIndex) => (
                    <Step key={stepIndex} active={true}>
                      <StepLabel
                        icon={step.icon}
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontWeight: 'medium',
                          },
                        }}
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="textSecondary">
                          {step.description}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Flujos en Desarrollo
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Esta sección está en desarrollo. Próximamente incluirá:
        </Typography>
        <ul>
          <li>Editor visual de flujos</li>
          <li>Configuración de condiciones</li>
          <li>Asignación de recursos por paso</li>
          <li>Simulación de flujos</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default PatientFlowsConfig;










