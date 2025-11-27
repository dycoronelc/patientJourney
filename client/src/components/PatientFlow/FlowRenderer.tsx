/**
 * Componente Universal para Renderizar Flujos
 * 
 * Este componente es reutilizable para mostrar cualquier tipo de flujo:
 * - Flujos Normalizados
 * - Flujos Bienimed
 * - Flujos de otros prestadores de salud
 * 
 * Se usa tanto en PatientFlowDiagram como en FlowEditor
 */

import React from 'react';
import { Node, Edge } from 'react-flow-renderer';
import { Box, Typography, Chip } from '@mui/material';
import {
  MedicalServices,
  Science,
  CameraAlt,
  Psychology,
  Medication,
  ArrowForward,
  Schedule,
  MedicalInformation,
  Warning,
  ExitToApp,
} from '@mui/icons-material';
import { medicalFlowService, Flow, FlowNode } from '../../services/medicalFlowService';

/**
 * Configuración del renderizador
 */
interface FlowRendererConfig {
  stepHeight?: number;        // Altura entre pasos (default: 180)
  nodeWidth?: number;          // Ancho de nodos (default: 200)
  startY?: number;             // Posición Y inicial (default: 0)
  startX?: number;             // Posición X (default: 300)
  showStartNode?: boolean;     // Mostrar nodo de inicio (default: true)
  showEndNode?: boolean;       // Mostrar nodo de finalización (default: true)
}

const defaultConfig: FlowRendererConfig = {
  stepHeight: 180,
  nodeWidth: 200,
  startY: 0,
  startX: 300,
  showStartNode: true,
  showEndNode: true,
};

/**
 * Obtener icono según tipo de paso
 */
