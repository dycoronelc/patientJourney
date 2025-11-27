import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from '@mui/material';
import {
  Person,
  LocalHospital,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';

const PatientFlowChart: React.FC = () => {
  const steps = [
    {
      label: 'Llegada del Paciente',
      description: 'Registro y triage inicial',
      icon: <Person />,
    },
    {
      label: 'Consulta Médica',
      description: 'Evaluación por especialista',
      icon: <LocalHospital />,
    },
    {
      label: 'Estudios Complementarios',
      description: 'Laboratorios, imágenes, etc.',
      icon: <Assignment />,
    },
    {
      label: 'Alta y Seguimiento',
      description: 'Tratamiento y control',
      icon: <CheckCircle />,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Flujo Típico del Paciente
      </Typography>
      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} active={true}>
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
    </Box>
  );
};

export default PatientFlowChart;










