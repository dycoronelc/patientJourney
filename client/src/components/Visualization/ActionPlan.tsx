import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  Lightbulb,
  Timeline,
  Speed,
  Group,
  AttachMoney,
  PlayArrow,
  Pause,
  Stop,
  ExpandMore,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { analyticsService } from '../../services/analyticsService';
import InfoTooltip from '../Common/InfoTooltip';
import { medicalFlowService, Flow, Specialty } from '../../services/medicalFlowService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface ActionPlanProps {
  specialtyIds?: number[];
}

interface ActionPlan {
  specialty_id: number;
  specialty_name: string;
  plan_id: string;
  plan_name: string;
  description: string;
  objectives: string[];
  phases: {
    id: string;
    name: string;
    description: string;
    duration: string;
    priority: 'high' | 'medium' | 'low';
    tasks: {
      id: string;
      name: string;
      description: string;
      responsible: string;
      duration: string;
      dependencies: string[];
      resources: string[];
      cost: number;
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    }[];
    deliverables: string[];
    success_criteria: string[];
  }[];
  total_duration: string;
  total_cost: number;
  expected_improvements: {
    efficiency_gain: number;
    cost_reduction: number;
    satisfaction_improvement: number;
    time_reduction: number;
  };
  risk_assessment: {
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
}

const ActionPlanComponent: React.FC<ActionPlanProps> = ({ specialtyIds }) => {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  useEffect(() => {
    loadActionPlans();
  }, [specialtyIds]);

  const loadActionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar especialidades y flujos reales
      const [specialties, flows] = await Promise.all([
        medicalFlowService.getSpecialties(),
        medicalFlowService.getFlows()
      ]);
      
      // Generar planes de acción basados en datos reales
      const realData = generateActionPlansFromData(specialties, flows);
      setActionPlans(realData);
      
    } catch (err) {
      console.error('Error loading action plans:', err);
      setError(err instanceof Error ? err.message : 'Error cargando planes de acción');
    } finally {
      setLoading(false);
    }
  };

  const generateActionPlansFromData = (specialties: Specialty[], flows: Flow[]): ActionPlan[] => {
    return specialties.map(specialty => {
      // Buscar flujos de esta especialidad con matching flexible
      const specialtyFlows = flows.filter(flow => {
        if (flow.specialtyId === specialty.id) return true;
        if (flow.specialtyName && specialty.name && 
            flow.specialtyName.toLowerCase() === specialty.name.toLowerCase()) return true;
        if (flow.specialtyId === specialty.code) return true;
        return false;
      });
      
      const idealFlow = specialtyFlows.find(f => f.id.startsWith('flow-')) || specialtyFlows[0];
      
      if (!idealFlow) {
        // Si no hay flujo, retornar plan vacío
        return {
          specialty_id: typeof specialty.id === 'string' ? parseInt(specialty.id) : specialty.id,
          specialty_name: specialty.name,
          plan_id: `${specialty.code}-001`,
          plan_name: 'Plan de Optimización',
          description: 'Plan para mejorar la eficiencia del flujo de atención',
          objectives: [],
          phases: [],
          total_duration: '0 semanas',
          total_cost: 0,
          expected_improvements: {
            efficiency_gain: 0,
            cost_reduction: 0,
            satisfaction_improvement: 0,
            time_reduction: 0,
          },
          risk_assessment: [],
        };
      }
      
      // Calcular métricas basadas en el flujo ideal
      const flowSteps = idealFlow.nodes.length;
      const flowDuration = idealFlow.averageDuration || 0;
      const flowCost = idealFlow.estimatedCost || 0;
      
      return {
        specialty_id: typeof specialty.id === 'string' ? parseInt(specialty.id) : specialty.id,
        specialty_name: specialty.name,
        plan_id: `${specialty.code}-001`,
        plan_name: `Optimización del Flujo de ${specialty.name}`,
        description: `Plan integral para mejorar la eficiencia del flujo de atención en ${specialty.name.toLowerCase()}`,
        objectives: [
          `Reducir tiempo de espera en un ${Math.round(flowDuration * 0.2)}%`,
          `Mejorar satisfacción del paciente en ${flowSteps * 2}%`,
          `Optimizar utilización de recursos en ${flowSteps * 3}%`,
          `Reducir costos operativos en ${Math.round(flowCost * 0.15)}%`
        ],
        phases: [
          {
            id: 'phase-1',
            name: 'Análisis y Preparación',
            description: 'Evaluación detallada del estado actual y preparación del entorno',
            duration: `${Math.max(2, Math.min(6, Math.ceil(flowSteps / 3)))} semanas`,
            priority: 'high' as const,
            tasks: [
              {
                id: 'task-1-1',
                name: 'Auditoría de Procesos',
                description: 'Análisis detallado de los procesos actuales',
                responsible: 'Equipo de Calidad',
                duration: '2 semanas',
                dependencies: [],
                resources: ['Analistas de procesos'],
                cost: flowCost * 0.1,
                status: 'pending' as const,
              },
              {
                id: 'task-1-2',
                name: 'Benchmarking',
                description: 'Comparación con mejores prácticas',
                responsible: 'Equipo de Calidad',
                duration: '1 semana',
                dependencies: ['task-1-1'],
                resources: ['Investigadores'],
                cost: flowCost * 0.05,
                status: 'pending' as const,
              },
            ],
            deliverables: ['Reporte de auditoría', 'Benchmarking documentado'],
            success_criteria: ['Procesos actuales documentados', 'Diferencias identificadas'],
          },
          {
            id: 'phase-2',
            name: 'Implementación',
            description: 'Ejecución de mejoras identificadas',
            duration: `${Math.max(4, Math.min(12, Math.ceil(flowSteps / 2)))} semanas`,
            priority: 'high' as const,
            tasks: [
              {
                id: 'task-2-1',
                name: 'Capacitación del Personal',
                description: 'Entrenamiento en nuevos procesos',
                responsible: 'RH y Equipo Médico',
                duration: '2 semanas',
                dependencies: ['task-1-1'],
                resources: ['Instructores', 'Material de capacitación'],
                cost: flowCost * 0.15,
                status: 'pending' as const,
              },
              {
                id: 'task-2-2',
                name: 'Optimización de Flujo',
                description: 'Reorganización de pasos para mejorar eficiencia',
                responsible: 'Equipo de Operaciones',
                duration: `${Math.ceil(flowSteps / 2)} semanas`,
                dependencies: ['task-1-1'],
                resources: ['Coordinadores', 'Sistema de gestión'],
                cost: flowCost * 0.2,
                status: 'pending' as const,
              },
            ],
            deliverables: ['Personal capacitado', 'Flujo optimizado implementado'],
            success_criteria: ['Certificación del personal', 'Flujo nuevo en operación'],
          },
          {
            id: 'phase-3',
            name: 'Monitoreo y Ajuste',
            description: 'Seguimiento continuo y refinamiento',
            duration: '4-6 semanas',
            priority: 'medium' as const,
            tasks: [
              {
                id: 'task-3-1',
                name: 'Monitoreo de KPIs',
                description: 'Seguimiento de indicadores clave',
                responsible: 'Equipo de Calidad',
                duration: 'Continuo',
                dependencies: ['task-2-2'],
                resources: ['Dashboard de métricas'],
                cost: flowCost * 0.05,
                status: 'pending' as const,
              },
            ],
            deliverables: ['Reportes de rendimiento', 'Ajustes implementados'],
            success_criteria: ['Metas alcanzadas', 'Procesos estabilizados'],
          },
        ],
        total_duration: `${Math.max(10, Math.min(24, Math.ceil(flowSteps * 1.5)))} semanas`,
        total_cost: flowCost * 0.5,
        expected_improvements: {
          efficiency_gain: Math.min(95, Math.max(70, 100 - (flowSteps * 5))),
          cost_reduction: flowCost * 0.15,
          satisfaction_improvement: flowSteps * 2,
          time_reduction: flowDuration * 0.2,
        },
        risk_assessment: [
          {
            risk: 'Resistencia al cambio',
            probability: 'medium' as const,
            impact: 'high' as const,
            mitigation: 'Comunicación efectiva y capacitación adecuada',
          },
          {
            risk: 'Sobrecarga de recursos',
            probability: 'low' as const,
            impact: 'medium' as const,
            mitigation: 'Implementación gradual y asignación de recursos adicionales',
          },
        ],
      };
    });
  };

  const generateMockActionPlanData = (): ActionPlan[] => {
    return [
      {
        specialty_id: 1,
        specialty_name: 'Medicina General',
        plan_id: 'MG-001',
        plan_name: 'Optimización del Flujo de Atención',
        description: 'Plan integral para mejorar la eficiencia del flujo de atención en medicina general',
        objectives: [
          'Reducir tiempo de espera en 60%',
          'Mejorar satisfacción del paciente',
          'Optimizar utilización de recursos',
          'Reducir costos operativos'
        ],
        phases: [
          {
            id: 'phase-1',
            name: 'Análisis y Preparación',
            description: 'Evaluación detallada del estado actual y preparación del entorno',
            duration: '4-6 semanas',
            priority: 'high',
            tasks: [
              {
                id: 'task-1-1',
                name: 'Auditoría de Procesos',
                description: 'Análisis detallado de los procesos actuales',
                responsible: 'Analista de Procesos',
                duration: '2 semanas',
                dependencies: [],
                resources: ['Equipo de análisis', 'Herramientas de mapeo'],
                cost: 5000,
                status: 'pending'
              },
              {
                id: 'task-1-2',
                name: 'Identificación de Cuellos de Botella',
                description: 'Identificar puntos críticos en el flujo',
                responsible: 'Especialista en Procesos',
                duration: '1 semana',
                dependencies: ['task-1-1'],
                resources: ['Datos históricos', 'Software de análisis'],
                cost: 3000,
                status: 'pending'
              }
            ],
            deliverables: ['Reporte de auditoría', 'Mapa de procesos actual', 'Identificación de problemas'],
            success_criteria: ['100% de procesos mapeados', 'Cuellos de botella identificados']
          },
          {
            id: 'phase-2',
            name: 'Diseño de Solución',
            description: 'Diseño de la nueva estructura y procesos optimizados',
            duration: '6-8 semanas',
            priority: 'high',
            tasks: [
              {
                id: 'task-2-1',
                name: 'Diseño del Nuevo Flujo',
                description: 'Crear el flujo optimizado basado en mejores prácticas',
                responsible: 'Arquitecto de Procesos',
                duration: '3 semanas',
                dependencies: ['task-1-2'],
                resources: ['Equipo de diseño', 'Benchmarks de la industria'],
                cost: 8000,
                status: 'pending'
              },
              {
                id: 'task-2-2',
                name: 'Definición de Roles y Responsabilidades',
                description: 'Establecer claramente los roles en el nuevo proceso',
                responsible: 'Gerente de Operaciones',
                duration: '2 semanas',
                dependencies: ['task-2-1'],
                resources: ['Manual de procesos', 'Matriz RACI'],
                cost: 4000,
                status: 'pending'
              }
            ],
            deliverables: ['Flujo optimizado', 'Manual de procesos', 'Matriz de responsabilidades'],
            success_criteria: ['Flujo validado por expertos', 'Roles claramente definidos']
          },
          {
            id: 'phase-3',
            name: 'Implementación Piloto',
            description: 'Implementación en un área limitada para validar la solución',
            duration: '8-10 semanas',
            priority: 'medium',
            tasks: [
              {
                id: 'task-3-1',
                name: 'Capacitación del Personal',
                description: 'Entrenar al personal en los nuevos procesos',
                responsible: 'Coordinador de Capacitación',
                duration: '2 semanas',
                dependencies: ['task-2-2'],
                resources: ['Material de capacitación', 'Instructores'],
                cost: 6000,
                status: 'pending'
              },
              {
                id: 'task-3-2',
                name: 'Implementación del Piloto',
                description: 'Ejecutar el nuevo proceso en área piloto',
                responsible: 'Supervisor de Área',
                duration: '6 semanas',
                dependencies: ['task-3-1'],
                resources: ['Personal capacitado', 'Sistemas actualizados'],
                cost: 10000,
                status: 'pending'
              }
            ],
            deliverables: ['Personal capacitado', 'Sistema piloto funcionando', 'Métricas iniciales'],
            success_criteria: ['100% del personal capacitado', 'Piloto funcionando sin problemas']
          }
        ],
        total_duration: '18-24 semanas',
        total_cost: 36000,
        expected_improvements: {
          efficiency_gain: 25,
          cost_reduction: 20,
          satisfaction_improvement: 15,
          time_reduction: 40
        },
        risk_assessment: [
          {
            risk: 'Resistencia al cambio del personal',
            probability: 'medium',
            impact: 'high',
            mitigation: 'Programa de cambio organizacional y comunicación clara'
          },
          {
            risk: 'Falta de recursos para implementación',
            probability: 'low',
            impact: 'medium',
            mitigation: 'Plan de contingencia y gestión de recursos'
          }
        ]
      }
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta Prioridad';
      case 'medium': return 'Media Prioridad';
      case 'low': return 'Baja Prioridad';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'blocked': return 'error';
      case 'pending': return 'info';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'blocked': return 'Bloqueado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const handleViewPlan = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setPlanModalOpen(true);
  };

  const handleClosePlan = () => {
    setPlanModalOpen(false);
    setSelectedPlan(null);
  };

  const generatePDF = (plan: ActionPlan) => {
    const doc = new jsPDF();
    
    // Configuración de colores institucionales
    const primaryColor: [number, number, number] = [0, 100, 173]; // Azul BieniMedico
    const secondaryColor: [number, number, number] = [0, 150, 200];
    const accentColor: [number, number, number] = [255, 152, 0];
    
    // Encabezado con logo y título
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Plan de Acción para Mejora', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Especialidad: ${plan.specialty_name}`, 105, 30, { align: 'center' });
    doc.text(`Plan ID: ${plan.plan_id}`, 105, 38, { align: 'center' });
    
    let yPos = 60;
    
    // Descripción del Plan
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción del Plan', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitDescription = doc.splitTextToSize(plan.description, 180);
    doc.text(splitDescription, 15, yPos);
    yPos += splitDescription.length * 5 + 5;
    
    // Objetivos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Objetivos del Plan', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    plan.objectives.forEach((objective, index) => {
      const splitObjective = doc.splitTextToSize(`${index + 1}. ${objective}`, 180);
      doc.text(splitObjective, 20, yPos);
      yPos += splitObjective.length * 5 + 2;
    });
    
    yPos += 5;
    
    // Si no hay espacio suficiente, crear nueva página
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    // Fases del Plan
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fases del Plan', 15, yPos);
    yPos += 8;
    
    plan.phases.forEach((phase, phaseIndex) => {
      // Verificar si necesitamos una nueva página
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Encabezado de fase
      doc.setFillColor(...secondaryColor);
      doc.rect(15, yPos - 5, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Fase ${phaseIndex + 1}: ${phase.name}`, 20, yPos);
      yPos += 8;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Duración: ${phase.duration} | Prioridad: ${phase.priority}`, 20, yPos);
      yPos += 5;
      
      const splitPhaseDesc = doc.splitTextToSize(phase.description, 175);
      doc.text(splitPhaseDesc, 20, yPos);
      yPos += splitPhaseDesc.length * 4 + 3;
      
      // Tareas
      const taskData = phase.tasks.map(task => [
        task.name,
        task.responsible,
        task.duration,
        `$${task.cost.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Tarea', 'Responsable', 'Duración', 'Costo']],
        body: taskData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 15 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 8;
      
      // Entregables y Criterios de Éxito
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Entregables:', 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      phase.deliverables.forEach(deliverable => {
        doc.text(`• ${deliverable}`, 25, yPos);
        yPos += 4;
      });
      
      yPos += 2;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Criterios de Éxito:', 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      phase.success_criteria.forEach(criterion => {
        doc.text(`• ${criterion}`, 25, yPos);
        yPos += 4;
      });
      
      yPos += 8;
    });
    
    // Nueva página para mejoras esperadas y riesgos
    doc.addPage();
    yPos = 20;
    
    // Mejoras Esperadas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mejoras Esperadas', 15, yPos);
    yPos += 8;
    
    const improvementsData = [
      ['Ganancia de Eficiencia', `${plan.expected_improvements.efficiency_gain}%`],
      ['Reducción de Costos', `$${plan.expected_improvements.cost_reduction.toFixed(2)}`],
      ['Mejora de Satisfacción', `${plan.expected_improvements.satisfaction_improvement}%`],
      ['Reducción de Tiempo', `${plan.expected_improvements.time_reduction.toFixed(1)} min`]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Mejora Esperada']],
      body: improvementsData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Evaluación de Riesgos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Evaluación de Riesgos', 15, yPos);
    yPos += 8;
    
    plan.risk_assessment.forEach((risk, index) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${risk.risk}`, 15, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Probabilidad: ${risk.probability} | Impacto: ${risk.impact}`, 20, yPos);
      yPos += 4;
      
      const splitMitigation = doc.splitTextToSize(`Mitigación: ${risk.mitigation}`, 175);
      doc.text(splitMitigation, 20, yPos);
      yPos += splitMitigation.length * 4 + 5;
    });
    
    // Nueva página para resumen
    doc.addPage();
    yPos = 20;
    
    // Resumen General
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen del Plan', 105, 25, { align: 'center' });
    
    yPos = 50;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Duración Total:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${plan.total_duration}`, 65, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Costo Total Estimado:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`$${plan.total_cost.toFixed(2)}`, 65, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Número de Fases:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${plan.phases.length}`, 65, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total de Tareas:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const totalTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    doc.text(`${totalTasks}`, 65, yPos);
    
    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} | BieniMedico - Plan de Acción para Mejora`,
        105,
        285,
        { align: 'center' }
      );
    }
    
    // Descargar el PDF
    doc.save(`Plan_Accion_${plan.specialty_name.replace(/\s+/g, '_')}_${plan.plan_id}.pdf`);
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
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        Planes de Acción para Mejora
        <InfoTooltip
          title="Planes de Acción"
          description="Planes detallados y estructurados para implementar las mejoras identificadas en el análisis de brechas y comparación de flujos."
          calculation="Basado en análisis de brechas, mejores prácticas y recursos disponibles"
        />
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Planes estructurados para implementar las mejoras identificadas, con fases, tareas específicas y métricas de éxito.
      </Typography>

      {actionPlans.map((plan) => (
        <Accordion key={plan.plan_id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {plan.specialty_name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mr: 2 }}>
                {plan.plan_name}
              </Typography>
              <Chip
                label={`${plan.phases.length} Fases`}
                color="info"
                size="small"
                sx={{ mr: 2 }}
              />
              <Chip
                label={`${plan.total_duration}`}
                color="primary"
                size="small"
                sx={{ mr: 2 }}
              />
              <Chip
                label={`$${plan.total_cost.toLocaleString()}`}
                color="success"
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Descripción y Objetivos */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Descripción del Plan
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {plan.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Objetivos del Plan
                  </Typography>
                  <List dense>
                    {plan.objectives.map((objective, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={objective} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Resumen de Mejoras Esperadas */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Mejoras Esperadas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          +{plan.expected_improvements.efficiency_gain}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Ganancia de Eficiencia
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          -{plan.expected_improvements.cost_reduction}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Reducción de Costos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main">
                          +{plan.expected_improvements.satisfaction_improvement}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Mejora en Satisfacción
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="info.main">
                          -{plan.expected_improvements.time_reduction}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Reducción de Tiempo
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Información del Plan */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Información del Plan
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Duración Total</Typography>
                        <Typography variant="body2" color="primary">
                          {plan.total_duration}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Inversión Total</Typography>
                        <Typography variant="body2" color="success.main">
                          ${plan.total_cost.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Fases del Plan</Typography>
                        <Typography variant="body2" color="info.main">
                          {plan.phases.length}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleViewPlan(plan)}
                  >
                    Ver Plan Detallado
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => generatePDF(plan)}
                    color="error"
                  >
                    Descargar PDF
                  </Button>
                </Paper>
              </Grid>

              {/* Evaluación de Riesgos */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Evaluación de Riesgos
                  </Typography>
                  <List>
                    {plan.risk_assessment.map((risk, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={risk.risk}
                          secondary={
                            <>
                              <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                                Probabilidad: {risk.probability} | Impacto: {risk.impact}
                              </Typography>
                              <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                Mitigación: {risk.mitigation}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Modal de Plan Detallado */}
      <Dialog 
        open={planModalOpen} 
        onClose={handleClosePlan} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Typography variant="h5">
            {selectedPlan?.plan_name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {selectedPlan?.specialty_name} - {selectedPlan?.plan_id}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {selectedPlan && (
            <Box>
              {/* Descripción */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Descripción del Plan
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedPlan.description}
                </Typography>
              </Paper>

              {/* Objetivos */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Objetivos
                </Typography>
                <List>
                  {selectedPlan.objectives.map((objective, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={objective} />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Fases del Plan */}
              <Typography variant="h6" gutterBottom>
                Fases de Implementación
              </Typography>
              
              <Stepper orientation="vertical">
                {selectedPlan.phases.map((phase) => (
                  <Step key={phase.id} active>
                    <StepLabel>
                      <Typography variant="h6">
                        {phase.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duración: {phase.duration} | Prioridad: {getPriorityLabel(phase.priority)}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" paragraph>
                          {phase.description}
                        </Typography>

                        {/* Tareas */}
                        <Typography variant="subtitle1" gutterBottom>
                          Tareas:
                        </Typography>
                        <List dense>
                          {phase.tasks.map((task) => (
                            <ListItem key={task.id}>
                              <ListItemIcon>
                                <Chip
                                  label={getStatusLabel(task.status)}
                                  color={getStatusColor(task.status) as any}
                                  size="small"
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={task.name}
                                secondary={`${task.responsible} | ${task.duration} | $${task.cost}`}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {/* Entregables */}
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Entregables:
                        </Typography>
                        <List dense>
                          {phase.deliverables.map((deliverable, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Assignment color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={deliverable} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Evaluación de Riesgos */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Evaluación de Riesgos
                </Typography>
                <List>
                  {selectedPlan.risk_assessment.map((risk, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={risk.risk}
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                              Probabilidad: {risk.probability} | Impacto: {risk.impact}
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                              Mitigación: {risk.mitigation}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClosePlan} color="primary">
            Cerrar
          </Button>
          <Button variant="contained" color="primary">
            Exportar Plan
          </Button>
        </DialogActions>
      </Dialog>

      {actionPlans.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay planes de acción disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Se requieren análisis previos para generar planes de acción específicos.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ActionPlanComponent;
