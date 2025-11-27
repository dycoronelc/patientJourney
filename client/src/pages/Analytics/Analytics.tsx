import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timeline,
  Psychology,
  LocalHospital,
  Lightbulb,
  AttachMoney,
  Schedule,
} from '@mui/icons-material';
import InfoTooltip from '../../components/Common/InfoTooltip';
import { analyticsService, DashboardMetrics } from '../../services/analyticsService';
import { useQuery } from 'react-query';
import DemandPredictions from '../../components/Analytics/DemandPredictions';
import TrendAnalysisComponent from '../../components/Analytics/TrendAnalysis';
import ResourceOptimizationComponent from '../../components/Analytics/ResourceOptimization';
import { formatNumber, formatPercentage } from '../../utils/numberFormatter';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

  // Query para métricas del dashboard
  const { data: dashboardMetrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['analytics-dashboard-metrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSpecialtyChange = (event: any) => {
    const value = event.target.value;
    setSelectedSpecialties(typeof value === 'string' ? [] : value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <>
        <Typography variant="h4" gutterBottom>
          Analítica y Predicciones
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Análisis avanzado de datos médicos, predicciones de demanda y optimización de recursos.
        </Typography>

      {/* Métricas del Dashboard */}
      {metricsLoading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {metricsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error cargando métricas: {String(metricsError)}
        </Alert>
      )}

      {dashboardMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalHospital color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    Especialidades
                    <InfoTooltip
                      title="Especialidades Analizadas"
                      description="Número total de especialidades médicas que están siendo analizadas por el sistema de predicciones."
                      calculation="Suma de todas las especialidades únicas con datos de análisis disponibles"
                    />
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatNumber(dashboardMetrics.total_specialties)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Analizadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    Confianza Promedio
                    <InfoTooltip
                      title="Confianza Promedio"
                      description="Nivel promedio de confianza de todas las predicciones generadas por el sistema de IA."
                      calculation="Promedio de todos los niveles de confianza de las predicciones activas"
                    />
                  </Typography>
                </Box>
                <Typography variant="h4" color="secondary" gutterBottom>
                  {formatPercentage(dashboardMetrics.average_confidence * 100)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En predicciones
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    Tendencias Crecientes
                    <InfoTooltip
                      title="Tendencias Crecientes"
                      description="Número de métricas que muestran una tendencia ascendente en el análisis temporal."
                      calculation="Conteo de tendencias con dirección 'increasing' en el análisis de series temporales"
                    />
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {formatNumber(dashboardMetrics.increasing_trends)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Identificadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lightbulb color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    Alta Prioridad
                    <InfoTooltip
                      title="Optimizaciones de Alta Prioridad"
                      description="Número de recomendaciones de optimización marcadas como alta prioridad por su impacto potencial."
                      calculation="Conteo de optimizaciones con prioridad 'high' basado en impacto y facilidad de implementación"
                    />
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {formatNumber(dashboardMetrics.high_priority_optimizations)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Optimizaciones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Especialidades</InputLabel>
              <Select
                multiple
                value={selectedSpecialties}
                onChange={handleSpecialtyChange}
                label="Filtrar por Especialidades"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={`Especialidad ${value}`} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value={1}>Medicina General</MenuItem>
                <MenuItem value={2}>Cardiología</MenuItem>
                <MenuItem value={3}>Ginecología</MenuItem>
                <MenuItem value={4}>Psiquiatría</MenuItem>
                <MenuItem value={5}>Cirugía Cardiovascular</MenuItem>
                <MenuItem value={6}>Rehabilitación</MenuItem>
                <MenuItem value={7}>Neumonología</MenuItem>
                <MenuItem value={8}>Reumatología</MenuItem>
                <MenuItem value={9}>Neurofisiología</MenuItem>
                <MenuItem value={10}>Paidopsiquiatría</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">
              Última actualización: {dashboardMetrics ? new Date(dashboardMetrics.last_updated).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs de Análisis */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab 
              icon={<TrendingUp />} 
              label="Predicciones de Demanda" 
              iconPosition="start"
            />
            <Tab 
              icon={<Assessment />} 
              label="Análisis de Tendencias" 
              iconPosition="start"
            />
            <Tab 
              icon={<Timeline />} 
              label="Optimización de Recursos" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <DemandPredictions specialtyIds={selectedSpecialties.length > 0 ? selectedSpecialties : undefined} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TrendAnalysisComponent specialtyIds={selectedSpecialties.length > 0 ? selectedSpecialties : undefined} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ResourceOptimizationComponent specialtyIds={selectedSpecialties.length > 0 ? selectedSpecialties : undefined} />
        </TabPanel>
      </Paper>

      {/* Insights Generales */}
      {dashboardMetrics && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Insights Generales
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Schedule color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={`${dashboardMetrics.total_predictions} predicciones generadas con ${(dashboardMetrics.average_confidence * 100).toFixed(0)}% de confianza promedio`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TrendingUp color="success" />
              </ListItemIcon>
              <ListItemText
                primary={`${dashboardMetrics.increasing_trends} de ${dashboardMetrics.total_trends} tendencias muestran crecimiento`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Lightbulb color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={`${dashboardMetrics.high_priority_optimizations} optimizaciones requieren atención inmediata`}
              />
            </ListItem>
          </List>
        </Paper>
      )}
      </>
    </Box>
  );
};

export default Analytics;










