import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  AttachMoney,
  Group,
  Warning,
  Info,
  Timeline,
  Assignment,
} from '@mui/icons-material';

interface ImplementationPlanModalProps {
  open: boolean;
  onClose: () => void;
  optimization: {
    specialty_id?: string | number;
    specialty_name?: string;
    resource_type: string;
    recommendations: string[];
    potential_savings: number;
    implementation_priority: string;
    current_utilization: number;
    optimal_utilization: number;
  } | null;
}

interface ImplementationStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  cost: number;
  resources: string[];
  dependencies: string[];
  risks: string[];
  deliverables: string[];
}

const ImplementationPlanModal: React.FC<ImplementationPlanModalProps> = ({
  open,
  onClose,
  optimization,
}) => {
  if (!optimization) return null;

  // Generar plan de implementación basado en la optimización
  const generateImplementationPlan = (): ImplementationStep[] => {
    const baseSteps: ImplementationStep[] = [
      {
        id: 1,
        title: "Análisis y Preparación",
        description: "Evaluación detallada del estado actual y preparación del entorno",
        duration: "1-2 semanas",
        cost: optimization.potential_savings * 0.1,
        resources: ["Analista de procesos", "Equipo de TI"],
        dependencies: ["Aprobación de presupuesto"],
        risks: ["Resistencia al cambio", "Falta de recursos"],
        deliverables: ["Reporte de análisis", "Plan detallado"]
      },
      {
        id: 2,
        title: "Diseño de Solución",
        description: "Diseño de la nueva estructura y procesos optimizados",
        duration: "2-3 semanas",
        cost: optimization.potential_savings * 0.15,
        resources: ["Arquitecto de procesos", "Especialista en recursos"],
        dependencies: ["Completar análisis"],
        risks: ["Complejidad técnica", "Cambios de alcance"],
        deliverables: ["Diseño técnico", "Especificaciones"]
      },
      {
        id: 3,
        title: "Implementación Piloto",
        description: "Implementación en un área limitada para validar la solución",
        duration: "3-4 semanas",
        cost: optimization.potential_savings * 0.25,
        resources: ["Equipo de implementación", "Personal médico"],
        dependencies: ["Aprobación del diseño"],
        risks: ["Problemas técnicos", "Resistencia del personal"],
        deliverables: ["Sistema piloto", "Reporte de resultados"]
      },
      {
        id: 4,
        title: "Despliegue Completo",
        description: "Implementación en toda la especialidad",
        duration: "4-6 semanas",
        cost: optimization.potential_savings * 0.3,
        resources: ["Equipo completo", "Personal de todas las áreas"],
        dependencies: ["Éxito del piloto"],
        risks: ["Interrupciones del servicio", "Problemas de escalabilidad"],
        deliverables: ["Sistema completo", "Documentación"]
      },
      {
        id: 5,
        title: "Monitoreo y Optimización",
        description: "Seguimiento continuo y ajustes finos",
        duration: "Ongoing",
        cost: optimization.potential_savings * 0.2,
        resources: ["Equipo de monitoreo", "Analistas"],
        dependencies: ["Despliegue completo"],
        risks: ["Degradación del rendimiento"],
        deliverables: ["Reportes de rendimiento", "Mejoras continuas"]
      }
    ];

    return baseSteps;
  };

  const implementationSteps = generateImplementationPlan();
  const totalCost = implementationSteps.reduce((sum, step) => sum + step.cost, 0);
  const totalDuration = "12-16 semanas";

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'Alta Prioridad';
      case 'medium': return 'Media Prioridad';
      case 'low': return 'Baja Prioridad';
      default: return priority;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            Plan de Implementación
          </Typography>
          <Chip 
            label={getPriorityLabel(optimization.implementation_priority)}
            color={getPriorityColor(optimization.implementation_priority)}
            size="small"
          />
        </Box>
        <Typography variant="subtitle1" color="textSecondary">
          {optimization.specialty_name || 'Especialidad General'} - {optimization.resource_type}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Resumen Ejecutivo */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Resumen Ejecutivo
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  ${optimization.potential_savings.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ahorro Potencial
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="secondary">
                  {totalDuration}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duración Total
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  ${totalCost.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Inversión Requerida
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {((optimization.potential_savings - totalCost) / optimization.potential_savings * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ROI Esperado
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Estado Actual vs Objetivo */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Estado Actual vs Objetivo
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Utilización Actual
                </Typography>
                <Typography variant="h4" color="error">
                  {(optimization.current_utilization * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Utilización Objetivo
                </Typography>
                <Typography variant="h4" color="success.main">
                  {(optimization.optimal_utilization * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Recomendaciones */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recomendaciones Clave
          </Typography>
          <List dense>
            {optimization.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Plan de Implementación Detallado */}
        <Typography variant="h6" gutterBottom>
          Plan de Implementación Detallado
        </Typography>
        
        <Stepper orientation="vertical">
          {implementationSteps.map((step) => (
            <Step key={step.id} active>
              <StepLabel>
                <Typography variant="h6">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duración: {step.duration} | Costo: ${step.cost.toFixed(0)}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" paragraph>
                    {step.description}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recursos Necesarios:
                      </Typography>
                      <List dense>
                        {step.resources.map((resource, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Group fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={resource} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Dependencias:
                      </Typography>
                      <List dense>
                        {step.dependencies.map((dependency, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Timeline fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={dependency} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Entregables:
                      </Typography>
                      <List dense>
                        {step.deliverables.map((deliverable, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Assignment fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={deliverable} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Riesgos Identificados:
                      </Typography>
                      <List dense>
                        {step.risks.map((risk, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Warning fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText primary={risk} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Consideraciones Adicionales */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Consideraciones Importantes:
          </Typography>
          <Typography variant="body2">
            • Este plan es una guía general y puede requerir ajustes según las condiciones específicas de la institución.
            • Se recomienda realizar una evaluación de impacto más detallada antes de la implementación.
            • Los costos y tiempos son estimaciones basadas en proyectos similares.
            • Es fundamental contar con el apoyo de la dirección y el personal involucrado.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button variant="contained" color="primary">
          Exportar Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImplementationPlanModal;
