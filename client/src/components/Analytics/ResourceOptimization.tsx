import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  LocalHospital,
  Assessment,
  PriorityHigh,
  Lightbulb,
  AttachMoney,
  Speed,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { analyticsService, ResourceOptimization } from '../../services/analyticsService';
import InfoTooltip from '../Common/InfoTooltip';
import ImplementationPlanModal from './ImplementationPlanModal';
import { formatCurrency, formatPercentage } from '../../utils/numberFormatter';

interface ResourceOptimizationProps {
  specialtyIds?: number[];
}

const ResourceOptimizationComponent: React.FC<ResourceOptimizationProps> = ({ specialtyIds }) => {
  const [optimizations, setOptimizations] = useState<ResourceOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptimization, setSelectedOptimization] = useState<ResourceOptimization | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadOptimizations();
  }, [specialtyIds]);

  const loadOptimizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getResourceOptimization(specialtyIds);
      setOptimizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando optimizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleViewImplementationPlan = (optimization: ResourceOptimization) => {
    setSelectedOptimization(optimization);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOptimization(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <PriorityHigh color="error" />;
      case 'medium':
        return <Assessment color="warning" />;
      case 'low':
        return <Assessment color="success" />;
      default:
        return <Assessment />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta Prioridad';
      case 'medium':
        return 'Media Prioridad';
      case 'low':
        return 'Baja Prioridad';
      default:
        return 'Sin Prioridad';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 0.5) return 'error';
    if (utilization < 0.7) return 'warning';
    if (utilization < 0.9) return 'success';
    return 'error';
  };

  const getUtilizationLabel = (utilization: number) => {
    if (utilization < 0.5) return 'Subutilizado';
    if (utilization < 0.7) return 'Moderado';
    if (utilization < 0.9) return 'Óptimo';
    return 'Sobrecargado';
  };

  const totalSavings = optimizations.reduce((sum, opt) => sum + (opt.potential_savings || 0), 0);
  const highPriorityCount = optimizations.filter(opt => opt.implementation_priority === 'high').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          Optimización de Recursos
          <InfoTooltip
            title="Optimización de Recursos"
            description="Análisis de la utilización de recursos médicos y recomendaciones para mejorar la eficiencia operativa."
            calculation="Compara la utilización actual vs. óptima basada en benchmarks de la industria y análisis de capacidad"
          />
        </Typography>
        <Button variant="outlined" onClick={loadOptimizations}>
          Actualizar
        </Button>
      </Box>

      {/* Resumen */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary">
              {optimizations.length}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Optimizaciones Identificadas
              <InfoTooltip
                title="Optimizaciones Identificadas"
                description="Número total de oportunidades de optimización detectadas por el sistema de análisis."
                calculation="Suma de todas las recomendaciones generadas por el algoritmo de optimización"
              />
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
            <Typography variant="h4" color="error">
              {highPriorityCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Alta Prioridad
              <InfoTooltip
                title="Optimizaciones de Alta Prioridad"
                description="Número de recomendaciones marcadas como alta prioridad por su impacto potencial en la eficiencia."
                calculation="Conteo de optimizaciones con prioridad 'high' basado en impacto y facilidad de implementación"
              />
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main">
              {formatCurrency(totalSavings)}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Ahorro Potencial
              <InfoTooltip
                title="Ahorro Potencial Total"
                description="Suma total del ahorro económico estimado si se implementan todas las optimizaciones recomendadas."
                calculation="Suma de todos los valores de potential_savings de las optimizaciones identificadas"
              />
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de optimizaciones */}
      <Box>
        {optimizations.map((optimization, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                <Box flexGrow={1}>
                  <Typography variant="h6">
                    {optimization.resource_type}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip
                    icon={getPriorityIcon(optimization.implementation_priority)}
                    label={getPriorityLabel(optimization.implementation_priority)}
                    color={getPriorityColor(optimization.implementation_priority) as any}
                    size="small"
                  />
                  <Chip
                    icon={<AttachMoney />}
                    label={formatCurrency(optimization.potential_savings)}
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Utilización Actual vs Óptima
                  </Typography>
                  
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Actual</Typography>
                      <Typography variant="body2">
                        {formatPercentage((optimization.current_utilization || 0) * 100)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(optimization.current_utilization || 0) * 100}
                      color={getUtilizationColor(optimization.current_utilization || 0)}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {getUtilizationLabel(optimization.current_utilization || 0)}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Óptima</Typography>
                      <Typography variant="body2">
                        {formatPercentage((optimization.optimal_utilization || 0) * 100)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(optimization.optimal_utilization || 0) * 100}
                      color="success"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Recomendaciones
                  </Typography>
                  <List dense>
                    {(optimization.recommendations || []).map((recommendation, recIndex) => (
                      <ListItem key={recIndex} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Lightbulb fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recommendation}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Análisis de Impacto
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Diferencia de Utilización:
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPercentage(((optimization.optimal_utilization || 0) - (optimization.current_utilization || 0)) * 100)}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Potencial de Ahorro:
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(optimization.potential_savings)}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Prioridad de Implementación:
                      </Typography>
                      <Chip
                        icon={getPriorityIcon(optimization.implementation_priority)}
                        label={getPriorityLabel(optimization.implementation_priority)}
                        color={getPriorityColor(optimization.implementation_priority) as any}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      startIcon={<Speed />}
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleViewImplementationPlan(optimization)}
                    >
                      Ver Plan de Implementación
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {optimizations.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay optimizaciones disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Se requieren datos suficientes para identificar oportunidades de optimización.
          </Typography>
        </Paper>
      )}

      {/* Modal de Plan de Implementación */}
      <ImplementationPlanModal
        open={modalOpen}
        onClose={handleCloseModal}
        optimization={selectedOptimization}
      />
    </Box>
  );
};

export default ResourceOptimizationComponent;
