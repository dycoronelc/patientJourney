import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Psychology,
  LocalHospital,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import { analyticsService, DemandPrediction } from '../../services/analyticsService';
import InfoTooltip from '../Common/InfoTooltip';
import { formatNumber } from '../../utils/numberFormatter';

interface DemandPredictionsProps {
  specialtyIds?: number[];
}

const DemandPredictions: React.FC<DemandPredictionsProps> = ({ specialtyIds }) => {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionHorizon, setPredictionHorizon] = useState(30);

  useEffect(() => {
    loadPredictions();
  }, [specialtyIds, predictionHorizon]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDemandPredictions(specialtyIds, predictionHorizon);
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando predicciones');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  const getSpecialtyIcon = (specialtyName: string) => {
    if (specialtyName.toLowerCase().includes('cardiología')) return <LocalHospital />;
    if (specialtyName.toLowerCase().includes('psiquiatría')) return <Psychology />;
    return <Assessment />;
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
          Predicciones de Demanda
          <InfoTooltip
            title="Predicciones de Demanda"
            description="Predicciones de demanda de pacientes por especialidad médica utilizando algoritmos de inteligencia artificial."
            calculation="Basado en datos históricos, patrones estacionales y factores externos como días festivos y eventos especiales"
          />
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Horizonte</InputLabel>
            <Select
              value={predictionHorizon}
              onChange={(e) => setPredictionHorizon(Number(e.target.value))}
              label="Horizonte"
            >
              <MenuItem value={7}>7 días</MenuItem>
              <MenuItem value={15}>15 días</MenuItem>
              <MenuItem value={30}>30 días</MenuItem>
              <MenuItem value={60}>60 días</MenuItem>
              <MenuItem value={90}>90 días</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={loadPredictions}>
            Actualizar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {predictions.map((prediction, index) => (
          <Grid item xs={12} md={6} lg={4} key={`${prediction.specialty_id}-${index}`}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {getSpecialtyIcon(prediction.specialty_name)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {prediction.specialty_name}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatNumber(prediction.predicted_demand)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    pacientes esperados para los próximos {predictionHorizon} días
                    <InfoTooltip
                      title="Demanda Predicha"
                      description="Número estimado de pacientes que se espera atender en esta especialidad durante el período seleccionado."
                      calculation="Algoritmo de IA basado en datos históricos, tendencias estacionales y factores de influencia"
                    />
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      Confianza
                      <InfoTooltip
                        title="Nivel de Confianza"
                        description="Indica qué tan confiable es la predicción basada en la calidad y cantidad de datos históricos disponibles."
                        calculation="Calculado usando la varianza de los datos históricos y la consistencia de los patrones identificados"
                      />
                    </Typography>
                    <Typography variant="body2">
                      {getConfidenceLabel(prediction.confidence_level)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={prediction.confidence_level * 100}
                    color={getConfidenceColor(prediction.confidence_level)}
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Fecha de predicción:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(prediction.prediction_date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Factores de Influencia:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Promedio histórico: ${prediction.factors?.historical_average ? formatNumber(prediction.factors.historical_average) : 'N/A'}`}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <TrendingUp fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Factor estacional: ${prediction.factors?.seasonal_factor ? formatNumber(prediction.factors.seasonal_factor) : 'N/A'}`}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Assessment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Variabilidad: ${prediction.factors?.variability ? formatNumber(prediction.factors.variability) : 'N/A'}`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {predictions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay predicciones disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Los datos históricos son insuficientes para generar predicciones confiables.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DemandPredictions;