const getStepIcon = (stepTypeCode: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    // Códigos normalizados
    'st-cons': <MedicalServices sx={{ fontSize: 40 }} />,           // Consulta
    'st-lab': <Science sx={{ fontSize: 40 }} />,                    // Laboratorio
    'st-img': <CameraAlt sx={{ fontSize: 40 }} />,                  // Imagenología
    'st-dx': <Psychology sx={{ fontSize: 40 }} />,                  // Diagnóstico
    'st-rx': <Medication sx={{ fontSize: 40 }} />,                  // Tratamiento/Prescripción
    'st-ref': <ArrowForward sx={{ fontSize: 40 }} />,               // Referencia
    'st-fu': <Schedule sx={{ fontSize: 40 }} />,                    // Seguimiento
    'st-proc': <MedicalInformation sx={{ fontSize: 40 }} />,        // Procedimiento
    'st-emergency': <Warning sx={{ fontSize: 40 }} />,              // Emergencia
    'st-discharge': <ExitToApp sx={{ fontSize: 40 }} />,            // Alta
    
    // Códigos legacy (compatibilidad)
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

/**
 * Clase FlowRenderer - Lógica universal para renderizar flujos
 */
export class FlowRenderer {
  private config: FlowRendererConfig;

  constructor(config?: Partial<FlowRendererConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Generar nodos ReactFlow desde un Flow
   */
  public generateNodes(flow: Flow): Node[] {
    const nodes: Node[] = [];
    const { stepHeight, nodeWidth, startY, startX, showStartNode, showEndNode } = this.config;

    // Validar que el flujo tenga nodos
    if (!flow.nodes || !Array.isArray(flow.nodes) || flow.nodes.length === 0) {
      return this.generateEmptyFlowNode(flow);
    }

    // Ordenar nodos por orderIndex para visualización consistente
    const sortedNodes = this.sortNodes(flow.nodes);

    // Nodo inicial
    if (showStartNode) {
      nodes.push(this.createStartNode(flow, startX!, startY!));
    }

    // Nodos de pasos del flujo
    sortedNodes.forEach((node, sequentialIndex) => {
      const stepColor = medicalFlowService.getStepTypeColor(node.stepTypeId);
      const offset = showStartNode ? 1 : 0;
      
      // IMPORTANTE: Calcular posición Y secuencial, ignorando node.position de la BD
      const calculatedPosition = { 
        x: startX!, 
        y: startY! + (sequentialIndex + offset) * stepHeight!
      };
      
      nodes.push({
        id: node.id,
        data: {
          label: this.createNodeLabel(node, stepColor),
        },
        // FORZAR posición calculada, nunca usar node.position de la BD
        position: calculatedPosition,
        // Deshabilitar arrastre completamente para este nodo
        draggable: false,
        // Marcar como posicionado para que ReactFlow no lo mueva
        positionAbsolute: calculatedPosition,
        style: {
          background: '#fff',
          border: `2px solid ${stepColor}`,
          borderRadius: 10,
          padding: 0,
          width: nodeWidth,
        },
      });
    });

    // Nodo final
    if (showEndNode) {
      const finalPosition = sortedNodes.length + (showStartNode ? 1 : 0);
      nodes.push(this.createEndNode(flow, startX!, startY! + finalPosition * stepHeight!));
    }

    return nodes;
  }

  /**
   * Generar edges ReactFlow desde un Flow
   */
  public generateEdges(flow: Flow): Edge[] {
    const edges: Edge[] = [];
    const { showStartNode, showEndNode } = this.config;

    if (!flow.nodes || !Array.isArray(flow.nodes) || flow.nodes.length === 0) {
      return edges;
    }

    // Ordenar nodos
    const sortedNodes = this.sortNodes(flow.nodes);

    // Edge desde start al primer nodo
    if (showStartNode && sortedNodes.length > 0) {
      edges.push({
        id: 'e-start-first',
        source: 'start',
        target: sortedNodes[0].id,
        type: 'default',
        animated: false,
        style: { stroke: '#1976d2', strokeWidth: 2 },
      });
    }

    // Edges entre nodos consecutivos
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      edges.push({
        id: `e-${sortedNodes[i].id}-${sortedNodes[i + 1].id}`,
        source: sortedNodes[i].id,
        target: sortedNodes[i + 1].id,
        type: 'default',
        animated: false,
        style: { stroke: '#666', strokeWidth: 2 },
      });
    }

    // Edge desde el último nodo al end
    if (showEndNode && sortedNodes.length > 0) {
      edges.push({
        id: 'e-last-end',
        source: sortedNodes[sortedNodes.length - 1].id,
        target: 'end',
        type: 'default',
        animated: false,
        style: { stroke: '#4caf50', strokeWidth: 2 },
      });
    }

    return edges;
  }

  /**
   * Ordenar nodos por orderIndex
   */
  private sortNodes(nodes: FlowNode[]): FlowNode[] {
    return [...nodes].sort((a, b) => {
      const orderA = a.orderIndex !== undefined ? a.orderIndex : 0;
      const orderB = b.orderIndex !== undefined ? b.orderIndex : 0;
      return orderA - orderB;
    });
  }

  /**
   * Crear nodo de inicio
   */
  private createStartNode(flow: Flow, x: number, y: number): Node {
    const position = { x, y };
    return {
      id: 'start',
      type: 'input',
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <MedicalServices sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight="bold">
              Inicio
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {flow.name}
            </Typography>
            {flow.specialtyName && (
              <Chip 
                label={flow.specialtyName} 
                size="small" 
                color="primary" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        ),
      },
      position: position,
      draggable: false,
      positionAbsolute: position,
      style: {
        background: '#fff',
        border: '2px solid #1976d2',
        borderRadius: 10,
        padding: 0,
        width: this.config.nodeWidth,
      },
    };
  }

  /**
   * Crear nodo de finalización
   */
  private createEndNode(flow: Flow, x: number, y: number): Node {
    const position = { x, y };
    return {
      id: 'end',
      type: 'output',
      data: {
        label: (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <ExitToApp sx={{ fontSize: 40, color: 'success.main' }} />
            <Typography variant="body2" fontWeight="bold">
              Finalización
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Flujo completado
            </Typography>
            {flow.estimatedCost && (
              <Chip 
                label={`Total: ${medicalFlowService.formatCost(flow.estimatedCost)}`} 
                size="small" 
                color="success" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        ),
      },
      position: position,
      draggable: false,
      positionAbsolute: position,
      style: {
        background: '#fff',
        border: '2px solid #4caf50',
        borderRadius: 10,
        padding: 0,
        width: this.config.nodeWidth,
      },
    };
  }

  /**
   * Crear etiqueta para un nodo de paso
   */
  private createNodeLabel(node: FlowNode, stepColor: string): JSX.Element {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {getStepIcon(node.stepTypeId)}
        <Typography variant="body2" fontWeight="bold">
          {node.label}
        </Typography>
        {node.description && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            {node.description}
          </Typography>
        )}
        {node.durationMinutes && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            Duración: {medicalFlowService.formatDuration(Number(node.durationMinutes))}
          </Typography>
        )}
        {node.costAvg && (
          <Chip 
            label={medicalFlowService.formatCost(Number(node.costAvg))} 
            size="small" 
            sx={{ 
              mt: 1, 
              backgroundColor: stepColor, 
              color: 'white' 
            }} 
          />
        )}
      </Box>
    );
  }

  /**
   * Generar nodo informativo para flujos sin estructura
   */
  private generateEmptyFlowNode(flow: Flow): Node[] {
    const isBienimedFlow = !flow.id.startsWith('flow-');
    
    return [{
      id: 'no-nodes',
      type: 'default',
      data: {
        label: (
          <Box sx={{ p: 3, textAlign: 'center', minWidth: 250 }}>
            {isBienimedFlow ? (
              <MedicalServices sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            ) : (
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            )}
            <Typography variant="body2" fontWeight="bold" color={isBienimedFlow ? 'info.main' : 'warning.main'}>
              {isBienimedFlow ? 'Flujo Bienimed' : 'Flujo sin estructura'}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {flow.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {isBienimedFlow 
                ? 'Flujo generado automáticamente desde datos de Bienimed'
                : 'Este flujo no tiene pasos definidos'
              }
            </Typography>
            {isBienimedFlow && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label="Datos Bienimed" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </Box>
        ),
      },
      position: { x: this.config.startX!, y: 200 },
      style: {
        background: '#fff',
        border: isBienimedFlow ? '2px dashed #2196f3' : '2px dashed #ff9800',
        borderRadius: 10,
        padding: 0,
      },
    }];
  }
}

/**
 * Export por defecto para uso directo
 */
export default FlowRenderer;

