/**
 * Servicio para crear y gestionar el flujo PEC en la base de datos
 */

import { medicalFlowService, FlowNode, FlowEdge } from './medicalFlowService';
import api from './api';

// Definición de los pasos del flujo PEC con sus tipos de paso
interface PECStepDefinition {
  id: string;
  label: string;
  description: string;
  stepTypeCode: string; // Código del tipo de paso (st-cons, st-lab, etc.)
  orderIndex: number;
  durationMinutes?: number;
  costAvg?: number;
}

const PEC_STEPS_DEFINITION: PECStepDefinition[] = [
  {
    id: 'pec-reges-1',
    label: 'REGES',
    description: 'Registro y agendamiento de citas',
    stepTypeCode: 'st-cons', // Consulta/Registro
    orderIndex: 0,
    durationMinutes: 15,
    costAvg: 0,
  },
  {
    id: 'pec-atencion-asegurado',
    label: 'Atención al Asegurado',
    description: 'Identificación y orientación del paciente',
    stepTypeCode: 'st-cons', // Consulta
    orderIndex: 1,
    durationMinutes: 10,
    costAvg: 0,
  },
  {
    id: 'pec-laboratorio',
    label: 'Laboratorio',
    description: 'Toma de muestras y análisis: BHC, glicemia, HbA1c, creatinina con TFG, nitrógeno de urea, ácido úrico y urinálisis con relación albumina/creatinina en orina',
    stepTypeCode: 'st-lab', // Laboratorio
    orderIndex: 2,
    durationMinutes: 30,
    costAvg: 45.00,
  },
  {
    id: 'pec-enfermeria',
    label: 'Enfermería',
    description: 'Evaluación primaria y educación del paciente: historia clínica, signos vitales, peso y talla, educación personalizada',
    stepTypeCode: 'st-cons', // Consulta de Enfermería
    orderIndex: 3,
    durationMinutes: 45,
    costAvg: 25.00,
  },
  {
    id: 'pec-referencias',
    label: 'Referencias Multidisciplinarias',
    description: 'Evaluación integral según necesidad: Trabajo Social, Salud Mental, Nutrición',
    stepTypeCode: 'st-ref', // Referencia
    orderIndex: 4,
    durationMinutes: 30,
    costAvg: 20.00,
  },
  {
    id: 'pec-medico',
    label: 'Atención Médica',
    description: 'Consulta y evaluación con el médico del programa PEC',
    stepTypeCode: 'st-cons', // Consulta Médica
    orderIndex: 5,
    durationMinutes: 30,
    costAvg: 50.00,
  },
  {
    id: 'pec-farmacia',
    label: 'Farmacia',
    description: 'Dispensación de medicamentos indicados por el médico',
    stepTypeCode: 'st-rx', // Tratamiento/Prescripción
    orderIndex: 6,
    durationMinutes: 15,
    costAvg: 0, // El costo depende de los medicamentos
  },
  {
    id: 'pec-reges-2',
    label: 'REGES (Programación)',
    description: 'Programación de siguiente cita según indicación médica',
    stepTypeCode: 'st-fu', // Seguimiento
    orderIndex: 7,
    durationMinutes: 10,
    costAvg: 0,
  },
];

/**
 * Crear el flujo PEC en la base de datos
 */
