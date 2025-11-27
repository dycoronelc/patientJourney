import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Timeline,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Componentes
import FlowEditor from '../../../components/PatientFlow/FlowEditor';

// Servicios
import { patientFlowService, PatientFlow } from '../../../services/patientFlowService';
import { formatNumber, formatCurrency, formatDuration } from '../../../utils/numberFormatter';

const FlowManagement: React.FC = () => {
  const [flows, setFlows] = useState<PatientFlow[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<PatientFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar flujos desde la API
  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientFlowService.getAll({ is_active: true });
      setFlows(data);
    } catch (err: any) {
      console.error('Error loading flows:', err);
      setError('Error al cargar los flujos');
      toast.error('Error al cargar los flujos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingFlow(null);
    setEditorOpen(true);
  };

  const handleEdit = (flow: PatientFlow) => {
    setEditingFlow(flow);
    setEditorOpen(true);
  };

  const handleDelete = async (flowId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este flujo?')) {
      try {
        await patientFlowService.delete(flowId);
        await loadFlows();
        toast.success('Flujo eliminado exitosamente');
      } catch (err) {
        console.error('Error deleting flow:', err);
        toast.error('Error al eliminar el flujo');
      }
    }
  };

  const handleDuplicate = async (flow: PatientFlow) => {
    try {
      await patientFlowService.duplicate(flow.id, `${flow.name} (Copia)`);
      await loadFlows();
      toast.success('Flujo duplicado exitosamente');
    } catch (err) {
      console.error('Error duplicating flow:', err);
      toast.error('Error al duplicar el flujo');
    }
  };

  const handleSaveFlow = async (flowData: any) => {
    try {
      if (editingFlow) {
        // Actualizar flujo existente
        await patientFlowService.update(editingFlow.id, {
          name: flowData.name,
          description: flowData.description,
          nodes: flowData.nodes,
          edges: flowData.edges,
          estimatedCost: flowData.estimatedCost,
          estimatedDuration: flowData.estimatedDuration,
        });
        toast.success('Flujo actualizado exitosamente');
      } else {
        // Crear nuevo flujo
        await patientFlowService.create({
          name: flowData.name,
          description: flowData.description,
          nodes: flowData.nodes,
          edges: flowData.edges,
          estimatedCost: flowData.estimatedCost,
          estimatedDuration: flowData.estimatedDuration,
          isActive: true,
        });
        toast.success('Flujo creado exitosamente');
      }
      await loadFlows();
      setEditorOpen(false);
    } catch (err) {
      console.error('Error saving flow:', err);
      toast.error('Error al guardar el flujo');
    }
  };

  const getSpecialtyColor = (specialty?: string) => {
    if (!specialty) return 'default';
    switch (specialty) {
      case 'Cardiología': return 'primary';
      case 'Endocrinología': return 'secondary';
      case 'Geriatría': return 'warning';
      case 'Medicina General': return 'info';
      default: return 'default';
    }
  };

  // Función para determinar el tipo de flujo
  const getFlowType = (flow: PatientFlow): 'normalized' | 'bienimed' => {
    return flow.id.startsWith('flow-') ? 'normalized' : 'bienimed';
  };

  // Función para obtener el color del chip de tipo
  const getFlowTypeColor = (flowType: 'normalized' | 'bienimed') => {
    return flowType === 'normalized' ? 'success' : 'info';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestión de Flujos de Pacientes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadFlows}
            disabled={loading}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateNew}
          >
            Crear Nuevo Flujo
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Los flujos definen el recorrido estándar que sigue un paciente en cada especialidad.
        Puedes crear flujos personalizados o usar las plantillas predefinidas.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1 }}>
          Tipos de Flujos:
        </Typography>
        <Chip 
          label={`Normalizados (${flows.filter(f => getFlowType(f) === 'normalized').length})`} 
          color="success" 
          variant="outlined" 
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
        <Chip 
          label={`Bienimed (${flows.filter(f => getFlowType(f) === 'bienimed').length})`} 
          color="info" 
          variant="outlined" 
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center', ml: 1 }}>
          Los flujos normalizados tienen estructura completa según mejores prácticas médicas
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : flows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay flujos creados. Haz clic en "Crear Nuevo Flujo" para comenzar.
        </Alert>
      ) : null}

      {!loading && flows.length > 0 && (

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Flujo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell align="center">Pasos</TableCell>
              <TableCell align="right">Costo Estimado</TableCell>
              <TableCell align="right">Duración</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flows.map((flow) => {
              const flowType = getFlowType(flow);
              return (
                <TableRow key={flow.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {flow.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {flow.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={flowType === 'normalized' ? 'Normalizado' : 'Bienimed'}
                      color={getFlowTypeColor(flowType) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                <TableCell>
                  {flow.specialtyName ? (
                    <Chip
                      label={flow.specialtyName}
                      color={getSpecialtyColor(flow.specialtyName) as any}
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Sin especialidad"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={flow.nodes?.length || 0} 
                    size="small" 
                    color={flow.nodes?.length ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatCurrency(flow.estimatedCost)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {formatDuration(flow.averageDuration)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={flow.isActive ? 'Activo' : 'Inactivo'}
                    color={flow.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" title="Ver flujo">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEdit(flow)} title="Editar">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDuplicate(flow)} title="Duplicar">
                    <ContentCopy />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(flow.id)} title="Eliminar" color="error">
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

      {/* Dialog con editor de flujos */}
      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          {editingFlow ? 'Editar Flujo' : 'Crear Nuevo Flujo'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <FlowEditor
            flowId={editingFlow?.id}
            onSave={handleSaveFlow}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlowManagement;


