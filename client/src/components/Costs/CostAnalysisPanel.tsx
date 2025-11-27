import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { medicalFlowService, Flow, Specialty, FlowNode } from '../../services/medicalFlowService';
import InfoTooltip from '../Common/InfoTooltip';
import { formatCurrency } from '../../utils/numberFormatter';

interface CostAnalysisPanelProps {
  centerId?: string;
  specialtyId?: string;
  timeRange?: string;
}

interface CostByCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
  idealValue: number;
  realValue: number;
}

interface CostBySpecialty {
  specialty: string;
  cost: number;
  idealCost: number;
  patients: number;
  variance: number;
}

interface CostTrend {
  month: string;
  cost: number;
  idealCost: number;
  projected: number;
}

interface TopCostItem {
  item: string;
  category: string;
  specialty: string;
  realCost: number;
  idealCost: number;
  variance: number; // % diferencia
}

interface CostMetrics {
  totalCost: number;
  idealTotalCost: number;
  averageCostPerPatient: number;
  idealAverageCostPerPatient: number;
  costVariance: number;
  insuranceCoverage: number;
  patientResponsibility: number;
}

const CostAnalysisPanel: React.FC<CostAnalysisPanelProps> = ({
  centerId,
  specialtyId: initialSpecialtyId,
  timeRange = '30d',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(initialSpecialtyId || 'all');
  const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);
  
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [costByCategory, setCostByCategory] = useState<CostByCategory[]>([]);
  const [costBySpecialty, setCostBySpecialty] = useState<CostBySpecialty[]>([]);
  const [costTrend, setCostTrend] = useState<CostTrend[]>([]);
  const [topCostItems, setTopCostItems] = useState<TopCostItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (flows.length > 0) {
      calculateMetrics();
    }
  }, [flows, selectedSpecialtyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [specialtiesData, flowsData] = await Promise.all([
        medicalFlowService.getSpecialties(),
        medicalFlowService.getFlows(),
      ]);

      setSpecialties(specialtiesData);
      setFlows(flowsData);
      
    } catch (err) {
      console.error('Error loading cost analysis data:', err);
      setError(err instanceof Error ? err.message : 'Error cargando datos de análisis de costos');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    // Filtrar flujos según especialidad seleccionada
    let filtered: Flow[] = flows;
    if (selectedSpecialtyId !== 'all') {
      filtered = flows.filter(flow => {
        if (flow.specialtyId === selectedSpecialtyId) return true;
        if (flow.specialtyName && 
            specialties.find(s => s.id === selectedSpecialtyId)?.name &&
            flow.specialtyName.toLowerCase() === 
            specialties.find(s => s.id === selectedSpecialtyId)?.name.toLowerCase()) return true;
        return false;
      });
    }

    setFilteredFlows(filtered);

    // Calcular métricas generales
    const totalCost = filtered.reduce((sum, flow) => {
      const realCost = flow.nodes.reduce((acc, node) => acc + (node.costAvg || 0), 0);
      return sum + realCost;
    }, 0);

    const idealTotalCost = filtered.reduce((sum, flow) => {
      const idealCost = flow.estimatedCost || flow.nodes.reduce((acc, node) => acc + (node.costMin || node.costAvg || 0), 0);
      return sum + idealCost;
    }, 0);

    const totalPatients = filtered.length;
    const averageCostPerPatient = totalPatients > 0 ? totalCost / totalPatients : 0;
    const idealAverageCostPerPatient = totalPatients > 0 ? idealTotalCost / totalPatients : 0;
    const costVariance = idealTotalCost > 0 ? ((totalCost - idealTotalCost) / idealTotalCost) * 100 : 0;

    // Asumir 78% de cobertura de seguro
    const insuranceCoverage = 78;
    const patientResponsibility = 100 - insuranceCoverage;

    setMetrics({
      totalCost,
      idealTotalCost,
      averageCostPerPatient,
      idealAverageCostPerPatient,
      costVariance,
      insuranceCoverage,
      patientResponsibility,
    });

    // Calcular costos por categoría (basado en stepTypes)
    const categoryMap = new Map<string, { real: number; ideal: number; color: string }>();
    
    filtered.forEach(flow => {
      flow.nodes.forEach(node => {
        const stepType = node.stepTypeId || 'unknown';
        const categoryName = getCategoryName(stepType);
        const categoryColor = getCategoryColor(stepType);
        
        const current = categoryMap.get(categoryName) || { real: 0, ideal: 0, color: categoryColor };
        current.real += node.costAvg || 0;
        current.ideal += node.costMin || node.costAvg || 0;
        categoryMap.set(categoryName, current);
      });
    });

    const totalCategoryCost = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.real, 0);
    
    const categoryData: CostByCategory[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      value: data.real,
      percentage: totalCategoryCost > 0 ? (data.real / totalCategoryCost) * 100 : 0,
      color: data.color,
      idealValue: data.ideal,
      realValue: data.real,
    })).sort((a, b) => b.value - a.value);

    setCostByCategory(categoryData);

    // Calcular costos por especialidad
    const specialtyMap = new Map<string, { real: number; ideal: number; count: number }>();
    
    filtered.forEach(flow => {
      const specialtyName = flow.specialtyName || 'Sin Especialidad';
      const realCost = flow.nodes.reduce((sum, node) => sum + (node.costAvg || 0), 0);
      const idealCost = flow.estimatedCost || flow.nodes.reduce((sum, node) => sum + (node.costMin || node.costAvg || 0), 0);
      
      const current = specialtyMap.get(specialtyName) || { real: 0, ideal: 0, count: 0 };
      current.real += realCost;
      current.ideal += idealCost;
      current.count += 1;
      specialtyMap.set(specialtyName, current);
    });

    const specialtyData: CostBySpecialty[] = Array.from(specialtyMap.entries())
      .map(([specialty, data]) => ({
        specialty,
        cost: data.real,
        idealCost: data.ideal,
        patients: data.count,
        variance: data.ideal > 0 ? ((data.real - data.ideal) / data.ideal) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);

    setCostBySpecialty(specialtyData);

    // Generar tendencia (simulado basado en datos actuales)
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const trendData: CostTrend[] = months.map((month, index) => {
      // Simular variación basada en datos reales
      const variation = (Math.random() - 0.5) * 0.2 + 1; // Variación ±10%
      const monthCost = totalCost * variation;
      const monthIdeal = idealTotalCost * variation;
      const projected = monthCost * 1.05; // Proyección 5% más alta
      
      return {
        month,
        cost: monthCost,
        idealCost: monthIdeal,
        projected,
      };
    });

    setCostTrend(trendData);

    // Calcular items de mayor costo (top nodos)
    const nodeCosts: TopCostItem[] = [];
    
    filtered.forEach(flow => {
      flow.nodes.forEach(node => {
        const realCost = node.costAvg || 0;
        const idealCost = node.costMin || node.costAvg || 0;
        
        if (realCost > 0 || idealCost > 0) {
          const variance = idealCost > 0 
            ? ((realCost - idealCost) / idealCost) * 100 
            : 0;
          
          nodeCosts.push({
            item: node.label,
            category: getCategoryName(node.stepTypeId || 'unknown'),
            specialty: flow.specialtyName || 'Sin Especialidad',
            realCost,
            idealCost,
            variance,
          });
        }
      });
    });

    // Agrupar items similares (sumar costos si hay duplicados por especialidad)
    const itemMap = new Map<string, TopCostItem>();
    nodeCosts.forEach(item => {
      const key = `${item.item}-${item.specialty}`;
      const existing = itemMap.get(key);
      if (existing) {
        // Si hay duplicados, usar el promedio ponderado
        const totalCount = 2; // Asumiendo que son 2 instancias
        existing.realCost = (existing.realCost + item.realCost) / totalCount;
        existing.idealCost = (existing.idealCost + item.idealCost) / totalCount;
        existing.variance = existing.idealCost > 0 
          ? ((existing.realCost - existing.idealCost) / existing.idealCost) * 100 
          : 0;
      } else {
        itemMap.set(key, { ...item });
      }
    });

    // Ordenar por costo real descendente y tomar los top 10
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.realCost - a.realCost)
      .slice(0, 10);

    setTopCostItems(topItems);
  };

  const getCategoryName = (stepTypeId: string): string => {
    const categoryMap: { [key: string]: string } = {
      'st-cons': 'Consultas',
      'st-lab': 'Laboratorios',
      'st-img': 'Imágenes',
      'st-dx': 'Diagnósticos',
      'st-rx': 'Tratamientos',
      'st-ref': 'Referencias',
      'st-fu': 'Seguimientos',
      'st-proc': 'Procedimientos',
      'st-emergency': 'Emergencias',
      'st-discharge': 'Altas',
    };
    return categoryMap[stepTypeId] || 'Otros';
  };

  const getCategoryColor = (stepTypeId: string): string => {
    const colorMap: { [key: string]: string } = {
      'st-cons': '#1976d2',
      'st-lab': '#dc004e',
      'st-img': '#2e7d32',
      'st-dx': '#9c27b0',
      'st-rx': '#f44336',
      'st-ref': '#607d8b',
      'st-fu': '#795548',
      'st-proc': '#3f51b5',
      'st-emergency': '#e91e63',
      'st-discharge': '#009688',
    };
    return colorMap[stepTypeId] || '#757575';
  };

  const handleRefresh = () => {
    loadData();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          Análisis de Costos
          <InfoTooltip
            title="Análisis de Costos"
            description="Análisis detallado de costos por categoría, especialidad y tendencias. Compara costos ideales vs reales."
            calculation="Calcula costos totales, promedios, variabilidades y desviaciones basado en datos de flujos médicos"
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Especialidad</InputLabel>
            <Select
              value={selectedSpecialtyId}
              label="Especialidad"
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
            >
              <MenuItem value="all">Todas las Especialidades</MenuItem>
              {specialties.map((specialty) => (
                <MenuItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Resumen de costos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Costo Total Real
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {formatCurrency(metrics?.totalCost || 0)}
                  </Typography>
                  {metrics && metrics.costVariance !== 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {metrics.costVariance > 0 ? (
                        <>
                          <TrendingUp sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" color="error.main">
                            +{metrics.costVariance.toFixed(1)}% vs Ideal
                          </Typography>
                        </>
                      ) : (
                        <>
                          <TrendingDown sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">
                            {metrics.costVariance.toFixed(1)}% vs Ideal
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
                <AttachMoney sx={{ fontSize: 50, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Costo Ideal Total
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {formatCurrency(metrics?.idealTotalCost || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Meta optimizada
                  </Typography>
                </Box>
                <PieChartIcon sx={{ fontSize: 50, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Costo Promedio/Paciente
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {formatCurrency(metrics?.averageCostPerPatient || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Ideal: {formatCurrency(metrics?.idealAverageCostPerPatient || 0)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics && metrics.idealAverageCostPerPatient > 0 
                  ? Math.min(100, (metrics.averageCostPerPatient / metrics.idealAverageCostPerPatient) * 100)
                  : 0}
                color={metrics && metrics.averageCostPerPatient > (metrics.idealAverageCostPerPatient * 1.1) 
                  ? 'error' : 'primary'}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Variabilidad de Costos
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {metrics ? Math.abs(metrics.costVariance).toFixed(1) : '0.0'}%
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics && metrics.costVariance > 10 
                  ? 'Alta variabilidad' 
                  : metrics && metrics.costVariance > 5 
                  ? 'Variabilidad moderada' 
                  : 'Baja variabilidad'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics ? Math.min(100, Math.abs(metrics.costVariance) * 2) : 0}
                color={metrics && Math.abs(metrics.costVariance) > 10 
                  ? 'error' : metrics && Math.abs(metrics.costVariance) > 5 
                  ? 'warning' : 'success'}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos de análisis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución de Costos por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Costos por Especialidad (Ideal vs Real)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={costBySpecialty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="specialty" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="idealCost" fill="#4caf50" name="Costo Ideal" />
                  <Bar dataKey="cost" fill="#1976d2" name="Costo Real" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tendencia de costos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tendencia de Costos - Proyección
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="idealCost"
                    stroke="#4caf50"
                    strokeWidth={2}
                    name="Costo Ideal"
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Costo Real"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#dc004e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Proyección"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de items de mayor costo */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items de Mayor Costo
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell align="right">Costo Real</TableCell>
                  <TableCell align="right">Costo Ideal</TableCell>
                  <TableCell align="right">% Diferencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCostItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">No hay datos disponibles</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topCostItems.map((item, index) => {
                    const isPositive = item.variance <= 0; // Verde si real <= ideal
                    const varianceText = item.variance > 0 
                      ? `+${item.variance.toFixed(1)}%`
                      : `${item.variance.toFixed(1)}%`;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" />
                        </TableCell>
                        <TableCell>{item.specialty}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            {formatCurrency(item.realCost)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium" color="success.main">
                            {formatCurrency(item.idealCost)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            fontWeight="bold" 
                            color={isPositive ? 'success.main' : 'error.main'}
                          >
                            {varianceText}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CostAnalysisPanel;
