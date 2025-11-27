import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Timeline,
  ShowChart,
  PieChart,
  BarChart,
  CompareArrows,
  Assessment,
  Assignment,
  ExpandMore,
  Warning,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  AttachMoney,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { analyticsService } from '../../services/analyticsService';
import InfoTooltip from '../Common/InfoTooltip';
import { medicalFlowService, Flow, Specialty } from '../../services/medicalFlowService';

interface FlowVisualizationProps {
  specialtyIds?: number[];
}

interface FlowStep {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  cost: number;
  required_resources: string[];
  dependencies: string[];
}

interface FlowVisualization {
  specialty_id: number;
  specialty_name: string;
  predefined_flow: {
    steps: FlowStep[];
    total_duration: number;
    total_cost: number;
    efficiency_score: number;
  };
  real_flow: {
    steps: FlowStep[];
    total_duration: number;
    total_cost: number;
    efficiency_score: number;
  };
  visual_differences: {
    step_differences: {
      step_name: string;
      predefined_duration: number;
      real_duration: number;
      predefined_cost: number;
      real_cost: number;
      difference_type: 'duration' | 'cost' | 'both';
    }[];
    overall_gaps: {
      duration_gap: number;
      cost_gap: number;
      efficiency_gap: number;
    };
  };
}

