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
  CompareArrows,
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  ExpandMore,
  Lightbulb,
  Timeline,
  Assessment,
  Speed,
  Group,
  AttachMoney,
  MedicalServices,
  Science,
  CameraAlt,
  Psychology,
  Medication,
  ArrowForward,
  Schedule,
  ExitToApp,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { medicalFlowService, Flow, Specialty } from '../../services/medicalFlowService';
import InfoTooltip from '../Common/InfoTooltip';

interface FlowComparisonProps {
  specialtyIds?: string[];
}

interface FlowComparisonData {
  specialty: Specialty;
  idealFlow: Flow;
  realFlow: Flow;
  differences: {
    addedSteps: string[];
    removedSteps: string[];
    durationDifference: number;
    costDifference: number;
    efficiencyGap: number;
  };
  recommendations: string[];
}

const FlowComparisonComponent: React.FC<FlowComparisonProps> = ({ specialtyIds }) => {
  const [comparisons, setComparisons] = useState<FlowComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([]);
  const [availableFlows, setAvailableFlows] = useState<Flow[]>([]);

  useEffect(() => {
    loadData();
  }, [specialtyIds]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar especialidades y flujos en paralelo
      const [specialties, flows] = await Promise.all([
        medicalFlowService.getSpecialties(),
        medicalFlowService.getFlows()
      ]);
      
      setAvailableSpecialties(specialties);
      setAvailableFlows(flows);
      
      // Generar comparaciones basadas en los datos reales
      generateComparisons(specialties, flows);
      
    } catch (error) {
      console.error('Error loading flow comparison data:', error);
      setError('Error al cargar los datos de comparación de flujos');
    } finally {
      setLoading(false);
    }
  };

  const generateComparisons = (specialties: Specialty[], flows: Flow[]) => {
    const comparisons: FlowComparisonData[] = [];
    
    // Para cada especialidad, crear una comparación
    specialties.forEach(specialty => {
      // Intentar múltiples formas de matching
      const specialtyFlows = flows.filter(flow => {
        // Matching por ID exacto
        if (flow.specialtyId === specialty.id) return true;
        // Matching por nombre (case insensitive)
        if (flow.specialtyName && specialty.name && 
            flow.specialtyName.toLowerCase() === specialty.name.toLowerCase()) return true;
        // Matching por código si existe
        if (flow.specialtyId === specialty.code) return true;
        return false;
      });
      
      if (specialtyFlows.length > 0) {
        // Si hay múltiples flujos, usar el primero como "ideal" y los demás como "reales"
        // Si solo hay uno, generar un flujo "real" simulado
        const idealFlow = specialtyFlows.find(f => f.id.startsWith('flow-')) || specialtyFlows[0];
        const realFlow = specialtyFlows.length > 1 
          ? specialtyFlows.find(f => f.id !== idealFlow.id) || specialtyFlows[0]
          : generateRealFlow(idealFlow);
        
        const differences = calculateDifferences(idealFlow, realFlow);
        const recommendations = generateRecommendations(differences, specialty);
        
        comparisons.push({
          specialty,
          idealFlow,
          realFlow,
          differences,
          recommendations
        });
      }
    });
    
    setComparisons(comparisons);
  };

  const generateRealFlow = (idealFlow: Flow): Flow => {
    // Simular un flujo real con algunas variaciones respecto al ideal
    const realFlow = { 
      ...idealFlow,
      nodes: [...idealFlow.nodes], // Crear copia del array de nodos
      edges: [...idealFlow.edges]  // Crear copia del array de edges
    };
    
    // Simular algunos pasos adicionales o removidos
    const variations = Math.random() > 0.5 ? 'add' : 'remove';
    const numVariations = Math.floor(Math.random() * 3) + 1;
    
    if (variations === 'add' && realFlow.nodes.length > 0) {
      // Agregar pasos adicionales
      for (let i = 0; i < numVariations; i++) {
        const newNode = {
          id: `extra-${i}`,
          flowId: realFlow.id,
          stepTypeId: 'st-cons',
          stepTypeName: 'Consulta',
          label: `Paso adicional ${i + 1}`,
          description: 'Paso no planificado',
          orderIndex: realFlow.nodes.length + i,
          durationMinutes: 15,
          costMin: 10,
          costMax: 30,
          costAvg: 20,
          position: { x: 300, y: 100 },
          createdAt: new Date().toISOString()
        };
        realFlow.nodes.push(newNode);
      }
    } else if (variations === 'remove' && realFlow.nodes.length > 2) {
      // Remover algunos pasos
      const stepsToRemove = Math.min(numVariations, realFlow.nodes.length - 2);
      realFlow.nodes.splice(-stepsToRemove, stepsToRemove);
    }
    
    // Ajustar duración y costo total
    realFlow.averageDuration = realFlow.nodes.reduce((sum, node) => sum + (node.durationMinutes || 0), 0);
    realFlow.estimatedCost = realFlow.nodes.reduce((sum, node) => sum + (node.costAvg || 0), 0);
    
    return realFlow;
  };

  const calculateDifferences = (idealFlow: Flow, realFlow: Flow) => {
    const idealStepNames = idealFlow.nodes.map(node => node.label);
    const realStepNames = realFlow.nodes.map(node => node.label);
    
    const addedSteps = realStepNames.filter(step => !idealStepNames.includes(step));
    const removedSteps = idealStepNames.filter(step => !realStepNames.includes(step));
    
    const durationDifference = (realFlow.averageDuration || 0) - (idealFlow.averageDuration || 0);
    const costDifference = (realFlow.estimatedCost || 0) - (idealFlow.estimatedCost || 0);
    
    // Calcular brecha de eficiencia (0-100%)
    const idealEfficiency = 100; // Flujo ideal es 100% eficiente
    const realEfficiency = Math.max(0, 100 - (Math.abs(durationDifference) / (idealFlow.averageDuration || 1)) * 10);
    const efficiencyGap = idealEfficiency - realEfficiency;
    
    return {
      addedSteps,
      removedSteps,
      durationDifference,
      costDifference,
      efficiencyGap
    };
  };

  const generateRecommendations = (differences: any, specialty: Specialty): string[] => {
    const recommendations: string[] = [];
    
    if (differences.addedSteps.length > 0) {
      recommendations.push(`Eliminar ${differences.addedSteps.length} pasos innecesarios para optimizar el flujo`);
    }
    
    if (differences.removedSteps.length > 0) {
      recommendations.push(`Implementar ${differences.removedSteps.length} pasos faltantes del flujo estándar`);
    }
    
    if (differences.durationDifference > 0) {
      recommendations.push(`Reducir la duración total en ${medicalFlowService.formatDuration(differences.durationDifference)}`);
    }
    
    if (differences.costDifference > 0) {
      recommendations.push(`Optimizar costos para reducir ${medicalFlowService.formatCost(differences.costDifference)}`);
    }
    
    if (differences.efficiencyGap > 20) {
      recommendations.push(`Implementar mejoras de eficiencia para reducir la brecha del ${differences.efficiencyGap.toFixed(1)}%`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('El flujo actual está muy cerca del flujo ideal');
    }
    
    return recommendations;
  };

  const getStepIcon = (stepTypeCode: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'consultation': <MedicalServices sx={{ fontSize: 20 }} />,
      'laboratory': <Science sx={{ fontSize: 20 }} />,
      'imaging': <CameraAlt sx={{ fontSize: 20 }} />,
      'diagnosis': <Psychology sx={{ fontSize: 20 }} />,
      'prescription': <Medication sx={{ fontSize: 20 }} />,
      'referral': <ArrowForward sx={{ fontSize: 20 }} />,
      'followup': <Schedule sx={{ fontSize: 20 }} />,
      'emergency': <Warning sx={{ fontSize: 20 }} />,
      'procedure': <Assessment sx={{ fontSize: 20 }} />,
      'discharge': <ExitToApp sx={{ fontSize: 20 }} />
    };
    return iconMap[stepTypeCode] || <MedicalServices sx={{ fontSize: 20 }} />;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 70) return 'warning';
    return 'error';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 90) return 'Excelente';
    if (efficiency >= 70) return 'Buena';
    if (efficiency >= 50) return 'Regular';
    return 'Necesita Mejora';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Cargando comparaciones de flujos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          Comparación de Flujos Ideales vs Reales
          <InfoTooltip
            title="Comparación de Flujos"
            description="Análisis comparativo entre flujos médicos ideales (estándar) y flujos reales observados en la práctica clínica."
            calculation="Compara pasos, duración, costos y eficiencia entre flujos ideales y reales para identificar oportunidades de mejora"
          />
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Analiza las diferencias entre los flujos médicos ideales y los flujos reales observados para identificar oportunidades de optimización.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> Los flujos "reales" mostrados son simulaciones basadas en variaciones típicas observadas en la práctica clínica, 
            ya que actualmente cada especialidad tiene un flujo estándar. Para comparaciones con datos reales, se necesitarían múltiples flujos por especialidad.
          </Typography>
        </Alert>
      </Box>

      {comparisons.length === 0 ? (
        <Alert severity="info">
          No hay datos de comparación disponibles. Asegúrate de que haya flujos médicos cargados en el sistema.
        </Alert>
      ) : (
        <Box>
          {comparisons.map((comparison, index) => (
            <Accordion key={comparison.specialty.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      {comparison.specialty.name}
                      <Chip 
                        label={getEfficiencyLabel(100 - comparison.differences.efficiencyGap)} 
                        color={getEfficiencyColor(100 - comparison.differences.efficiencyGap)}
                        size="small" 
                        sx={{ ml: 2 }} 
                      />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {comparison.idealFlow.name} vs Flujo Real
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                    <Chip 
                      icon={<Timeline />} 
                      label={`${comparison.idealFlow.nodes.length} vs ${comparison.realFlow.nodes.length} pasos`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      icon={<AttachMoney />} 
                      label={`${medicalFlowService.formatCost(comparison.idealFlow.estimatedCost || 0)} vs ${medicalFlowService.formatCost(comparison.realFlow.estimatedCost || 0)}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Resumen de diferencias */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <CompareArrows sx={{ mr: 1 }} />
                          Resumen de Diferencias
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Eficiencia del Flujo Real
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={100 - comparison.differences.efficiencyGap} 
                            color={getEfficiencyColor(100 - comparison.differences.efficiencyGap)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {(100 - comparison.differences.efficiencyGap).toFixed(1)}% eficiente
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                              <Typography variant="h6" color="error">
                                {comparison.differences.addedSteps.length}
                              </Typography>
                              <Typography variant="caption">
                                Pasos Adicionales
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                              <Typography variant="h6" color="warning">
                                {comparison.differences.removedSteps.length}
                              </Typography>
                              <Typography variant="caption">
                                Pasos Faltantes
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Duración:</Typography>
                          <Typography variant="body2" color={comparison.differences.durationDifference > 0 ? 'error' : 'success'}>
                            {comparison.differences.durationDifference > 0 ? '+' : ''}
                            {medicalFlowService.formatDuration(Math.abs(comparison.differences.durationDifference))}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Costo:</Typography>
                          <Typography variant="body2" color={comparison.differences.costDifference > 0 ? 'error' : 'success'}>
                            {comparison.differences.costDifference > 0 ? '+' : ''}
                            {medicalFlowService.formatCost(Math.abs(comparison.differences.costDifference))}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Recomendaciones */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <Lightbulb sx={{ mr: 1 }} />
                          Recomendaciones
                        </Typography>
                        
                        <List dense>
                          {comparison.recommendations.map((recommendation, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircle color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={recommendation}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Button
                          variant="contained"
                          startIcon={<Speed />}
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => alert('Funcionalidad de plan de mejora en desarrollo')}
                        >
                          Ver Plan de Mejora Detallado
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Comparación detallada de pasos */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Comparación Detallada de Pasos
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {/* Flujo Ideal */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, border: '2px solid', borderColor: 'success.main' }}>
                              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle sx={{ mr: 1 }} />
                                Flujo Ideal
                              </Typography>
                              <List dense>
                                {comparison.idealFlow.nodes.map((node, idx) => (
                                  <ListItem key={node.id} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      {getStepIcon(node.stepTypeId)}
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={node.label}
                                      secondary={`${medicalFlowService.formatDuration(node.durationMinutes || 0)} - ${medicalFlowService.formatCost(node.costAvg || 0)}`}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                      secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                          
                          {/* Flujo Real */}
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, border: '2px solid', borderColor: 'info.main' }}>
                              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Assessment sx={{ mr: 1 }} />
                                Flujo Real
                              </Typography>
                              <List dense>
                                {comparison.realFlow.nodes.map((node, idx) => {
                                  const isAdded = comparison.differences.addedSteps.includes(node.label);
                                  const isRemoved = comparison.differences.removedSteps.includes(node.label);
                                  
                                  return (
                                    <ListItem 
                                      key={node.id} 
                                      sx={{ 
                                        py: 0.5
                                      }}
                                    >
                                      <ListItemIcon sx={{ minWidth: 30 }}>
                                        <Box sx={{ color: isAdded ? 'error.main' : isRemoved ? 'warning.main' : 'inherit' }}>
                                          {getStepIcon(node.stepTypeId)}
                                        </Box>
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={node.label}
                                        secondary={`${medicalFlowService.formatDuration(node.durationMinutes || 0)} - ${medicalFlowService.formatCost(node.costAvg || 0)}`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                      />
                                      {isAdded && (
                                        <Chip label="+" size="small" color="error" />
                                      )}
                                      {isRemoved && (
                                        <Chip label="-" size="small" color="warning" />
                                      )}
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FlowComparisonComponent;