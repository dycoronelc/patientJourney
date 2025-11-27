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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  LocalHospital,
  Schedule,
  Refresh,
  Analytics,
  Assessment,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { bienimedAnalyticsService, PatientFlowAnalytics, RevenueAnalytics, DoctorPerformance, FlowRecommendation } from '../../services/bienimedAnalyticsService';

const BienimedAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientFlowData, setPatientFlowData] = useState<PatientFlowAnalytics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorPerformance | null>(null);
  const [flowRecommendations, setFlowRecommendations] = useState<FlowRecommendation[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [flowAnalytics, revenueAnalytics, doctorPerformance, recommendations] = await Promise.all([
        bienimedAnalyticsService.getPatientFlowAnalytics(),
        bienimedAnalyticsService.getRevenueAnalytics(),
        bienimedAnalyticsService.getDoctorPerformance(),
        bienimedAnalyticsService.getFlowRecommendations()
      ]);
      
      setPatientFlowData(flowAnalytics);
      setRevenueData(revenueAnalytics);
      setDoctorData(doctorPerformance);
      setFlowRecommendations(recommendations);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Error al cargar los datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando analytics de Bienimed...
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

  // Preparar datos para gráficos
  const diagnosisChartData = patientFlowData?.most_common_diagnoses ? 
    Object.entries(patientFlowData.most_common_diagnoses).map(([id, count]) => ({
      name: `Diagnóstico ${id}`,
      value: count
    })) : [];

  const procedureChartData = patientFlowData?.most_common_procedures ? 
    Object.entries(patientFlowData.most_common_procedures).map(([id, count]) => ({
      name: `Procedimiento ${id}`,
      value: count
    })) : [];

  const revenueChartData = revenueData?.monthly_revenue ? 
    Object.entries(revenueData.monthly_revenue).map(([month, revenue]) => ({
      month,
      revenue
    })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          📊 Analytics de Bienimed
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<Refresh />}
        >
          Actualizar
        </Button>
      </Box>

      {/* Resumen de datos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {patientFlowData?.total_consultations || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Consultas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {patientFlowData?.lab_orders_count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Órdenes de Laboratorio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {patientFlowData?.imaging_orders_count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Órdenes de Imagenología
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {bienimedAnalyticsService.formatCurrency(revenueData?.monthly_revenue ? 
                      Object.values(revenueData.monthly_revenue).reduce((a, b) => a + b, 0) : 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Ingresos Totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Diagnósticos más comunes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Diagnósticos Más Comunes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={diagnosisChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {diagnosisChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Procedimientos más comunes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Procedimientos Más Comunes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={procedureChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingresos por mes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingresos por Mes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [bienimedAnalyticsService.formatCurrency(Number(value)), 'Ingresos']} />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rendimiento de doctores */}
      {doctorData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rendimiento de Doctores
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doctor</TableCell>
                        <TableCell align="right">Diagnósticos</TableCell>
                        <TableCell align="right">Procedimientos</TableCell>
                        <TableCell align="right">Recetas</TableCell>
                        <TableCell align="right">Total Consultas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(doctorData.doctor_performance).map(([doctorId, performance]) => (
                        <TableRow key={doctorId}>
                          <TableCell>{performance.name}</TableCell>
                          <TableCell align="right">{performance.total_diagnoses}</TableCell>
                          <TableCell align="right">{performance.total_procedures}</TableCell>
                          <TableCell align="right">{performance.total_prescriptions}</TableCell>
                          <TableCell align="right">{performance.total_consultations}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recomendaciones de flujos */}
      {flowRecommendations.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Recomendaciones de Flujos Basadas en Datos Reales
                </Typography>
                <Grid container spacing={2}>
                  {flowRecommendations.map((recommendation, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {recommendation.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {recommendation.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Pasos del Flujo:
                            </Typography>
                            {recommendation.steps.map((step, stepIndex) => (
                              <Chip
                                key={stepIndex}
                                label={`${step.name} (${step.duration}min)`}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              <strong>Costo:</strong> {bienimedAnalyticsService.formatCurrency(recommendation.estimated_cost)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Duración:</strong> {recommendation.estimated_duration} min
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary">
                            <strong>Frecuencia:</strong> {recommendation.frequency} casos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BienimedAnalytics;



