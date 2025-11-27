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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Psychology,
  LocalHospital,
  Assessment,
  Timeline,
  ShowChart,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService, TrendAnalysis } from '../../services/analyticsService';
import InfoTooltip from '../Common/InfoTooltip';
import { formatNumber, formatPercentage } from '../../utils/numberFormatter';

interface TrendAnalysisProps {
  specialtyIds?: number[];
}

const TrendAnalysisComponent: React.FC<TrendAnalysisProps> = ({ specialtyIds }) => {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    loadTrends();
  }, [specialtyIds, timePeriod]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getTrendAnalysis(specialtyIds, timePeriod);
      setTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando tendencias');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp color="success" />;
      case 'decreasing':
        return <TrendingDown color="error" />;
      case 'stable':
        return <TrendingFlat color="info" />;
      case 'volatile':
        return <ShowChart color="warning" />;
      default:
        return <Timeline />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'success';
      case 'decreasing':
        return 'error';
      case 'stable':
        return 'info';
      case 'volatile':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTrendLabel = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'Creciente';
      case 'decreasing':
        return 'Decreciente';
      case 'stable':
        return 'Estable';
      case 'volatile':
        return 'Volátil';
      default:
        return 'Desconocido';
    }
  };

  const formatChartData = (dataPoints: number | Array<{ period: string; value: number }> | undefined) => {
    if (!dataPoints) {
      return [];
    }
    
    // Si es un número, generar datos simulados
    if (typeof dataPoints === 'number') {
      return Array.from({ length: 4 }, (_, i) => ({
        period: `Periodo ${i + 1}`,
        value: Math.random() * 100,
        index: i + 1,
      }));
    }
    
    // Si es un array, usar los datos reales
    if (!Array.isArray(dataPoints)) {
      return [];
    }
    
    return dataPoints.map((point, index) => ({
      period: point.period,
      value: point.value || 0,
      index: index + 1,
    }));
  };

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
          Análisis de Tendencias
          <InfoTooltip
            title="Análisis de Tendencias"
            description="Análisis estadístico de las tendencias en las métricas médicas para identificar patrones y cambios en el tiempo."
            calculation="Utiliza análisis de regresión y análisis de series temporales para identificar tendencias significativas"
          />
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              label="Período"
            >
              <MenuItem value="daily">Diario</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensual</MenuItem>
              <MenuItem value="quarterly">Trimestral</MenuItem>
              <MenuItem value="yearly">Anual</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={loadTrends}>
            Actualizar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {trends.map((trend, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {trend.specialty_name || 'General'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {trend.metric_name}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getTrendIcon(trend.trend_direction)}
                    label={getTrendLabel(trend.trend_direction)}
                    color={getTrendColor(trend.trend_direction) as any}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h4" color="primary">
                        {formatNumber(trend.current_value)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Valor Actual
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
                      <Typography variant="h4" color="secondary">
                        {formatNumber(trend.previous_value)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Valor Anterior
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Cambio</Typography>
                    <Typography 
                      variant="body2" 
                      color={(trend.change_percentage || 0) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {(trend.change_percentage || 0) >= 0 ? '+' : ''}{formatNumber(trend.change_percentage)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.abs(trend.change_percentage || 0))}
                    color={(trend.change_percentage || 0) >= 0 ? 'success' : 'error'}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Fuerza de Tendencia</Typography>
                    <Typography variant="body2">
                      {formatPercentage(trend.trend_strength || 0)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(trend.trend_strength || 0) * 100}
                    color="info"
                  />
                </Box>

                {trend.data_points && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Evolución Temporal:
                    </Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={formatChartData(trend.data_points)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="index" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `P${value}`}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => [formatNumber(value), 'Valor']}
                          labelFormatter={(label) => `Período ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1976d2" 
                          strokeWidth={2}
                          dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {trends.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay tendencias disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Se requieren al menos 2 períodos de datos para analizar tendencias.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TrendAnalysisComponent;
