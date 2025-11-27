import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Science,
  Person,
  Assignment,
  LocalHospital,
  CheckCircle,
  Medication,
  Build,
} from '@mui/icons-material';
import { stepService } from '../../../services/stepService';
import { formatCurrency, formatDuration } from '../../../utils/numberFormatter';

interface Step {
  id: string;
  name: string;
  description?: string;
  step_type: string;
  base_cost: number;
  cost_unit: string;
  duration_minutes?: number;
  icon?: string;
  color: string;
  is_active: boolean;
  category?: string;
  tags: string[];
}

const StepsConfig: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [formData, setFormData] = useState<Partial<Step>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stepTypes = [
    { value: 'consultation', label: 'Consulta', icon: Person },
    { value: 'laboratory', label: 'Laboratorio', icon: Science },
    { value: 'imaging', label: 'Imágenes', icon: Assignment },
    { value: 'referral', label: 'Referencia', icon: LocalHospital },
    { value: 'discharge', label: 'Alta', icon: CheckCircle },
    { value: 'procedure', label: 'Procedimiento', icon: Build },
    { value: 'medication', label: 'Medicación', icon: Medication },
  ];

  const categories = [
    'Consulta',
    'Laboratorio', 
    'Imágenes',
    'Referencia',
    'Alta',
    'Procedimiento',
    'Medicación'
  ];

  const iconOptions = [
    { value: 'Person', label: 'Persona', icon: Person },
    { value: 'Science', label: 'Ciencia/Lab', icon: Science },
    { value: 'Assignment', label: 'Documento', icon: Assignment },
    { value: 'LocalHospital', label: 'Hospital', icon: LocalHospital },
    { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
    { value: 'Medication', label: 'Medicina', icon: Medication },
    { value: 'Build', label: 'Herramientas', icon: Build },
  ];

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const data = await stepService.getSteps();
      setSteps(data);
    } catch (error) {
      setError('Error al cargar los pasos');
      console.error('Error loading steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (step?: Step) => {
    if (step) {
      setEditingStep(step);
      setFormData(step);
    } else {
      setEditingStep(null);
      setFormData({
        name: '',
        description: '',
        step_type: 'consultation',
        base_cost: 0,
        cost_unit: 'USD',
        duration_minutes: 0,
        icon: 'Person',
        color: '#1976d2',
        is_active: true,
        category: '',
        tags: [],
      });
    }
    setDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStep(null);
    setFormData({});
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      if (!formData.name || !formData.step_type) {
        setError('Nombre y tipo son requeridos');
        return;
      }

      if (editingStep) {
        await stepService.updateStep(editingStep.id, formData);
        setSuccess('Paso actualizado exitosamente');
      } else {
        // Asegurar que formData tenga los campos requeridos
        if (!formData.name || !formData.step_type) {
          setError('Nombre y tipo son requeridos');
          return;
        }
        
        const createData = {
          name: formData.name,
          description: formData.description,
          step_type: formData.step_type,
          base_cost: formData.base_cost || 0,
          cost_unit: formData.cost_unit || 'USD',
          duration_minutes: formData.duration_minutes,
          icon: formData.icon,
          color: formData.color || '#1976d2',
          is_active: formData.is_active !== undefined ? formData.is_active : true,
          category: formData.category,
          tags: formData.tags || [],
        };
        
        await stepService.createStep(createData);
        setSuccess('Paso creado exitosamente');
      }

      await loadSteps();
      handleCloseDialog();
    } catch (error) {
      setError('Error al guardar el paso');
      console.error('Error saving step:', error);
    }
  };

  const handleDelete = async (stepId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paso?')) {
      try {
        await stepService.deleteStep(stepId);
        setSuccess('Paso eliminado exitosamente');
        await loadSteps();
      } catch (error) {
        setError('Error al eliminar el paso');
        console.error('Error deleting step:', error);
      }
    }
  };

  const getStepTypeIcon = (stepType: string) => {
    const typeConfig = stepTypes.find(type => type.value === stepType);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent />;
    }
    return <Person />;
  };

  const getStepTypeLabel = (stepType: string) => {
    const typeConfig = stepTypes.find(type => type.value === stepType);
    return typeConfig ? typeConfig.label : stepType;
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = iconOptions.find(icon => icon.value === iconName);
    if (iconConfig) {
      const IconComponent = iconConfig.icon;
      return <IconComponent />;
    }
    return <Person />;
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const handleInitializeDefaults = async () => {
    try {
      setLoading(true);
      await stepService.initializeDefaults();
      setSuccess('Pasos por defecto inicializados exitosamente');
      await loadSteps();
    } catch (error) {
      setError('Error al inicializar pasos por defecto');
      console.error('Error initializing defaults:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Gestión de Pasos
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleInitializeDefaults}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Inicializar Por Defecto
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Crear Paso
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Icono</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Costo</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {steps.map((step) => (
                  <TableRow key={step.id}>
                    <TableCell>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: step.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {getIconComponent(step.icon || 'Person')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {step.name}
                      </Typography>
                      {step.description && (
                        <Typography variant="caption" color="textSecondary">
                          {step.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStepTypeIcon(step.step_type)}
                        label={getStepTypeLabel(step.step_type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {step.category && (
                        <Chip label={step.category} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {step.cost_unit} {formatCurrency(step.base_cost)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {step.duration_minutes && (
                        <Typography variant="body2">
                          {formatDuration(step.duration_minutes)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={step.is_active ? 'Activo' : 'Inactivo'}
                        color={step.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {step.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(step)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(step.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar paso */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStep ? 'Editar Paso' : 'Crear Nuevo Paso'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Paso"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Paso</InputLabel>
                <Select
                  value={formData.step_type || ''}
                  onChange={(e) => setFormData({ ...formData, step_type: e.target.value })}
                  label="Tipo de Paso"
                >
                  {stepTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center">
                        <type.icon sx={{ mr: 1 }} />
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Costo Base"
                type="number"
                value={formData.base_cost || 0}
                onChange={(e) => setFormData({ ...formData, base_cost: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duración (minutos)"
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || undefined })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Categoría"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Icono</InputLabel>
                <Select
                  value={formData.icon || 'Person'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  label="Icono"
                >
                  {iconOptions.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box display="flex" alignItems="center">
                        <icon.icon sx={{ mr: 1 }} />
                        {icon.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color (hex)"
                value={formData.color || '#1976d2'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#1976d2"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (separados por comas)"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="consulta, general, evaluacion"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingStep ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepsConfig;
