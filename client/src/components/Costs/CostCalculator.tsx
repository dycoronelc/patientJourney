import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Calculate,
  AttachMoney,
  PictureAsPdf,
  CompareArrows,
  Save,
  History,
  Refresh,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { medicalFlowService, Flow, Specialty, FlowNode } from '../../services/medicalFlowService';
import InfoTooltip from '../Common/InfoTooltip';
import { formatCurrency } from '../../utils/numberFormatter';

interface CostItem {
  id: string;
  name: string;
  category: string;
  unitCost: number;
  quantity: number;
  total: number;
  description?: string;
}

interface Scenario {
  id: string;
  name: string;
  items: CostItem[];
  insuranceCoverage: number;
  baseFlowName?: string;
  timestamp: Date;
}

const CostCalculator: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [items, setItems] = useState<CostItem[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [insuranceCoverage, setInsuranceCoverage] = useState(78);
  const [baseFlowName, setBaseFlowName] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [scenariosToCompare, setScenariosToCompare] = useState<string[]>([]);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadData();
    loadSavedScenarios();
  }, []);

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
      console.error('Error loading calculator data:', err);
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedScenarios = () => {
    const saved = localStorage.getItem('costScenarios');
    if (saved) {
      try {
        const scenarios = JSON.parse(saved).map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
        setSavedScenarios(scenarios);
      } catch (err) {
        console.error('Error loading saved scenarios:', err);
      }
    }
  };

  const getCategoryName = (stepTypeId: string): string => {
    const categoryMap: { [key: string]: string } = {
      'st-cons': 'Consulta',
      'st-lab': 'Laboratorio',
      'st-img': 'Imagen',
      'st-dx': 'Diagnóstico',
      'st-rx': 'Tratamiento',
      'st-ref': 'Referencia',
      'st-fu': 'Seguimiento',
      'st-proc': 'Procedimiento',
      'st-emergency': 'Emergencia',
      'st-discharge': 'Alta',
    };
    return categoryMap[stepTypeId] || 'Otro';
  };

  const addFlowItems = () => {
    if (!selectedFlow) return;

    const flow = flows.find(f => f.id === selectedFlow);
    if (!flow) return;

    // Si no hay items previos o se está reemplazando, establecer el flujo base
    // Si ya hay items, mantener el flujo base existente
    if (items.length === 0) {
      const flowDisplayName = flow.specialtyName 
        ? `${flow.specialtyName} - ${flow.name}`
        : flow.name;
      setBaseFlowName(flowDisplayName);
    }

    const flowItems: CostItem[] = flow.nodes
      .filter(node => node.costAvg && node.costAvg > 0)
      .map(node => ({
        id: `${flow.id}-${node.id}`,
        name: node.label,
        category: getCategoryName(node.stepTypeId || 'unknown'),
        unitCost: node.costAvg || 0,
        quantity: 1,
        total: node.costAvg || 0,
        description: node.description,
      }));

    setItems([...items, ...flowItems]);
    setSelectedFlow('');
  };

  const addServiceItem = () => {
    if (!selectedService) return;

    // Buscar el servicio en los flujos
    let foundNode: FlowNode | null = null;
    let foundFlow: Flow | null = null;

    for (const flow of flows) {
      const node = flow.nodes.find(n => 
        n.label.toLowerCase().includes(selectedService.toLowerCase()) ||
        n.id === selectedService
      );
      if (node && node.costAvg && node.costAvg > 0) {
        foundNode = node;
        foundFlow = flow;
        break;
      }
    }

    if (!foundNode || !foundNode.costAvg) return;

    const unitCost = foundNode.costAvg || 0;
    const newItem: CostItem = {
      id: Date.now().toString(),
      name: foundNode.label,
      category: getCategoryName(foundNode.stepTypeId || 'unknown'),
      unitCost: unitCost,
      quantity: quantity,
      total: unitCost * quantity,
      description: foundNode.description,
    };

    setItems([...items, newItem]);
    setSelectedService('');
    setQuantity(1);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    // Si se eliminan todos los items, limpiar el nombre del flujo base
    if (updatedItems.length === 0) {
      setBaseFlowName('');
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const coverageDecimal = insuranceCoverage / 100;
    const insuranceCoverageAmount = subtotal * coverageDecimal;
    const patientResponsibility = subtotal - insuranceCoverageAmount;
    
    return {
      subtotal,
      insuranceCoverage: insuranceCoverageAmount,
      patientResponsibility,
    };
  };

  const totals = calculateTotals();

  const showAlert = (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => {
    setAlertDialog({ open: true, type, title, message });
  };

  const saveScenario = () => {
    if (items.length === 0) {
      showAlert('warning', 'Sin items para guardar', 'Agrega al menos un servicio o flujo antes de guardar el escenario.');
      return;
    }

    // Generar nombre descriptivo del escenario
    let scenarioName: string;
    if (baseFlowName) {
      scenarioName = `${baseFlowName} - ${insuranceCoverage}% cobertura`;
    } else {
      scenarioName = `Escenario ${new Date().toLocaleString('es-PA')} - ${insuranceCoverage}% cobertura`;
    }

    const scenario: Scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      items: [...items],
      insuranceCoverage,
      baseFlowName: baseFlowName || undefined,
      timestamp: new Date(),
    };

    const updated = [...savedScenarios, scenario];
    setSavedScenarios(updated);
    localStorage.setItem('costScenarios', JSON.stringify(updated));
    showAlert('success', 'Escenario guardado', 'El escenario se ha guardado exitosamente. Puedes encontrarlo en la pestaña "Escenarios Guardados".');
  };

  const loadScenario = (scenario: Scenario) => {
    setItems(scenario.items);
    setInsuranceCoverage(scenario.insuranceCoverage);
    setBaseFlowName(scenario.baseFlowName || '');
    setActiveTab(0);
  };

  const deleteScenario = (id: string) => {
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem('costScenarios', JSON.stringify(updated));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [0, 100, 173];
    const secondaryColor: [number, number, number] = [0, 150, 200];

    // Encabezado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN DE COSTOS', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-PA')}`, 105, 30, { align: 'center' });

    let yPos = 50;

    // Información del paciente/flujo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Servicios', 20, yPos);
    yPos += 10;

    // Tabla de items
    const tableData = items.map(item => [
      item.name,
      item.category,
      item.quantity.toString(),
      formatCurrency(item.unitCost),
      formatCurrency(item.total),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Servicio', 'Categoría', 'Cantidad', 'Precio Unit.', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Resumen
    doc.setFillColor(...secondaryColor);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE COSTOS', 20, yPos);
    yPos += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 20, yPos);
    doc.text(formatCurrency(totals.subtotal), 160, yPos, { align: 'right' });
    yPos += 8;

    doc.text(`Cobertura de Seguro (${insuranceCoverage}%):`, 20, yPos);
    doc.text(formatCurrency(totals.insuranceCoverage), 160, yPos, { align: 'right' });
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Responsabilidad del Paciente:`, 20, yPos);
    doc.text(formatCurrency(totals.patientResponsibility), 160, yPos, { align: 'right' });
    yPos += 10;

    doc.setFillColor(...primaryColor);
    doc.rect(15, yPos, 180, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL A PAGAR', 20, yPos + 8);
    doc.text(formatCurrency(totals.patientResponsibility), 160, yPos + 8, { align: 'right' });

    // Pie de página
    yPos = 280;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es una cotización estimada. Los costos finales pueden variar.', 105, yPos, { align: 'center' });

    doc.save(`Cotizacion_${new Date().toISOString().split('T')[0]}.pdf`);
  };


  const getComparisonData = () => {
    const selected = savedScenarios.filter(s => scenariosToCompare.includes(s.id));
    
    return selected.map(scenario => {
      const subtotal = scenario.items.reduce((sum, item) => sum + item.total, 0);
      const coverage = subtotal * (scenario.insuranceCoverage / 100);
      const patientPay = subtotal - coverage;
      
      return {
        id: scenario.id, // Incluir el ID único del escenario
        name: scenario.name.length > 20 ? scenario.name.substring(0, 20) + '...' : scenario.name,
        fullName: scenario.name,
        subtotal,
        coverage,
        patientPay,
        coveragePercent: scenario.insuranceCoverage,
        itemsCount: scenario.items.length,
      };
    });
  };

  // Obtener todos los servicios únicos de los flujos
  const getAllServices = (): Array<{ id: string; name: string; category: string; cost: number }> => {
    const serviceMap = new Map<string, { id: string; name: string; category: string; cost: number }>();
    
    flows.forEach(flow => {
      flow.nodes.forEach(node => {
        if (node.costAvg && node.costAvg > 0) {
          const key = node.label.toLowerCase();
          if (!serviceMap.has(key)) {
            serviceMap.set(key, {
              id: node.id,
              name: node.label,
              category: getCategoryName(node.stepTypeId || 'unknown'),
              cost: node.costAvg,
            });
          }
        }
      });
    });

    return Array.from(serviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const allServices = getAllServices();

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
          Calculadora de Costos por Paciente
          <InfoTooltip
            title="Calculadora de Costos"
            description="Calcula el costo total del recorrido del paciente seleccionando flujos completos o servicios individuales. Ajusta la cobertura del seguro y genera cotizaciones en PDF."
            calculation="Suma costos de servicios seleccionados y calcula responsabilidad del paciente según cobertura del seguro"
          />
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
        >
          Actualizar
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Calcular Costos" />
        <Tab label="Escenarios Guardados" icon={<History />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Selección de flujo completo */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seleccionar Flujo Completo
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Flujo Médico</InputLabel>
                  <Select
                    value={selectedFlow}
                    label="Flujo Médico"
                    onChange={(e) => setSelectedFlow(e.target.value)}
                  >
                    <MenuItem value="">-- Seleccionar Flujo --</MenuItem>
                    {flows.map((flow) => (
                      <MenuItem key={flow.id} value={flow.id}>
                        {flow.specialtyName || 'Sin Especialidad'} - {flow.name} 
                        {flow.estimatedCost && ` (${formatCurrency(flow.estimatedCost)})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addFlowItems}
                  disabled={!selectedFlow}
                  sx={{ height: '56px' }}
                >
                  Agregar Flujo Completo
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Selección de servicios individuales */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agregar Servicios Individuales
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel>Servicio</InputLabel>
                  <Select
                    value={selectedService}
                    label="Servicio"
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <MenuItem value="">-- Seleccionar Servicio --</MenuItem>
                    {allServices.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.cost)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addServiceItem}
                  disabled={!selectedService}
                  sx={{ height: '56px' }}
                >
                  Agregar Servicio
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Ajuste de cobertura de seguro */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ajuste de Cobertura de Seguro
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Slider
                  value={insuranceCoverage}
                  onChange={(e, newValue) => setInsuranceCoverage(newValue as number)}
                  min={0}
                  max={100}
                  step={1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cobertura (%)"
                  value={insuranceCoverage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setInsuranceCoverage(Math.min(100, Math.max(0, value)));
                  }}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        Items del Recorrido
                      </Typography>
                      {baseFlowName && (
                        <Typography variant="caption" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Info fontSize="small" />
                          Flujo base: {baseFlowName}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Save />}
                      onClick={saveScenario}
                      disabled={items.length === 0}
                    >
                      Guardar Escenario
                    </Button>
                  </Box>
                  
                  {items.length === 0 ? (
                    <Alert severity="info">
                      No hay items agregados. Selecciona un flujo completo o servicios individuales.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Servicio</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">Precio Unit.</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.name}
                                </Typography>
                                {item.description && (
                                  <Typography variant="caption" color="textSecondary">
                                    {item.description}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip label={item.category} size="small" />
                              </TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.unitCost)}</TableCell>
                              <TableCell align="right">
                                <Typography fontWeight="bold">
                                  {formatCurrency(item.total)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Costos
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Subtotal"
                        secondary="Costo total de servicios"
                      />
                      <Typography variant="h6">
                        {formatCurrency(totals.subtotal)}
                      </Typography>
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemText
                        primary={`Cobertura de Seguro (${insuranceCoverage}%)`}
                        secondary="Monto cubierto"
                      />
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(totals.insuranceCoverage)}
                      </Typography>
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem>
                      <ListItemText
                        primary={`Responsabilidad del Paciente (${100 - insuranceCoverage}%)`}
                        secondary="Copago del paciente"
                      />
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(totals.patientResponsibility)}
                      </Typography>
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      TOTAL A PAGAR
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(totals.patientResponsibility)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={generatePDF}
                    disabled={items.length === 0}
                    sx={{ mt: 2 }}
                  >
                    Generar Cotización PDF
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Escenarios Guardados
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CompareArrows />}
                onClick={() => setCompareDialogOpen(true)}
                disabled={savedScenarios.length < 2}
              >
                Comparar Escenarios
              </Button>
            </Box>

            {savedScenarios.length === 0 ? (
              <Alert severity="info">
                No hay escenarios guardados. Selecciona un flujo completo, agrega o quita servicios, y guárdalo para compararlo después.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Flujo Base</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Cobertura</TableCell>
                      <TableCell align="right">Total Paciente</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedScenarios.map((scenario) => {
                      const scenarioTotal = scenario.items.reduce((sum, item) => sum + item.total, 0);
                      const scenarioCoverage = scenarioTotal * (scenario.insuranceCoverage / 100);
                      const scenarioPatient = scenarioTotal - scenarioCoverage;

                      return (
                        <TableRow key={scenario.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {scenario.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {scenario.baseFlowName ? (
                              <Chip 
                                label={scenario.baseFlowName} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Sin flujo base
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{scenario.items.length}</TableCell>
                          <TableCell align="right">{scenario.insuranceCoverage}%</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              {formatCurrency(scenarioPatient)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {scenario.timestamp.toLocaleString('es-PA')}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => loadScenario(scenario)}
                              title="Cargar escenario"
                            >
                              <Refresh />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deleteScenario(scenario.id)}
                              title="Eliminar escenario"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para comparar escenarios */}
      <Dialog 
        open={compareDialogOpen} 
        onClose={() => {
          setCompareDialogOpen(false);
          setScenariosToCompare([]);
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          Comparar Escenarios
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {scenariosToCompare.length < 2 ? (
            <>
              <Typography variant="body1" gutterBottom>
                Selecciona al menos 2 escenarios para comparar:
              </Typography>
              {savedScenarios.map((scenario) => {
                const scenarioTotal = scenario.items.reduce((sum, item) => sum + item.total, 0);
                const scenarioPatient = scenarioTotal * (1 - scenario.insuranceCoverage / 100);
                
                return (
                  <Box 
                    key={scenario.id} 
                    sx={{ 
                      mb: 1, 
                      p: 1.5, 
                      border: '1px solid',
                      borderColor: scenariosToCompare.includes(scenario.id) ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: scenariosToCompare.includes(scenario.id) ? 'primary.50' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (scenariosToCompare.includes(scenario.id)) {
                        setScenariosToCompare(scenariosToCompare.filter(id => id !== scenario.id));
                      } else {
                        setScenariosToCompare([...scenariosToCompare, scenario.id]);
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={scenariosToCompare.includes(scenario.id)}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {scenario.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {scenario.baseFlowName && `Flujo: ${scenario.baseFlowName} • `}
                          {scenario.items.length} items • Cobertura: {scenario.insuranceCoverage}% • 
                          Total: {formatCurrency(scenarioPatient)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Comparación de {scenariosToCompare.length} Escenarios
                </Typography>
                <Button
                  size="small"
                  onClick={() => setScenariosToCompare([])}
                >
                  Cambiar Selección
                </Button>
              </Box>

              {/* Gráfico de barras comparativo */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparación de Costos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="subtotal" fill="#1976d2" name="Subtotal" />
                      <Bar dataKey="coverage" fill="#4caf50" name="Cobertura Seguro" />
                      <Bar dataKey="patientPay" fill="#ff9800" name="Pago Paciente" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tabla comparativa detallada */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Análisis Detallado
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                      <TableRow>
                        <TableCell>Escenario</TableCell>
                        <TableCell align="right">Items</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="right">Cobertura</TableCell>
                        <TableCell align="right">Pago Paciente</TableCell>
                        <TableCell align="right">Diferencia</TableCell>
                      </TableRow>
                      </TableHead>
                      <TableBody>
                        {getComparisonData().map((scenario, index) => {
                          const firstPatientPay = getComparisonData()[0]?.patientPay || 0;
                          const difference = scenario.patientPay - firstPatientPay;
                          const isBest = scenario.patientPay === Math.min(...getComparisonData().map(s => s.patientPay));
                          
                          return (
                            <TableRow 
                              key={scenario.id}
                              sx={{ 
                                bgcolor: isBest ? 'success.50' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isBest && <CheckCircle color="success" fontSize="small" />}
                                  <Box>
                                    <Typography fontWeight={isBest ? 'bold' : 'normal'}>
                                      {scenario.fullName}
                                    </Typography>
                                    {scenario.coveragePercent !== getComparisonData()[0]?.coveragePercent && (
                                      <Typography variant="caption" color="warning.main">
                                        Cobertura diferente
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{scenario.itemsCount}</TableCell>
                              <TableCell align="right">{formatCurrency(scenario.subtotal)}</TableCell>
                              <TableCell align="right">
                                <Box>
                                  <Typography fontWeight="medium">
                                    {scenario.coveragePercent}%
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {formatCurrency(scenario.coverage)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography fontWeight="bold" color={isBest ? 'success.main' : 'inherit'}>
                                  {formatCurrency(scenario.patientPay)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography 
                                  color={difference === 0 ? 'textSecondary' : difference > 0 ? 'error.main' : 'success.main'}
                                  fontWeight="medium"
                                >
                                  {difference === 0 
                                    ? '-' 
                                    : difference > 0 
                                    ? `+${formatCurrency(difference)}` 
                                    : formatCurrency(difference)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Resumen de comparación */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen Comparativo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                        <Typography variant="body2" color="textSecondary">
                          Mejor Opción
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {getComparisonData().reduce((min, s) => 
                            s.patientPay < min.patientPay ? s : min
                          ).fullName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          Cobertura: {getComparisonData().reduce((min, s) => 
                            s.patientPay < min.patientPay ? s : min
                          ).coveragePercent}%
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ mt: 1 }}>
                          {formatCurrency(Math.min(...getComparisonData().map(s => s.patientPay)))}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                        <Typography variant="body2" color="textSecondary">
                          Opción Más Costosa
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {getComparisonData().reduce((max, s) => 
                            s.patientPay > max.patientPay ? s : max
                          ).fullName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          Cobertura: {getComparisonData().reduce((max, s) => 
                            s.patientPay > max.patientPay ? s : max
                          ).coveragePercent}%
                        </Typography>
                        <Typography variant="h6" color="error.main" sx={{ mt: 1 }}>
                          {formatCurrency(Math.max(...getComparisonData().map(s => s.patientPay)))}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                        <Typography variant="body2" color="textSecondary">
                          Diferencia Máxima
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(
                            Math.max(...getComparisonData().map(s => s.patientPay)) - 
                            Math.min(...getComparisonData().map(s => s.patientPay))
                          )}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          Entre mejor y peor opción
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Diferencia de cobertura: {Math.max(...getComparisonData().map(s => s.coveragePercent))}% - {Math.min(...getComparisonData().map(s => s.coveragePercent))}% = 
                          {Math.max(...getComparisonData().map(s => s.coveragePercent)) - Math.min(...getComparisonData().map(s => s.coveragePercent))}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setCompareDialogOpen(false);
            setScenariosToCompare([]);
          }}>
            {scenariosToCompare.length >= 2 ? 'Cerrar' : 'Cancelar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de alertas estilizado */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ ...alertDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: alertDialog.type === 'success' ? 'success.main' : 
                   alertDialog.type === 'error' ? 'error.main' :
                   alertDialog.type === 'warning' ? 'warning.main' : 'info.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {alertDialog.type === 'success' && <CheckCircle />}
          {alertDialog.type === 'warning' && <Warning />}
          {alertDialog.type === 'error' && <Warning />}
          {alertDialog.type === 'info' && <Info />}
          {alertDialog.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1">
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAlertDialog({ ...alertDialog, open: false })}
            variant="contained"
            color={alertDialog.type === 'success' ? 'success' : 
                   alertDialog.type === 'error' ? 'error' :
                   alertDialog.type === 'warning' ? 'warning' : 'info'}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostCalculator;
