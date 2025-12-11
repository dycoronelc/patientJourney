import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import {
  Assignment,
  LocalHospital,
  Science,
  LocalPharmacy,
  People,
  Psychology,
  Restaurant,
  Work,
  Person,
} from '@mui/icons-material';

// Definición de los pasos del flujo PEC
interface PECStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  orderIndex: number;
  details?: string[];
}

const PEC_STEPS: PECStep[] = [
  {
    id: 'pec-reges-1',
    label: 'REGES',
    description: 'Registro y agendamiento de citas',
    icon: <Assignment />,
    color: '#7367f0',
    orderIndex: 0,
    details: [
      'Agendar las citas de los pacientes según corresponda su control con el médico',
      'Programar siguiente cita según indicación médica',
    ],
  },
  {
    id: 'pec-atencion-asegurado',
    label: 'Atención al Asegurado',
    description: 'Identificación y orientación del paciente',
    icon: <People />,
    color: '#55bcba',
    orderIndex: 1,
    details: [
      'Identificar al paciente del PEC',
      'Orientarlo a los diferentes departamentos mencionados en el flujograma',
    ],
  },
  {
    id: 'pec-laboratorio',
    label: 'Laboratorio',
    description: 'Toma de muestras y análisis',
    icon: <Science />,
    color: '#ff9800',
    orderIndex: 2,
    details: [
      'Tomar muestra de sangre al paciente a las 8 am del día de la cita',
      'Procesar el mismo día de la cita para su control con el médico asignado',
      'Laboratorios: BHC, glicemia, HbA1c, creatinina con TFG, nitrógeno de urea, ácido úrico y urinálisis con relación albumina/creatinina en orina',
    ],
  },
  {
    id: 'pec-enfermeria',
    label: 'Enfermería',
    description: 'Evaluación primaria y educación del paciente',
    icon: <LocalHospital />,
    color: '#ea5455',
    orderIndex: 3,
    details: [
      'Evaluación primaria de historia clínica, signos vitales, peso y talla',
      'Proceso de educación personalizada con miras a mejorar la adherencia al tratamiento',
      'Revisión de antecedentes patológicos personales',
      'Medición de perímetro abdominal, peso, talla, IMC',
      'Medición de presión arterial y FC',
      'Revisión y exploración de los pies (si es diabético)',
      'Evaluación de zonas de punción si utiliza tratamiento con insulina',
      'Búsqueda de signos y síntomas de hiperglicemia e hipertensión prolongada',
      'Revisión de exámenes de laboratorios',
      'Educación del paciente y su familia sobre la enfermedad y su tratamiento',
      'Revisión de tarjeta de vacunación',
    ],
  },
  {
    id: 'pec-referencias',
    label: 'Referencias Multidisciplinarias',
    description: 'Evaluación integral según necesidad del paciente',
    icon: <People />,
    color: '#9c88ff',
    orderIndex: 4,
    details: [
      'La enfermera del programa referirá al paciente según la necesidad actual',
      'Mantener la atención el mismo día de la evaluación',
      'Opciones: Trabajo Social, Salud Mental, Nutrición',
    ],
  },
  {
    id: 'pec-medico',
    label: 'Atención Médica',
    description: 'Consulta y evaluación con el médico',
    icon: <Person />,
    color: '#2196f3',
    orderIndex: 5,
    details: [
      'Una vez listos los resultados de laboratorios, el paciente asistirá a la evaluación con el médico',
      'Proporcionar acceso fácil a la atención integral y continua',
      'Identificar y resolver problemas de salud de manera puntual',
      'Atender al individuo en el contexto de la familia',
      'Proporcionar coordinación de diferentes especialistas y tratamientos de apoyo',
      '15 pacientes por día (5 días a la semana)',
    ],
  },
  {
    id: 'pec-farmacia',
    label: 'Farmacia',
    description: 'Dispensación de medicamentos',
    icon: <LocalPharmacy />,
    color: '#4caf50',
    orderIndex: 6,
    details: [
      'Proporcionar los medicamentos indicados por el médico',
    ],
  },
  {
    id: 'pec-reges-2',
    label: 'REGES (Programación)',
    description: 'Programación de siguiente cita',
    icon: <Assignment />,
    color: '#7367f0',
    orderIndex: 7,
    details: [
      'Programar próxima cita según indicación médica',
    ],
  },
];