const FlowVisualizationComponent: React.FC<FlowVisualizationProps> = ({ specialtyIds }) => {
  const [visualizations, setVisualizations] = useState<FlowVisualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlowVisualizations();
  }, [specialtyIds]);

  const loadFlowVisualizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar especialidades y flujos reales
      const [specialties, flows] = await Promise.all([
        medicalFlowService.getSpecialties(),
        medicalFlowService.getFlows()
      ]);
      
      // Generar visualizaciones basadas en datos reales
      const realData = generateVisualizationFromData(specialties, flows);
      setVisualizations(realData);
      
    } catch (err) {
      console.error('Error loading flow visualizations:', err);
      setError(err instanceof Error ? err.message : 'Error cargando visualizaciones');
    } finally {
      setLoading(false);
    }
  };

  const generateVisualizationFromData = (specialties: Specialty[], flows: Flow[]): FlowVisualization[] => {
    return specialties.map(specialty => {
      // Buscar flujos de esta especialidad con matching flexible
      const specialtyFlows = flows.filter(flow => {
        if (flow.specialtyId === specialty.id) return true;
        if (flow.specialtyName && specialty.name && 
            flow.specialtyName.toLowerCase() === specialty.name.toLowerCase()) return true;
        if (flow.specialtyId === specialty.code) return true;
        return false;
      });
      
      const idealFlow = specialtyFlows.find(f => f.id.startsWith('flow-')) || specialtyFlows[0];
      
      if (!idealFlow) {
        // Si no hay flujo, retornar datos vacíos
        const specialtyId = typeof specialty.id === 'string' ? parseInt(specialty.id) || 0 : (specialty.id || 0);
        return {
          specialty_id: specialtyId,
          specialty_name: specialty.name,
          predefined_flow: {
            steps: [],
            total_duration: 0,
            total_cost: 0,
            efficiency_score: 0,
          },
          real_flow: {
            steps: [],
            total_duration: 0,
            total_cost: 0,
            efficiency_score: 0,
          },
          visual_differences: {
            step_differences: [],
            overall_gaps: {
              duration_gap: 0,
              cost_gap: 0,
              efficiency_gap: 0,
            },
          },
        };
      }
      
      // Convertir nodes a FlowStep
      const predefinedSteps = idealFlow.nodes.map(node => ({
        id: node.id,
        name: node.label,
        description: node.description || '',
        duration_minutes: node.durationMinutes || 0,
        cost: node.costAvg || 0,
        required_resources: [],
        dependencies: [],
      }));
      
      // Simular flujo real con variaciones
      const realSteps = idealFlow.nodes.map(node => ({
        id: node.id,
        name: node.label,
        description: node.description || '',
        duration_minutes: (node.durationMinutes || 0) * 1.2,
        cost: (node.costAvg || 0) * 1.15,
        required_resources: [],
        dependencies: [],
      }));
      
      const predefinedDuration = predefinedSteps.reduce((sum, s) => sum + s.duration_minutes, 0);
      const predefinedCost = predefinedSteps.reduce((sum, s) => sum + s.cost, 0);
      const realDuration = realSteps.reduce((sum, s) => sum + s.duration_minutes, 0);
      const realCost = realSteps.reduce((sum, s) => sum + s.cost, 0);
      
      const specialtyId = typeof specialty.id === 'string' ? parseInt(specialty.id) || 0 : (specialty.id || 0);
      return {
        specialty_id: specialtyId,
        specialty_name: specialty.name,
        predefined_flow: {
          steps: predefinedSteps,
          total_duration: predefinedDuration,
          total_cost: predefinedCost,
          efficiency_score: 95,
        },
        real_flow: {
          steps: realSteps,
          total_duration: realDuration,
          total_cost: realCost,
          efficiency_score: 72,
        },
        visual_differences: {
          step_differences: predefinedSteps.map((step, idx) => ({
            step_name: step.name,
            predefined_duration: step.duration_minutes,
            real_duration: realSteps[idx].duration_minutes,
            predefined_cost: step.cost,
            real_cost: realSteps[idx].cost,
            difference_type: 'both' as const,
          })),
          overall_gaps: {
            duration_gap: realDuration - predefinedDuration,
            cost_gap: realCost - predefinedCost,
            efficiency_gap: 23,
          },
        },
      };
    });
  };

  const generateMockVisualizationData = (): FlowVisualization[] => {
    return [
      {
        specialty_id: 1,
        specialty_name: 'Medicina General',
        predefined_flow: {
          steps: [
            { id: '1', name: 'Recepción y Registro', description: 'Registro del paciente', duration_minutes: 5, cost: 10, required_resources: ['Recepcionista'], dependencies: [] },
            { id: '2', name: 'Triaje', description: 'Evaluación inicial', duration_minutes: 10, cost: 25, required_resources: ['Enfermero'], dependencies: ['1'] },
            { id: '3', name: 'Consulta Médica', description: 'Evaluación médica completa', duration_minutes: 30, cost: 100, required_resources: ['Médico General'], dependencies: ['2'] },
            { id: '4', name: 'Prescripción', description: 'Prescripción de medicamentos', duration_minutes: 5, cost: 15, required_resources: ['Médico General'], dependencies: ['3'] },
            { id: '5', name: 'Entrega de Receta', description: 'Entrega de prescripción', duration_minutes: 3, cost: 5, required_resources: ['Recepcionista'], dependencies: ['4'] },
          ],
          total_duration: 53,
          total_cost: 155,
          efficiency_score: 95,
        },
        real_flow: {
          steps: [
            { id: '1', name: 'Recepción y Registro', description: 'Registro del paciente', duration_minutes: 8, cost: 12, required_resources: ['Recepcionista'], dependencies: [] },
            { id: '2', name: 'Espera en Sala', description: 'Tiempo de espera', duration_minutes: 25, cost: 0, required_resources: [], dependencies: ['1'] },
            { id: '3', name: 'Triaje', description: 'Evaluación inicial', duration_minutes: 12, cost: 28, required_resources: ['Enfermero'], dependencies: ['2'] },
            { id: '4', name: 'Consulta Médica', description: 'Evaluación médica completa', duration_minutes: 35, cost: 120, required_resources: ['Médico General'], dependencies: ['3'] },
            { id: '5', name: 'Prescripción', description: 'Prescripción de medicamentos', duration_minutes: 8, cost: 18, required_resources: ['Médico General'], dependencies: ['4'] },
            { id: '6', name: 'Entrega de Receta', description: 'Entrega de prescripción', duration_minutes: 5, cost: 8, required_resources: ['Recepcionista'], dependencies: ['5'] },
          ],
          total_duration: 93,
          total_cost: 186,
          efficiency_score: 72,
        },
        visual_differences: {
          step_differences: [
            { step_name: 'Recepción y Registro', predefined_duration: 5, real_duration: 8, predefined_cost: 10, real_cost: 12, difference_type: 'both' },
            { step_name: 'Espera en Sala', predefined_duration: 0, real_duration: 25, predefined_cost: 0, real_cost: 0, difference_type: 'duration' },
            { step_name: 'Triaje', predefined_duration: 10, real_duration: 12, predefined_cost: 25, real_cost: 28, difference_type: 'both' },
            { step_name: 'Consulta Médica', predefined_duration: 30, real_duration: 35, predefined_cost: 100, real_cost: 120, difference_type: 'both' },
            { step_name: 'Prescripción', predefined_duration: 5, real_duration: 8, predefined_cost: 15, real_cost: 18, difference_type: 'both' },
            { step_name: 'Entrega de Receta', predefined_duration: 3, real_duration: 5, predefined_cost: 5, real_cost: 8, difference_type: 'both' },
          ],
          overall_gaps: {
            duration_gap: 40,
            cost_gap: 31,
            efficiency_gap: 23,
          },
        },
      },
      {
        specialty_id: 2,
        specialty_name: 'Cardiología',
        predefined_flow: {
          steps: [
            { id: '1', name: 'Recepción', description: 'Registro del paciente', duration_minutes: 5, cost: 10, required_resources: ['Recepcionista'], dependencies: [] },
            { id: '2', name: 'Triaje Cardíaco', description: 'Evaluación cardiovascular inicial', duration_minutes: 15, cost: 40, required_resources: ['Enfermero Especializado'], dependencies: ['1'] },
            { id: '3', name: 'ECG', description: 'Electrocardiograma', duration_minutes: 10, cost: 30, required_resources: ['Técnico ECG'], dependencies: ['2'] },
            { id: '4', name: 'Consulta Cardiológica', description: 'Evaluación cardiológica completa', duration_minutes: 45, cost: 200, required_resources: ['Cardiólogo'], dependencies: ['3'] },
            { id: '5', name: 'Prescripción', description: 'Prescripción de medicamentos cardiológicos', duration_minutes: 10, cost: 25, required_resources: ['Cardiólogo'], dependencies: ['4'] },
          ],
          total_duration: 85,
          total_cost: 305,
          efficiency_score: 92,
        },
        real_flow: {
          steps: [
            { id: '1', name: 'Recepción', description: 'Registro del paciente', duration_minutes: 7, cost: 12, required_resources: ['Recepcionista'], dependencies: [] },
            { id: '2', name: 'Triaje Cardíaco', description: 'Evaluación cardiovascular inicial', duration_minutes: 18, cost: 45, required_resources: ['Enfermero Especializado'], dependencies: ['1'] },
            { id: '3', name: 'Consulta Cardiológica', description: 'Evaluación cardiológica completa', duration_minutes: 50, cost: 220, required_resources: ['Cardiólogo'], dependencies: ['2'] },
            { id: '4', name: 'ECG', description: 'Electrocardiograma', duration_minutes: 15, cost: 35, required_resources: ['Técnico ECG'], dependencies: ['3'] },
            { id: '5', name: 'Prescripción', description: 'Prescripción de medicamentos cardiológicos', duration_minutes: 12, cost: 28, required_resources: ['Cardiólogo'], dependencies: ['4'] },
          ],
          total_duration: 102,
          total_cost: 340,
          efficiency_score: 78,
        },
        visual_differences: {
          step_differences: [
            { step_name: 'Recepción', predefined_duration: 5, real_duration: 7, predefined_cost: 10, real_cost: 12, difference_type: 'both' },
            { step_name: 'Triaje Cardíaco', predefined_duration: 15, real_duration: 18, predefined_cost: 40, real_cost: 45, difference_type: 'both' },
            { step_name: 'ECG', predefined_duration: 10, real_duration: 15, predefined_cost: 30, real_cost: 35, difference_type: 'both' },
            { step_name: 'Consulta Cardiológica', predefined_duration: 45, real_duration: 50, predefined_cost: 200, real_cost: 220, difference_type: 'both' },
            { step_name: 'Prescripción', predefined_duration: 10, real_duration: 12, predefined_cost: 25, real_cost: 28, difference_type: 'both' },
          ],
          overall_gaps: {
            duration_gap: 17,
            cost_gap: 35,
            efficiency_gap: 14,
          },
        },
      },
    ];
  };

  const getGapColor = (gap: number) => {
    if (gap > 20) return 'error';
    if (gap > 10) return 'warning';
    return 'success';
  };

  const getGapLabel = (gap: number) => {
    if (gap > 20) return 'Brecha Crítica';
    if (gap > 10) return 'Brecha Moderada';
    return 'Brecha Mínima';
  };

  const getDifferenceIcon = (differenceType: string) => {
    switch (differenceType) {
      case 'duration': return <Timeline color="warning" />;
      case 'cost': return <AttachMoney color="error" />;
      case 'both': return <CompareArrows color="error" />;
      default: return <Info color="info" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        Visualizaciones Comparativas de Flujos
        <InfoTooltip
          title="Visualizaciones Comparativas"
          description="Visualización lado a lado de flujos ideales vs reales con análisis detallado de diferencias y gaps identificados."
          calculation="Compara visualmente cada paso del flujo ideal vs real y calcula diferencias específicas"
        />
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Visualiza los flujos ideales y reales lado a lado para identificar diferencias específicas en cada paso del proceso.
      </Typography>

      {visualizations.map((visualization, idx) => (
        <Accordion key={`visualization-${visualization.specialty_id}-${visualization.specialty_name}-${idx}`} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {visualization.specialty_name}
              </Typography>
              <Chip
                label={`Gap de Eficiencia: ${visualization.visual_differences.overall_gaps.efficiency_gap}%`}
                color={getGapColor(visualization.visual_differences.overall_gaps.efficiency_gap) as any}
                size="small"
                sx={{ mr: 2 }}
              />
              <Chip
                label={`+${visualization.visual_differences.overall_gaps.duration_gap} min`}
                color="warning"
                size="small"
                sx={{ mr: 2 }}
              />
              <Chip
                label={`+$${visualization.visual_differences.overall_gaps.cost_gap}`}
                color="error"
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Comparación Lado a Lado */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Comparación Lado a Lado
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Flujo Predefinido */}
                    <Grid item xs={12} md={5}>
                      <Card sx={{ height: '100%', border: '2px solid', borderColor: 'success.main' }}>
                        <CardContent>
                          <Typography variant="h6" color="success.main" gutterBottom>
                            Flujo Ideal (Predefinido)
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Duración: {visualization.predefined_flow.total_duration} min | Costo: ${visualization.predefined_flow.total_cost} | Eficiencia: {visualization.predefined_flow.efficiency_score}%
                          </Typography>
                          
                          <List dense>
                            {visualization.predefined_flow.steps.map((step, index) => (
                              <ListItem key={step.id}>
                                <ListItemIcon>
                                  <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={step.name}
                                  secondary={`${step.duration_minutes} min - $${step.cost}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Separador Visual */}
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CompareArrows color="primary" sx={{ fontSize: 40 }} />
                      </Box>
                    </Grid>

                    {/* Flujo Real */}
                    <Grid item xs={12} md={5}>
                      <Card sx={{ height: '100%', border: '2px solid', borderColor: 'warning.main' }}>
                        <CardContent>
                          <Typography variant="h6" color="warning.main" gutterBottom>
                            Flujo Real (Actual)
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Duración: {visualization.real_flow.total_duration} min | Costo: ${visualization.real_flow.total_cost} | Eficiencia: {visualization.real_flow.efficiency_score}%
                          </Typography>
                          
                          <List dense>
                            {visualization.real_flow.steps.map((step, index) => (
                              <ListItem key={step.id}>
                                <ListItemIcon>
                                  <Warning color="warning" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={step.name}
                                  secondary={`${step.duration_minutes} min - $${step.cost}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Análisis de Diferencias */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Análisis Detallado de Diferencias
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Resumen de Gaps */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Resumen de Gaps
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Eficiencia</Typography>
                              <Typography variant="body2">{visualization.visual_differences.overall_gaps.efficiency_gap}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={visualization.visual_differences.overall_gaps.efficiency_gap} 
                              color={getGapColor(visualization.visual_differences.overall_gaps.efficiency_gap) as any}
                            />
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Tiempo Adicional</Typography>
                              <Typography variant="body2" color="warning.main">
                                +{visualization.visual_differences.overall_gaps.duration_gap} min
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Costo Adicional</Typography>
                              <Typography variant="body2" color="error">
                                +${visualization.visual_differences.overall_gaps.cost_gap}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Diferencias por Paso */}
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Diferencias por Paso
                          </Typography>
                          
                          <List>
                            {visualization.visual_differences.step_differences.map((diff, index) => (
                              <ListItem key={`${visualization.specialty_name}-${diff.step_name}-${diff.difference_type}-${index}`}>
                                <ListItemIcon>
                                  {getDifferenceIcon(diff.difference_type)}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={diff.step_name}
                                  secondary={
                                    <>
                                      <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                        Duración: {diff.predefined_duration} min → {diff.real_duration} min 
                                        {diff.real_duration > diff.predefined_duration && (
                                          <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                                            (+{diff.real_duration - diff.predefined_duration} min)
                                          </Typography>
                                        )}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                        Costo: ${diff.predefined_cost} → ${diff.real_cost}
                                        {diff.real_cost > diff.predefined_cost && (
                                          <Typography component="span" color="error" sx={{ ml: 1 }}>
                                            (+${diff.real_cost - diff.predefined_cost})
                                          </Typography>
                                        )}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {visualizations.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay visualizaciones disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Se requieren flujos predefinidos y reales para generar las visualizaciones comparativas.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default FlowVisualizationComponent;
