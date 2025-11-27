import React, { useState, useCallback, useEffect } from 'react';
import { stepService, Step } from '../../services/stepService';
import { medicalFlowService, Flow, Specialty, FlowNode, FlowEdge } from '../../services/medicalFlowService';
import FlowRenderer from './FlowRenderer';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'react-flow-renderer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  Edit,
  MedicalServices,
  Science,
  CameraAlt,
  Psychology,
  Medication,
  ArrowForward,
  Schedule,
  Warning,
  MedicalInformation,
  ExitToApp,
} from '@mui/icons-material';

interface PatientFlowDiagramProps {
  journeyId?: string;
  flowData?: any;
  onEditFlow?: () => void;
}

const PatientFlowDiagram: React.FC<PatientFlowDiagramProps> = ({ journeyId, flowData, onEditFlow }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [availableFlows, setAvailableFlows] = useState<Flow[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos desde la API de flujos médicos
  useEffect(() => {
    loadMedicalData();
  }, []);

  const loadMedicalData = async () => {
    try {
      setError(null);
      setLoadingFlows(true);
      setLoadingSpecialties(true);
      
      // Cargar especialidades y flujos en paralelo
      const [specialties, flows] = await Promise.all([
        medicalFlowService.getSpecialties(),
        medicalFlowService.getFlows()
      ]);
      
      setAvailableSpecialties(specialties);
      setAvailableFlows(flows);
      
      // Seleccionar el primer flujo si hay disponibles
      if (flows.length > 0) {
        setSelectedFlowId(flows[0].id);
      }
    } catch (error) {
      console.error('Error loading medical data:', error);
      setError('Error al cargar los datos médicos. Por favor, intente nuevamente.');
    } finally {
      setLoadingFlows(false);
      setLoadingSpecialties(false);
    }
  };

  // Función para obtener el icono según el tipo de paso
  const getStepIcon = (stepTypeCode: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      // Códigos del backend
      'st-cons': <MedicalServices sx={{ fontSize: 40 }} />,        // Consulta
      'st-lab': <Science sx={{ fontSize: 40 }} />,                 // Laboratorio
      'st-img': <CameraAlt sx={{ fontSize: 40 }} />,              // Imagenología
      'st-dx': <Psychology sx={{ fontSize: 40 }} />,              // Diagnóstico
      'st-rx': <Medication sx={{ fontSize: 40 }} />,              // Tratamiento/Prescripción
      'st-ref': <ArrowForward sx={{ fontSize: 40 }} />,           // Referencia
      'st-fu': <Schedule sx={{ fontSize: 40 }} />,                // Seguimiento
      'st-proc': <MedicalInformation sx={{ fontSize: 40 }} />,     // Procedimiento
      'st-emergency': <Warning sx={{ fontSize: 40 }} />,          // Emergencia
      'st-discharge': <ExitToApp sx={{ fontSize: 40 }} />,        // Alta
      
      // Códigos legacy (mantener compatibilidad)
      'consultation': <MedicalServices sx={{ fontSize: 40 }} />,
      'laboratory': <Science sx={{ fontSize: 40 }} />,
      'imaging': <CameraAlt sx={{ fontSize: 40 }} />,
      'diagnosis': <Psychology sx={{ fontSize: 40 }} />,
      'prescription': <Medication sx={{ fontSize: 40 }} />,
      'referral': <ArrowForward sx={{ fontSize: 40 }} />,
      'followup': <Schedule sx={{ fontSize: 40 }} />,
      'emergency': <Warning sx={{ fontSize: 40 }} />,
      'procedure': <MedicalInformation sx={{ fontSize: 40 }} />,
      'discharge': <ExitToApp sx={{ fontSize: 40 }} />
    };
    return iconMap[stepTypeCode] || <MedicalServices sx={{ fontSize: 40 }} />;
  };

  // Función para determinar el tipo de flujo
  const getFlowType = (flow: Flow): 'normalized' | 'bienimed' => {
    return flow.id.startsWith('flow-') ? 'normalized' : 'bienimed';
  };

  // ============================================================================
  // RENDERIZADOR UNIVERSAL DE FLUJOS
  // ============================================================================
  // Usando FlowRenderer para visualización consistente de todos los tipos de flujos
  
  // Instancia del renderizador universal con altura dinámica según tipo de flujo
  const getFlowRenderer = (flowId: string) => {
    const flow = availableFlows.find(f => f.id === flowId);
    const isBienimed = flow && !flow.id.startsWith('flow-');
    
    // Los flujos Bienimed necesitan más espacio porque tienen descripciones más largas
    const stepHeight = isBienimed ? 250 : 180;
    
    return new FlowRenderer({
      stepHeight,
      nodeWidth: 200,
      startY: 0,
      startX: 300,
      showStartNode: true,
      showEndNode: true,
    });
  };

  // Función para obtener nodos según el flujo seleccionado
  const getFlowNodes = (flowId: string): Node[] => {
    const selectedFlow = availableFlows.find(flow => flow.id === flowId);
    if (selectedFlow) {
      const renderer = getFlowRenderer(flowId);
      return renderer.generateNodes(selectedFlow);
    }
    return [];
  };

  // Función para obtener edges según el flujo
  const getFlowEdges = (flowId: string): Edge[] => {
    const selectedFlow = availableFlows.find(flow => flow.id === flowId);
    if (selectedFlow) {
      const renderer = getFlowRenderer(flowId);
      return renderer.generateEdges(selectedFlow);
    }
    return [];
  };




  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Actualizar nodos y edges cuando cambia el flujo seleccionado
  useEffect(() => {
    if (selectedFlowId) {
      const flowNodes = getFlowNodes(selectedFlowId);
      const flowEdges = getFlowEdges(selectedFlowId);
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      // Forzar las posiciones después de un pequeño delay
      // Esto asegura que ReactFlow no sobrescriba las posiciones
      setTimeout(() => {
        setNodes(flowNodes);
      }, 50);
    }
  }, [selectedFlowId, availableFlows, setNodes, setEdges]);

  // Deshabilitar cambios de posición - mantener posiciones fijas
  const handleNodesChange = useCallback((changes: any) => {
    // Filtrar solo cambios que NO sean de posición
    const filteredChanges = changes.filter((change: any) => 
      change.type !== 'position' && change.type !== 'dimensions'
    );
    if (filteredChanges.length > 0) {
      onNodesChange(filteredChanges);
    }
  }, [onNodesChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box sx={{ width: '100%', height: '700px' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Flujos Médicos - Diagrama Interactivo
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Seleccionar Flujo Médico</InputLabel>
              <Select
                value={selectedFlowId}
                label="Seleccionar Flujo Médico"
                onChange={(e) => setSelectedFlowId(e.target.value)}
                disabled={loadingFlows}
              >
                {availableFlows.map((flow) => {
                  const flowType = getFlowType(flow);
                  const isNormalized = flowType === 'normalized';
                  const hasNodes = flow.nodes && flow.nodes.length > 0;
                  
                  return (
                    <MenuItem key={flow.id} value={flow.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {flow.name}
                          </Typography>
                          {isNormalized ? (
                            <Chip 
                              label="Normalizado" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ) : (
                            <Chip 
                              label="Bienimed" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          {hasNodes && (
                            <Chip 
                              label={`${flow.nodes.length} pasos`} 
                              size="small" 
                              color="primary" 
                              variant="filled"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                        
                        {flow.specialtyName && (
                          <Typography variant="caption" color="textSecondary">
                            📋 {flow.specialtyName}
                          </Typography>
                        )}
                        
                        {flow.averageDuration && (
                          <Typography variant="caption" color="textSecondary">
                            ⏱️ Duración: {medicalFlowService.formatDuration(flow.averageDuration)}
                          </Typography>
                        )}
                        
                        {flow.estimatedCost && (
                          <Typography variant="caption" color="textSecondary">
                            💰 Costo: ${flow.estimatedCost.toFixed(2)}
                          </Typography>
                        )}
                        
                        {!hasNodes && (
                          <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                            ⚠️ Sin estructura de pasos
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              size="small"
              onClick={loadMedicalData}
              disabled={loadingFlows || loadingSpecialties}
            >
              {loadingFlows ? <CircularProgress size={20} /> : 'Recargar'}
            </Button>
            {onEditFlow && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                size="small"
                onClick={onEditFlow}
              >
                Editar Flujo
              </Button>
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1 }}>
            Tipos de Pasos:
          </Typography>
          <Chip icon={<MedicalServices />} label="Consulta" color="primary" size="small" />
          <Chip icon={<Science />} label="Laboratorio" color="secondary" size="small" />
          <Chip icon={<CameraAlt />} label="Imagenología" color="success" size="small" />
          <Chip icon={<Psychology />} label="Diagnóstico" color="warning" size="small" />
          <Chip icon={<Medication />} label="Tratamiento" color="error" size="small" />
          <Chip icon={<ExitToApp />} label="Alta" color="info" size="small" />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1 }}>
            Tipos de Flujos:
          </Typography>
          <Chip 
            label="Normalizados (20)" 
            color="success" 
            variant="outlined" 
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label="Bienimed (42)" 
            color="info" 
            variant="outlined" 
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center', ml: 1 }}>
            Los flujos normalizados tienen estructura completa de pasos según mejores prácticas médicas
          </Typography>
        </Box>
        
        {selectedFlowId && (
          <Box sx={{ mt: 2 }}>
            {(() => {
              const selectedFlow = availableFlows.find(flow => flow.id === selectedFlowId);
              if (selectedFlow) {
                return (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${selectedFlow.nodes?.length || 0} pasos`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    {selectedFlow.averageDuration && (
                      <Chip 
                        label={`Duración: ${medicalFlowService.formatDuration(selectedFlow.averageDuration)}`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    )}
                    {selectedFlow.estimatedCost && (
                      <Chip 
                        label={`Costo: ${medicalFlowService.formatCost(selectedFlow.estimatedCost)}`} 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                );
              }
              return null;
            })()}
          </Box>
        )}
      </Paper>
      
      <Box sx={{ height: 'calc(100% - 100px)', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden' }}>
        {loadingFlows ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Cargando flujos médicos...
            </Typography>
          </Box>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            preventScrolling={false}
            // Configuración adicional para forzar posiciones
            snapToGrid={false}
            snapGrid={[1, 1]}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'input':
                    return '#1976d2';
                  case 'output':
                    return '#2e7d32';
                  default:
                    return '#666';
                }
              }}
            />
          </ReactFlow>
        )}
      </Box>
    </Box>
  );
};

export default PatientFlowDiagram;