export const createPECFlow = async (): Promise<boolean> => {
  try {
    // Verificar si el flujo ya existe
    const existingFlows = await medicalFlowService.getFlows({ search: 'PEC' });
    const existingPECFlow = existingFlows.find(
      (flow) => flow.name.toLowerCase().includes('pec') || 
                flow.name.toLowerCase().includes('programa de educación')
    );

    if (existingPECFlow) {
      console.log('El flujo PEC ya existe en la base de datos');
      return true;
    }

    // Obtener tipos de pasos para mapear los códigos
    const stepTypes = await medicalFlowService.getStepTypes();
    const stepTypeMap = new Map(stepTypes.map(st => [st.code, st.id]));

    // Crear nodos del flujo
    const nodes: FlowNode[] = [];
    const startX = 300;
    const startY = 50;
    const stepHeight = 180;

    // Nodo inicial
    nodes.push({
      id: 'pec-start',
      flowId: '', // Se asignará después
      stepTypeId: stepTypeMap.get('st-cons') || stepTypes[0]?.id || '',
      label: 'Inicio PEC',
      description: 'Programa de Educación al Paciente - Inicio del flujo',
      orderIndex: -1,
      position: { x: startX, y: startY },
      createdAt: new Date().toISOString(),
    });

    // Nodos de pasos
    PEC_STEPS_DEFINITION.forEach((stepDef, index) => {
      const stepTypeId = stepTypeMap.get(stepDef.stepTypeCode) || stepTypes[0]?.id || '';
      
      nodes.push({
        id: stepDef.id,
        flowId: '', // Se asignará después
        stepTypeId: stepTypeId,
        label: stepDef.label,
        description: stepDef.description,
        orderIndex: stepDef.orderIndex,
        durationMinutes: stepDef.durationMinutes,
        costAvg: stepDef.costAvg,
        position: {
          x: startX,
          y: startY + (index + 1) * stepHeight,
        },
        createdAt: new Date().toISOString(),
      });
    });

    // Nodo final
    nodes.push({
      id: 'pec-end',
      flowId: '', // Se asignará después
      stepTypeId: stepTypeMap.get('st-fu') || stepTypes[0]?.id || '',
      label: 'Finalización PEC',
      description: 'Flujo PEC completado - Cita programada',
      orderIndex: PEC_STEPS_DEFINITION.length,
      position: {
        x: startX,
        y: startY + (PEC_STEPS_DEFINITION.length + 1) * stepHeight,
      },
      createdAt: new Date().toISOString(),
    });

    // Crear edges (conexiones)
    const edges: FlowEdge[] = [];

    // Edge desde inicio al primer paso
    edges.push({
      id: 'e-pec-start-reges',
      flowId: '', // Se asignará después
      sourceNodeId: 'pec-start',
      targetNodeId: PEC_STEPS_DEFINITION[0].id,
      edgeType: 'default',
      createdAt: new Date().toISOString(),
    });

    // Edges entre pasos consecutivos
    for (let i = 0; i < PEC_STEPS_DEFINITION.length - 1; i++) {
      edges.push({
        id: `e-pec-${PEC_STEPS_DEFINITION[i].id}-${PEC_STEPS_DEFINITION[i + 1].id}`,
        flowId: '', // Se asignará después
        sourceNodeId: PEC_STEPS_DEFINITION[i].id,
        targetNodeId: PEC_STEPS_DEFINITION[i + 1].id,
        edgeType: 'default',
        createdAt: new Date().toISOString(),
      });
    }

    // Edge desde último paso al final
    edges.push({
      id: 'e-pec-last-end',
      flowId: '', // Se asignará después
      sourceNodeId: PEC_STEPS_DEFINITION[PEC_STEPS_DEFINITION.length - 1].id,
      targetNodeId: 'pec-end',
      edgeType: 'default',
      createdAt: new Date().toISOString(),
    });

    // Calcular duración y costo total
    const totalDuration = nodes.reduce((sum, node) => 
      sum + (node.durationMinutes || 0), 0
    );
    const totalCost = nodes.reduce((sum, node) => 
      sum + (node.costAvg || 0), 0
    );

    // Crear el flujo usando el endpoint de medical-flows
    const flowData = {
      name: 'Programa de Prevención de Enfermedades Crónicas no Transmisibles (PEC)',
      description: 'Flujo de atención para pacientes con enfermedades crónicas, especialmente diabetes, en el Programa de Educación al Paciente',
      specialtyId: null, // PEC no está asociado a una especialidad específica
      nodes: nodes.map(node => ({
        ...node,
        // Asegurar que todos los campos requeridos estén presentes
        stepTypeName: stepTypes.find(st => st.id === node.stepTypeId)?.name || '',
      })),
      edges: edges,
      averageDuration: totalDuration,
      estimatedCost: totalCost,
      isActive: true,
    };

    // Intentar crear el flujo usando el endpoint de medical-flows
    try {
      const response = await api.post('/api/v1/medical-flows/flows', flowData);
      console.log('Flujo PEC creado exitosamente:', response.data);
      return true;
    } catch (error: any) {
      console.error('Error creando flujo PEC:', error);
      // Si falla, intentar con el endpoint alternativo
      try {
        const altResponse = await api.post('/api/v1/flows/', flowData);
        console.log('Flujo PEC creado exitosamente (endpoint alternativo):', altResponse.data);
        return true;
      } catch (altError) {
        console.error('Error creando flujo PEC (endpoint alternativo):', altError);
        throw altError;
      }
    }
  } catch (error) {
    console.error('Error al crear el flujo PEC:', error);
    return false;
  }
};

/**
 * Verificar si el flujo PEC existe en la base de datos
 */
export const checkPECFlowExists = async (): Promise<boolean> => {
  try {
    const flows = await medicalFlowService.getFlows({ search: 'PEC' });
    return flows.some(
      (flow) => flow.name.toLowerCase().includes('pec') || 
                flow.name.toLowerCase().includes('programa de educación') ||
                flow.name.toLowerCase().includes('enfermedades crónicas')
    );
  } catch (error: any) {
    // Si hay error de red, CORS, o servidor, retornar false silenciosamente
    // para no bloquear la funcionalidad del componente
    console.warn('No se pudo verificar si el flujo PEC existe:', error?.message || error);
    return false;
  }
};