const PECFlowDiagram: React.FC = () => {
  // Configuración del renderizador
  const stepHeight = 180;
  const nodeWidth = 220;
  const startX = 300;
  const startY = 50;

  // Generar nodos
  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];

    // Nodo de inicio
    nodes.push({
      id: 'pec-start',
      type: 'input',
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: '#7367f0' }} />
            <Typography variant="body2" fontWeight="bold">
              Inicio PEC
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Programa de Educación al Paciente
            </Typography>
            <Chip 
              label="Paciente con Diabetes" 
              size="small" 
              color="primary" 
              sx={{ mt: 1 }} 
            />
          </Box>
        ),
      },
      position: { x: startX, y: startY },
      draggable: false,
      style: {
        background: '#fff',
        border: '2px solid #7367f0',
        borderRadius: 10,
        padding: 0,
        width: nodeWidth,
      },
    });

    // Nodos de pasos
    PEC_STEPS.forEach((step, index) => {
      nodes.push({
        id: step.id,
        data: {
          label: (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ color: step.color, mb: 1 }}>
                {step.icon}
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {step.label}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {step.description}
              </Typography>
            </Box>
          ),
        },
        position: { x: startX, y: startY + (index + 1) * stepHeight },
        draggable: false,
        style: {
          background: '#fff',
          border: `2px solid ${step.color}`,
          borderRadius: 10,
          padding: 0,
          width: nodeWidth,
        },
      });
    });

    // Nodo de finalización
    nodes.push({
      id: 'pec-end',
      type: 'output',
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: '#4caf50' }} />
            <Typography variant="body2" fontWeight="bold">
              Finalización
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Flujo PEC completado
            </Typography>
            <Chip 
              label="Cita Programada" 
              size="small" 
              color="success" 
              sx={{ mt: 1 }} 
            />
          </Box>
        ),
      },
      position: { x: startX, y: startY + (PEC_STEPS.length + 1) * stepHeight },
      draggable: false,
      style: {
        background: '#fff',
        border: '2px solid #4caf50',
        borderRadius: 10,
        padding: 0,
        width: nodeWidth,
      },
    });

    return nodes;
  }, []);

  // Generar edges (conexiones)
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // Edge desde inicio al primer paso
    edges.push({
      id: 'e-start-reges',
      source: 'pec-start',
      target: PEC_STEPS[0].id,
      type: 'default',
      animated: false,
      style: { stroke: '#7367f0', strokeWidth: 2 },
    });

    // Edges entre pasos consecutivos
    for (let i = 0; i < PEC_STEPS.length - 1; i++) {
      edges.push({
        id: `e-${PEC_STEPS[i].id}-${PEC_STEPS[i + 1].id}`,
        source: PEC_STEPS[i].id,
        target: PEC_STEPS[i + 1].id,
        type: 'default',
        animated: false,
        style: { stroke: '#666', strokeWidth: 2 },
      });
    }

    // Edge desde último paso al final
    edges.push({
      id: `e-${PEC_STEPS[PEC_STEPS.length - 1].id}-end`,
      source: PEC_STEPS[PEC_STEPS.length - 1].id,
      target: 'pec-end',
      type: 'default',
      animated: false,
      style: { stroke: '#4caf50', strokeWidth: 2 },
    });

    return edges;
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Deshabilitar cambios de posición
  const handleNodesChange = useCallback((changes: any) => {
    const filteredChanges = changes.filter((change: any) => 
      change.type !== 'position' && change.type !== 'dimensions'
    );
    if (filteredChanges.length > 0) {
      onNodesChange(filteredChanges);
    }
  }, [onNodesChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => [...eds, params]),
    [setEdges]
  );

  const [selectedStep, setSelectedStep] = useState<PECStep | null>(null);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    const step = PEC_STEPS.find(s => s.id === node.id);
    if (step) {
      setSelectedStep(step);
    }
  };

  return (
    <Box>
     
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Diagrama de flujo */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ width: '100%', height: '800px', position: 'relative' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={handleNodeClick}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  attributionPosition="bottom-left"
                >
                  <Background color="#aaa" gap={16} />
                  <Controls />
                  <MiniMap
                    nodeColor={(node) => {
                      const step = PEC_STEPS.find(s => s.id === node.id);
                      return step ? step.color : '#ccc';
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </ReactFlow>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Panel de detalles */}
        {selectedStep && (
          <Box sx={{ width: 350 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: selectedStep.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedStep.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedStep.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStep.description}
                    </Typography>
                  </Box>
                </Box>
                {selectedStep.details && selectedStep.details.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Detalles:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {selectedStep.details.map((detail, idx) => (
                        <li key={idx}>
                          <Typography variant="body2" color="textSecondary">
                            {detail}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {!selectedStep && (
          <Box sx={{ width: 350 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Información
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Haz clic en cualquier paso del flujo para ver sus detalles y funciones específicas.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Leyenda de Colores:
                  </Typography>
                  {PEC_STEPS.map((step) => (
                    <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: step.color,
                        }}
                      />
                      <Typography variant="caption">{step.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PECFlowDiagram;

