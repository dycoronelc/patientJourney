import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  LocalHospital,
  Schedule,
  Warning,
  Refresh,
  Notifications,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery, useQueryClient } from 'react-query';

// Servicios
import { dashboardService } from '../../services/dashboardService';
import { analyticsService } from '../../services/analyticsService';
import { bienimedAnalyticsService, DashboardStats } from '../../services/bienimedAnalyticsService';

// Componentes
import FilterPanel from '../../components/Dashboard/FilterPanel';
import LoadingIndicator from '../../components/Dashboard/LoadingIndicator';

// Componentes
import MetricCard from '../../components/Dashboard/MetricCard';
import RealTimeChart from '../../components/Dashboard/RealTimeChart';
import ResourceUtilization from '../../components/Dashboard/ResourceUtilization';
import PatientFlowChart from '../../components/Dashboard/PatientFlowChart';
import AlertsPanel from '../../components/Dashboard/AlertsPanel';
import { formatNumber, formatPercentage, formatCurrency, formatShortDate } from '../../utils/numberFormatter';

const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [activeFilters, setActiveFilters] = useState<{
    cliente?: any;
    area?: any;
    doctor?: any;
  }>({});
  
  const queryClient = useQueryClient();

  // React Query para datos del dashboard
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard', selectedTimeRange],
    queryFn: () => dashboardService.getDashboardData(selectedTimeRange),
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 25000, // Considerar datos obsoletos después de 25 segundos
  });

  // React Query para métricas en tiempo real
  const { data: realTimeMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['realTimeMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 10000, // Actualizar cada 10 segundos (más frecuente)
    staleTime: 8000,
  });

  // React Query para alertas
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardService.getAlerts(),
    refetchInterval: 60000, // Actualizar cada minuto
    staleTime: 50000,
  });

  // React Query para datos de Bienimed
  const { data: bienimedStats, isLoading: bienimedLoading } = useQuery({
    queryKey: ['bienimedStats'],
    queryFn: () => bienimedAnalyticsService.getDashboardStats(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 25000,
  });

  // Función para refrescar datos específicos
  const handleRefresh = async () => {
    // Invalidar y refrescar todas las queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['realTimeMetrics'] }),
      queryClient.invalidateQueries({ queryKey: ['alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['bienimedStats'] }),
    ]);
  };

  // Estados de carga combinados
  const loading = dashboardLoading || metricsLoading || alertsLoading || bienimedLoading;
  const error = dashboardError ? String(dashboardError) : null;

  // Datos de ejemplo para gráficos
  const patientVolumeData = [
    { time: '00:00', patients: 12 },
    { time: '04:00', patients: 8 },
    { time: '08:00', patients: 45 },
    { time: '12:00', patients: 78 },
    { time: '16:00', patients: 65 },
    { time: '20:00', patients: 32 },
  ];

  const resourceUtilizationData = [
    { name: 'Doctores', utilization: 85, capacity: 100 },
    { name: 'Enfermeras', utilization: 92, capacity: 100 },
    { name: 'Equipos', utilization: 67, capacity: 100 },
    { name: 'Salas', utilization: 78, capacity: 100 },
  ];

  const specialtyDistribution = [
    { name: 'Cardiología', value: 25, color: '#8884d8' },
    { name: 'Endocrinología', value: 20, color: '#82ca9d' },
    { name: 'Geriatría', value: 30, color: '#ffc658' },
    { name: 'Medicina General', value: 15, color: '#ff7300' },
    { name: 'Otras', value: 10, color: '#8dd1e1' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Button onClick={handleRefresh} sx={{ mt: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2,
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>

      {/* Panel de Filtros de BieniMedico */}
      <FilterPanel onFiltersChange={setActiveFilters} />

      {/* Sección de Agendar Cita y Métricas - Estilo BieniMedico */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f0f0f0',
      }}>
        {/* Lado izquierdo: Botón Agendar Cita y Fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            variant="contained"
            startIcon={<Schedule />}
            onClick={() => window.open('https://bienimeddemo.web.app/agenda', '_blank', 'noopener,noreferrer')}
            sx={{
              backgroundColor: '#7367f0',
              color: '#ffffff',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#5a52d5',
              },
            }}
          >
            + Agendar Cita
          </Button>
          
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#3e4954',
              fontSize: '1.5rem',
            }}>
              16 OCTUBRE
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#6e6b7b',
              fontSize: '0.875rem',
            }}>
              JUEVES
            </Typography>
          </Box>
        </Box>

        {/* Lado derecho: Métricas de Citas */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Agendado */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: 80,
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#7367f0',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1,
            }}>
              <People sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3e4954' }}>
              3
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6b7b', fontSize: '0.75rem' }}>
              Agendado
            </Typography>
          </Box>

          {/* En espera */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: 80,
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#ff9800',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1,
            }}>
              <Schedule sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3e4954' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6b7b', fontSize: '0.75rem' }}>
              En espera
            </Typography>
          </Box>

          {/* Atendido */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: 80,
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#55bcba',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1,
            }}>
              <LocalHospital sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3e4954' }}>
              1
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6b7b', fontSize: '0.75rem' }}>
              Atendido
            </Typography>
          </Box>

          {/* Cancelado */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: 80,
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#ea5455',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1,
            }}>
              <Warning sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3e4954' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6b7b', fontSize: '0.75rem' }}>
              Cancelado
            </Typography>
          </Box>

          {/* No asistió */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: 80,
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              backgroundColor: '#6e6b7b',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1,
            }}>
              <People sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3e4954' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6b7b', fontSize: '0.75rem' }}>
              No asistió
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alertas críticas */}
      {alerts && alerts.filter((alert: any) => alert.severity === 'critical').length > 0 && (
        <Box sx={{ mb: 3 }}>
          <AlertsPanel alerts={alerts.filter((alert: any) => alert.severity === 'critical') as any} />
        </Box>
      )}

      {/* KPIs y Métricas de Bienimed - 3 filas de 4 tarjetas cada una */}
      {bienimedStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Primera fila: 4 tarjetas */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Pacientes"
              value={formatNumber(bienimedStats.total_patients)}
              icon={<People />}
              trend={{ value: 0, isPositive: true }}
              color="success"
              tooltip={{
                title: "Total Pacientes",
                description: "Número total de pacientes registrados en el sistema Bienimed.",
                calculation: "Suma de todos los pacientes activos en la base de datos"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Doctores"
              value={formatNumber(bienimedStats.total_doctors)}
              icon={<LocalHospital />}
              trend={{ value: 0, isPositive: true }}
              color="primary"
              tooltip={{
                title: "Total Doctores",
                description: "Número total de doctores registrados en el sistema Bienimed.",
                calculation: "Suma de todos los doctores activos con nivel 2 y 6"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Diagnósticos"
              value={formatNumber(bienimedStats.total_diagnoses)}
              icon={<LocalHospital />}
              color="purple"
              tooltip={{
                title: "Total Diagnósticos",
                description: "Número total de diagnósticos registrados en el sistema Bienimed.",
                calculation: "Suma de todos los diagnósticos realizados por especialidades"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Procedimientos"
              value={formatNumber(bienimedStats.total_procedures)}
              icon={<LocalHospital />}
              color="purple"
              tooltip={{
                title: "Total Procedimientos",
                description: "Número total de procedimientos médicos realizados.",
                calculation: "Suma de todos los procedimientos ejecutados en el sistema"
              }}
            />
          </Grid>
          
          {/* Segunda fila: 4 tarjetas */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Referencias"
              value={formatNumber(bienimedStats.total_referrals)}
              icon={<LocalHospital />}
              color="purple"
              tooltip={{
                title: "Total Referencias",
                description: "Número total de referencias médicas entre especialidades.",
                calculation: "Suma de todas las referencias generadas por doctores"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Recetas"
              value={formatNumber(bienimedStats.total_prescriptions)}
              icon={<LocalHospital />}
              color="green"
              tooltip={{
                title: "Total Recetas",
                description: "Número total de recetas médicas emitidas.",
                calculation: "Suma de todas las prescripciones médicas generadas"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Órdenes Lab"
              value={formatNumber(bienimedStats.total_lab_orders)}
              icon={<LocalHospital />}
              color="blue"
              tooltip={{
                title: "Total Órdenes de Laboratorio",
                description: "Número total de órdenes de laboratorio solicitadas.",
                calculation: "Suma de todas las órdenes de laboratorio generadas"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Órdenes Imagen"
              value={formatNumber(bienimedStats.total_imaging_orders)}
              icon={<LocalHospital />}
              color="blue"
              tooltip={{
                title: "Total Órdenes de Imagen",
                description: "Número total de órdenes de estudios de imagen solicitadas.",
                calculation: "Suma de todas las órdenes de imagen (rayos X, resonancia, etc.)"
              }}
            />
          </Grid>
          
          {/* Tercera fila: 4 tarjetas */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Facturas"
              value={formatNumber(bienimedStats.total_invoices)}
              icon={<LocalHospital />}
              color="teal"
              tooltip={{
                title: "Total Facturas",
                description: "Número total de facturas generadas en el sistema Bienimed.",
                calculation: "Suma de todas las facturas emitidas por servicios médicos"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Ingresos Totales"
              value={formatCurrency(bienimedStats.total_revenue)}
              icon={<TrendingUp />}
              color="green"
              tooltip={{
                title: "Ingresos Totales",
                description: "Suma total de ingresos generados por servicios médicos.",
                calculation: "Suma de todos los montos de facturas pagadas y pendientes"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Factura Promedio"
              value={formatCurrency(bienimedStats.avg_invoice)}
              icon={<TrendingUp />}
              color="green"
              tooltip={{
                title: "Factura Promedio",
                description: "Valor promedio de las facturas emitidas en el sistema.",
                calculation: "Ingresos totales dividido entre el número total de facturas"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Última Actualización"
              value={formatShortDate(bienimedStats.last_updated)}
              icon={<Schedule />}
              color="info"
              tooltip={{
                title: "Última Actualización",
                description: "Fecha y hora de la última actualización de datos en el sistema Bienimed.",
                calculation: "Timestamp de la última sincronización de datos con la base de datos"
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Gráficos principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Volumen de pacientes en tiempo real */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Volumen de Pacientes - Tiempo Real
              </Typography>
              <RealTimeChart data={patientVolumeData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por especialidad */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Especialidad
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={specialtyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {specialtyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Utilización de recursos y flujo de pacientes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilización de Recursos
              </Typography>
              <ResourceUtilization data={resourceUtilizationData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Flujo de Pacientes
              </Typography>
              <PatientFlowChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Panel de alertas */}
      {alerts && alerts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas y Notificaciones
              </Typography>
              <AlertsPanel alerts={alerts as any} />
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Indicador de carga sutil */}
      <LoadingIndicator 
        isLoading={loading} 
        message="Actualizando datos..." 
      />
    </Box>
  );
};

export default Dashboard;