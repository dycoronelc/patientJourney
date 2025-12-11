import React, { useState, useCallback, useEffect } from 'react';
import { medicalFlowService, Flow, Specialty, FlowNode } from '../../services/medicalFlowService';
import FlowRenderer from './FlowRenderer';
import { medicalFlowService as medFlowService } from '../../services/medicalFlowService';
import { formatCurrency, formatDuration } from '../../utils/numberFormatter';
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
  NodeTypes,
} from 'react-flow-renderer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Save,
  Delete,
  Person,
  LocalHospital,
  Assignment,
  Science,
  CheckCircle,
  Edit,
  Close,
  Build,
  Medication,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface AvailableStep {
  id: string;
  name: string;
  description: string;
  step_type: string;
  base_cost: number;
  duration_minutes: number;
  icon: string;
  color: string;
  is_active: boolean;
  category: string;
  tags: string[];
}

interface FlowEditorProps {
  flowId?: string;
  onSave?: (flowData: any) => void;
  readOnly?: boolean;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ flowId, onSave, readOnly = false }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [availableSteps, setAvailableSteps] = useState<AvailableStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null);

  // Cargar pasos disponibles desde la API
  useEffect(() => {
    loadAvailableSteps();
  }, []);

  const loadAvailableSteps = async () => {
    try {
      setLoadingSteps(true);
      // Cargar flujos desde medicalFlowService en lugar de stepService
      const flows = await medicalFlowService.getFlows();
      // Convertir flujos a pasos disponibles
      const steps = flows.flatMap(flow => 
        flow.nodes?.map(node => ({
          id: node.id,
          name: node.label,
          description: node.description || '',
          step_type: node.stepTypeId,
          base_cost: node.costAvg || 0,
          duration_minutes: node.durationMinutes || 0,
          icon: node.stepTypeId,
          color: medicalFlowService.getStepTypeColor(node.stepTypeId),
          is_active: true,
          category: 'medical',
          tags: [flow.specialtyName || 'general']
        })) || []
      );
      setAvailableSteps(steps);
    } catch (error) {
      console.error('Error loading steps:', error);
      // Si hay error, usar pasos por defecto
      setAvailableSteps([]);
    } finally {
      setLoadingSteps(false);
    }
  };

  // Cargar datos del flujo si está editando
  useEffect(() => {
    if (flowId) {
      loadFlowFromAPI(flowId);
    }
  }, [flowId]);

  // Función helper para obtener el icono según el tipo
  const getIconForType = (type: string) => {
    switch (type) {
      case 'consultation': return <Person sx={{ fontSize: 40, color: 'primary.main' }} />;
      case 'laboratory': return <Science sx={{ fontSize: 40, color: 'secondary.main' }} />;
      case 'imaging': return <Assignment sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'referral': return <LocalHospital sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'discharge': return <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'medication': return <Medication sx={{ fontSize: 40, color: 'info.main' }} />;
      default: return <Build sx={{ fontSize: 40, color: 'grey.500' }} />;
    }
  };

  // Función para auto-organizar nodos
  const autoOrganizeNodes = (nodes: any[]) => {
    // Verificar si los nodos están muy juntos (apilados)
    const positions = nodes.map(n => n.position);
    const minDistance = 200; // Distancia mínima entre nodos
    let needsReorganization = false;
    
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.sqrt(
          Math.pow(positions[i].x - positions[j].x, 2) + 
          Math.pow(positions[i].y - positions[j].y, 2)
        );
        if (distance < minDistance) {
          needsReorganization = true;
          break;
        }
      }
      if (needsReorganization) break;
    }
    
    if (needsReorganization) {
      const reorganizedNodes = nodes.map((node, index) => {
        const centerX = 400;
        const centerY = 300;
        const spacing = 250;
        
        let newPosition;
        if (nodes.length <= 3) {
          // Distribución horizontal para flujos cortos
          newPosition = {
            x: centerX + (index - Math.floor(nodes.length / 2)) * spacing,
            y: centerY
          };
        } else {
          // Distribución en grid para flujos largos
          const cols = Math.ceil(Math.sqrt(nodes.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          newPosition = {
            x: centerX + (col - Math.floor(cols / 2)) * spacing,
            y: centerY + (row - Math.floor(nodes.length / cols / 2)) * 200
          };
        }
        
        return {
          ...node,
          position: newPosition
        };
      });
      
      setNodes(reorganizedNodes);
      toast.success('Nodos auto-organizados');
    }
  };

  // Cargar flujo desde la API
  const loadFlowFromAPI = async (id: string) => {
    try {
      const flow = await medicalFlowService.getFlowById(id);
      
      if (!flow) {
        toast.error('Flujo no encontrado');
        return;
      }
      
      setFlowName(flow.name);
      setFlowDescription(flow.description || '');
      
      // Determinar si es un flujo Bienimed para ajustar el espaciado
      const isBienimed = !flow.id.startsWith('flow-');
      const stepHeight = isBienimed ? 250 : 180; // Más espacio para Bienimed
      
      // Usar FlowRenderer universal para generar nodos y edges
      const flowRenderer = new FlowRenderer({
        stepHeight,
        nodeWidth: 200,
        startY: 0,
        startX: 300,
        showStartNode: true,
        showEndNode: true,
      });
      
      // Guardar el flujo actual para referencia
      setCurrentFlow(flow);
      
      // Generar nodos y edges usando el renderizador universal
      if (flow.nodes && flow.nodes.length > 0) {
        const loadedNodes = flowRenderer.generateNodes(flow);
        const loadedEdges = flowRenderer.generateEdges(flow);
        
        // Habilitar arrastre de nodos en el editor y preservar datos originales
        const editableNodes = loadedNodes.map((node, index) => {
          const originalNode = flow.nodes[index];
          return {
            ...node,
            draggable: !readOnly, // Permitir arrastre solo si no es solo lectura
            data: {
              ...node.data,
              originalNode: originalNode, // Guardar referencia al nodo original
            },
          };
        });
        
        setNodes(editableNodes);
        setEdges(loadedEdges);
      }
      
      toast.success('Flujo cargado exitosamente');
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Error al cargar el flujo');
    }
  };

  // Función para cargar el flujo general (3 pasos)
  const loadGeneralFlow = () => {
    const generalNodes = [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 250, y: 50 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Person />
              <Typography variant="body2" fontWeight="bold">
                Consulta General
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDuration(20)}
              </Typography>
              <Chip label={formatCurrency(35)} size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[0],
        },
        style: {
          background: '#fff',
          border: '2px solid #1976d2',
          borderRadius: 10,
          padding: 0,
          width: 180,
        },
      },
      {
        id: 'node-2',
        type: 'default',
        position: { x: 250, y: 200 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Science />
              <Typography variant="body2" fontWeight="bold">
                Exámenes Básicos
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Hemograma, Química
              </Typography>
              <Chip label={formatCurrency(30)} size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[1],
        },
        style: {
          background: '#fff',
          border: '2px solid #dc004e',
          borderRadius: 10,
          padding: 0,
          width: 180,
        },
      },
      {
        id: 'node-3',
        type: 'output',
        position: { x: 250, y: 350 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CheckCircle />
              <Typography variant="body2" fontWeight="bold">
                Alta con Tratamiento
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Prescripción y seguimiento
              </Typography>
              <Chip label={`Total: ${formatCurrency(65)}`} size="small" color="success" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[4],
        },
        style: {
          background: '#fff',
          border: '2px solid #2e7d32',
          borderRadius: 10,
          padding: 0,
          width: 180,
        },
      },
    ];

    const generalEdges = [
      {
        id: 'edge-1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        style: { stroke: '#dc004e', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc004e' },
      },
      {
        id: 'edge-2-3',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        style: { stroke: '#2e7d32', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2e7d32' },
      },
    ];

    setNodes(generalNodes);
    setEdges(generalEdges);
  };

  // Función para cargar el flujo de cardiología (5 pasos)
  const loadCardiologyFlow = () => {
    const cardiologyNodes = [
      {
        id: 'node-1',
        type: 'input',
        position: { x: 250, y: 0 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Person />
              <Typography variant="body2" fontWeight="bold">Consulta General</Typography>
              <Typography variant="caption" color="textSecondary">20 min</Typography>
              <Chip label="$35.00" size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[0],
        },
        style: { background: '#fff', border: '2px solid #1976d2', borderRadius: 10, padding: 0, width: 180 },
      },
      {
        id: 'node-2',
        type: 'default',
        position: { x: 100, y: 150 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Science />
              <Typography variant="body2" fontWeight="bold">Laboratorios</Typography>
              <Typography variant="caption" color="textSecondary">Perfil Lipídico</Typography>
              <Chip label={formatCurrency(42.5)} size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[1],
        },
        style: { background: '#fff', border: '2px solid #dc004e', borderRadius: 10, padding: 0, width: 180 },
      },
      {
        id: 'node-3',
        type: 'default',
        position: { x: 400, y: 150 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Assignment />
              <Typography variant="body2" fontWeight="bold">Imágenes</Typography>
              <Typography variant="caption" color="textSecondary">Electrocardiograma</Typography>
              <Chip label="$35.00" size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[2],
        },
        style: { background: '#fff', border: '2px solid #2e7d32', borderRadius: 10, padding: 0, width: 180 },
      },
      {
        id: 'node-4',
        type: 'default',
        position: { x: 250, y: 300 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <LocalHospital />
              <Typography variant="body2" fontWeight="bold">Referencia Cardiólogo</Typography>
              <Typography variant="caption" color="textSecondary">Especialista</Typography>
              <Chip label={formatCurrency(120)} size="small" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[3],
        },
        style: { background: '#fff', border: '2px solid #ed6c02', borderRadius: 10, padding: 0, width: 180 },
      },
      {
        id: 'node-5',
        type: 'output',
        position: { x: 250, y: 450 },
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CheckCircle />
              <Typography variant="body2" fontWeight="bold">Alta del Paciente</Typography>
              <Typography variant="caption" color="textSecondary">Tratamiento y seguimiento</Typography>
              <Chip label={`Total: ${formatCurrency(302.5)}`} size="small" color="success" sx={{ mt: 1 }} />
            </Box>
          ),
          templateData: nodeTemplates[4],
        },
        style: { background: '#fff', border: '2px solid #2e7d32', borderRadius: 10, padding: 0, width: 180 },
      },
    ];

    const cardiologyEdges = [
      { id: 'edge-1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#dc004e', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#dc004e' } },
      { id: 'edge-1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#2e7d32', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2e7d32' } },
      { id: 'edge-2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#ed6c02', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ed6c02' } },
      { id: 'edge-3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#ed6c02', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ed6c02' } },
      { id: 'edge-4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#2e7d32', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2e7d32' } },
    ];

    setNodes(cardiologyNodes);
    setEdges(cardiologyEdges);
  };

  // Función para cargar flujo por defecto (1 paso)
  const loadDefaultFlow = () => {
    const defaultNode = {
      id: 'node-1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Person />
            <Typography variant="body2" fontWeight="bold">
              Consulta General
            </Typography>
            <Typography variant="caption" color="textSecondary">
              20 min
            </Typography>
            <Chip label="$35.00" size="small" sx={{ mt: 1 }} />
          </Box>
        ),
        templateData: nodeTemplates[0],
      },
      style: {
        background: '#fff',
        border: `2px solid ${nodeTemplates[0].color}`,
        borderRadius: 10,
        padding: 0,
        width: 180,
      },
    };
    
    setNodes([defaultNode]);
    setEdges([]);
  };

  // Funciones placeholder para otros flujos
  const loadEndocrinologyFlow = () => {
    // Implementar flujo de endocrinología
    loadDefaultFlow();
  };

  const loadGeriatricsFlow = () => {
    // Implementar flujo de geriatría
    loadDefaultFlow();
  };

  // Definir tipo para los templates de nodos
  interface NodeTemplate {
    id: string;
    type: string;
    label: string;
    description?: string;
    icon: React.ReactElement;
    color: string;
    defaultCost: number;
    defaultDuration: number;
    category?: string;
    tags?: string[];
    stepData?: AvailableStep;
  }

  // Generar templates de nodos desde los pasos disponibles
  const getNodeTemplates = (): NodeTemplate[] => {
    if (loadingSteps || availableSteps.length === 0) {
      // Templates por defecto mientras cargan los datos
      return [
        {
          id: 'default-consultation',
          type: 'consultation',
          label: 'Consulta',
          icon: <Person />,
          color: '#1976d2',
          defaultCost: 35.00,
          defaultDuration: 20,
          category: 'Consulta',
          tags: [],
        },
        {
          id: 'default-laboratory',
          type: 'laboratory',
          label: 'Laboratorio',
          icon: <Science />,
          color: '#dc004e',
          defaultCost: 25.00,
          defaultDuration: 15,
          category: 'Laboratorio',
          tags: [],
        },
        {
          id: 'default-imaging',
          type: 'imaging',
          label: 'Imagen',
          icon: <Assignment />,
          color: '#2e7d32',
          defaultCost: 45.00,
          defaultDuration: 30,
          category: 'Imágenes',
          tags: [],
        },
        {
          id: 'default-referral',
          type: 'referral',
          label: 'Referencia',
          icon: <LocalHospital />,
          color: '#ed6c02',
          defaultCost: 75.00,
          defaultDuration: 30,
          category: 'Referencia',
          tags: [],
        },
        {
          id: 'default-discharge',
          type: 'discharge',
          label: 'Alta',
          icon: <CheckCircle />,
          color: '#2e7d32',
          defaultCost: 0,
          defaultDuration: 10,
          category: 'Alta',
          tags: [],
        },
      ];
    }

    return availableSteps.map((step): NodeTemplate => {
      const iconMap: Record<string, React.ReactElement> = {
        'Person': <Person />,
        'Science': <Science />,
        'Assignment': <Assignment />,
        'LocalHospital': <LocalHospital />,
        'CheckCircle': <CheckCircle />,
        'Build': <Build />,
        'Medication': <Medication />,
      };
      
      const iconComponent = iconMap[step.icon || 'Person'] || <Person />;
      
      return {
        id: step.id,
        type: step.step_type,
        label: step.name,
        description: step.description || '',
        icon: iconComponent,
        color: step.color || '#1976d2',
        defaultCost: step.base_cost,
        defaultDuration: step.duration_minutes || 0,
        category: step.category || '',
        tags: step.tags || [],
        stepData: step,
      };
    });
  };

  const nodeTemplates = getNodeTemplates();

  const [nodeForm, setNodeForm] = useState({
    label: '',
    description: '',
    cost: 0,
    duration: 0,
    type: 'consultation',
  });

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`, // Agregar ID único
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNode = (template: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {template.icon}
            <Typography variant="body2" fontWeight="bold">
              {template.label}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {template.defaultDuration} min
            </Typography>
            <Chip
              label={`$${template.defaultCost.toFixed(2)}`}
              size="small"
              sx={{ mt: 1, bgcolor: template.color, color: 'white' }}
            />
          </Box>
        ),
        templateData: template,
      },
      style: {
        background: '#fff',
        border: `2px solid ${template.color}`,
        borderRadius: 10,
        padding: 0,
        width: 180,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success(`${template.label} agregado al flujo`);
  };

  const editNode = (node: Node) => {
    setSelectedNode(node);
    const template = node.data.templateData;
    setNodeForm({
      label: template.label,
      description: '',
      cost: template.defaultCost,
      duration: template.defaultDuration,
      type: template.type,
    });
    setDialogOpen(true);
  };

  const updateNode = () => {
    if (!selectedNode) return;

    const template = nodeTemplates.find((t: NodeTemplate) => t.type === nodeForm.type);
    if (!template) return;

    const updatedNode = {
      ...selectedNode,
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {template.icon}
            <Typography variant="body2" fontWeight="bold">
              {nodeForm.label}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {nodeForm.duration} min
            </Typography>
            <Chip
              label={`$${nodeForm.cost.toFixed(2)}`}
              size="small"
              sx={{ mt: 1, bgcolor: template.color, color: 'white' }}
            />
          </Box>
        ),
        templateData: {
          ...template,
          label: nodeForm.label,
          defaultCost: nodeForm.cost,
          defaultDuration: nodeForm.duration,
        },
      },
    };

    setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? updatedNode : n)));
    setDialogOpen(false);
    toast.success('Nodo actualizado');
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    toast.success('Nodo eliminado');
  };

  const saveFlow = async () => {
    if (!flowName) {
      toast.error('Ingresa un nombre para el flujo');
      return;
    }

    // Calcular costo y duración totales
    const estimatedCost = nodes.reduce((sum, n) => {
      const originalNode = n.data?.originalNode || currentFlow?.nodes?.find((fn: any) => fn.id === n.id);
      return sum + (n.data.templateData?.defaultCost || originalNode?.costAvg || 0);
    }, 0);
    
    const estimatedDuration = nodes.reduce((sum, n) => {
      const originalNode = n.data?.originalNode || currentFlow?.nodes?.find((fn: any) => fn.id === n.id);
      return sum + (n.data.templateData?.defaultDuration || originalNode?.durationMinutes || 0);
    }, 0);

    const flowData = {
      name: flowName,
      description: flowDescription,
      nodes: nodes.map(n => {
        // Obtener datos del nodo original si existe
        const originalNode = n.data?.originalNode || currentFlow?.nodes?.find((fn: any) => fn.id === n.id);
        
        return {
          id: n.id,
          type: n.data.templateData?.type || originalNode?.stepTypeId,
          label: n.data.templateData?.label || originalNode?.label || n.data?.label,
          cost: n.data.templateData?.defaultCost || originalNode?.costAvg || 0,
          duration: n.data.templateData?.defaultDuration || originalNode?.durationMinutes || 0,
          position: n.position, // Guardar la posición actual (puede haber sido movida)
          stepTypeId: originalNode?.stepTypeId,
          description: originalNode?.description || n.data?.label,
        };
      }),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      })),
      estimatedCost: estimatedCost,
      estimatedDuration: estimatedDuration,
    };

    // Si hay un flowId y el flujo es del sistema de flows (medical flows), usar medicalFlowService
    if (flowId && flowId.startsWith('flow-')) {
      try {
        await medicalFlowService.updateFlow(flowId, flowData);
        toast.success('Flujo actualizado exitosamente');
        if (onSave) {
          onSave(flowData);
        }
        return;
      } catch (error) {
        console.error('Error actualizando flujo:', error);
        toast.error('Error al actualizar el flujo');
        return;
      }
    }

    // Para otros flujos, usar el callback onSave
    if (onSave) {
      onSave(flowData);
    }

    toast.success('Flujo guardado exitosamente');
  };

  const clearFlow = () => {
    if (window.confirm('¿Estás seguro de eliminar todos los nodos y conexiones del flujo?')) {
      setNodes([]);
      setEdges([]);
      toast('Flujo limpiado', { icon: 'ℹ️' });
    }
  };

  // Función para eliminar un nodo seleccionado
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setDialogOpen(false);
      setSelectedNode(null);
      toast.success('Paso eliminado del flujo');
    }
  }, [selectedNode, setNodes, setEdges]);

  // Función para eliminar un edge (conexión)
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (!readOnly && window.confirm('¿Deseas eliminar esta conexión?')) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      toast.success('Conexión eliminada');
    }
  }, [readOnly, setEdges]);

  return (
    <Box sx={{ display: 'flex', height: '700px' }}>
      {/* Panel lateral con herramientas */}
      <Box sx={{ width: 250, borderRight: '1px solid #ccc', p: 2, overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Herramientas
        </Typography>

        {/* Información del flujo */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Nombre del Flujo"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            disabled={readOnly}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={flowDescription}
            onChange={(e) => setFlowDescription(e.target.value)}
            size="small"
            multiline
            rows={2}
            disabled={readOnly}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Agregar Pasos
          {loadingSteps && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Typography>

        {loadingSteps ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List dense>
            {nodeTemplates.map((template) => (
              <ListItem key={template.id} disablePadding>
                <ListItemButton
                  onClick={() => addNode(template)}
                  disabled={readOnly}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: template.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {template.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body2" fontWeight="medium" component="div">
                        {template.label}
                      </Typography>
                    }
                    secondary={
                      <Box component="div">
                        <Typography variant="caption" color="textSecondary" component="div">
                          {medicalFlowService.formatCost(template.defaultCost)}
                          {template.defaultDuration > 0 && ` • ${template.defaultDuration} min`}
                        </Typography>
                        {template.category && (
                          <Chip 
                            label={template.category} 
                            size="small" 
                            sx={{ mt: 0.5, height: 16, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        {!readOnly && (
          <Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Save />}
              onClick={saveFlow}
              sx={{ mb: 1 }}
            >
              Guardar Flujo
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Build />}
              onClick={() => autoOrganizeNodes(nodes)}
              sx={{ mb: 1 }}
            >
              Auto-Organizar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={clearFlow}
            >
              Limpiar Todo
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Instrucciones:</strong><br />
            1. Haz clic en un paso para agregarlo<br />
            2. Arrastra los nodos para organizarlos<br />
            3. Conecta los nodos arrastrando desde el borde<br />
            4. Doble clic para editar un nodo
          </Typography>
        </Box>
      </Box>

      {/* Área de diseño del flujo */}
      <Box sx={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(event, node) => !readOnly && editNode(node)}
          onEdgeClick={onEdgeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const template = node.data.templateData;
              return template?.color || '#1976d2';
            }}
          />
        </ReactFlow>
      </Box>

      {/* Dialog para editar nodo */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Paso del Flujo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={nodeForm.type}
                  label="Tipo"
                  onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value })}
                >
                  {nodeTemplates.map((template) => (
                    <MenuItem key={template.type} value={template.type}>
                      {template.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={nodeForm.label}
                onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={nodeForm.description}
                onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Costo ($)"
                type="number"
                value={nodeForm.cost}
                onChange={(e) => setNodeForm({ ...nodeForm, cost: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duración (min)"
                type="number"
                value={nodeForm.duration}
                onChange={(e) => setNodeForm({ ...nodeForm, duration: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {!readOnly && (
            <Button 
              onClick={deleteSelectedNode} 
              color="error"
              startIcon={<Delete />}
              sx={{ mr: 'auto' }}
            >
              Eliminar Paso
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={updateNode} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlowEditor;
