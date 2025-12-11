import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People,
  LocalHospital,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { pecService, PECDashboardStats } from '../../services/pecService';
import { formatNumber } from '../../utils/numberFormatter';

const COLORS = ['#7367f0', '#55bcba', '#ff9800', '#ea5455', '#9c88ff'];

const PECDashboard: React.FC = () => {
  const [stats, setStats] = useState<PECDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await pecService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Alert severity="error">
        {error || 'No se pudieron cargar los datos'}
      </Alert>
    );
  }

  // Datos para gráfico de pie de condiciones
  const conditionData = [
    { name: 'Diabetes Tipo 2', value: stats.patientsWithDiabetes },
    { name: 'Prediabetes', value: stats.patientsWithPrediabetes },
    { name: 'Normal', value: stats.patientsNormal },
    { name: 'Sin Datos', value: stats.patientsNoData },
  ].filter((item) => item.value > 0);

  // Datos para gráfico de barras por género
  const genderData = [
    { name: 'Masculino', value: stats.byGender.male },
    { name: 'Femenino', value: stats.byGender.female },
  ];

  // Datos para gráfico de barras por grupo de edad
  const ageGroupData = [
    { name: '18-39', value: stats.byAgeGroup['18-39'] },
    { name: '40-59', value: stats.byAgeGroup['40-59'] },
    { name: '60-79', value: stats.byAgeGroup['60-79'] },
    { name: '80+', value: stats.byAgeGroup['80+'] },
  ].filter((item) => item.value > 0);

  // Top 10 hospitales por casos de diabetes
  const topHospitals = [...stats.byHospital]
    .sort((a, b) => b.diabetes - a.diabetes)
    .slice(0, 10);

  return (
    <Box>
      

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total de Pacientes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatNumber(stats.totalPatients)}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: '#7367f0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pacientes con Diabetes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ea5455' }}>
                    {formatNumber(stats.patientsWithDiabetes)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {((stats.patientsWithDiabetes / stats.totalPatients) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LocalHospital sx={{ fontSize: 40, color: '#ea5455' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pacientes con Prediabetes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {formatNumber(stats.patientsWithPrediabetes)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {((stats.patientsWithPrediabetes / stats.totalPatients) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pacientes Normales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#55bcba' }}>
                    {formatNumber(stats.patientsNormal)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {((stats.patientsNormal / stats.totalPatients) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#55bcba' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Gráfico de pie - Condiciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Distribución por Condición
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de barras - Género */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Distribución por Género
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#7367f0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de barras - Grupo de edad */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Distribución por Grupo de Edad
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#55bcba" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de hospitales */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Top 10 Hospitales por Casos de Diabetes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Hospital</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Diabetes
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Prediabetes
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Normal
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topHospitals.map((hospital, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{hospital.hospital}</TableCell>
                    <TableCell align="right" sx={{ color: '#ea5455', fontWeight: 600 }}>
                      {formatNumber(hospital.diabetes)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#ff9800' }}>
                      {formatNumber(hospital.prediabetes)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#55bcba' }}>
                      {formatNumber(hospital.normal)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(hospital.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PECDashboard;

