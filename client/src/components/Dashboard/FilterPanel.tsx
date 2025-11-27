import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business,
  LocalHospital,
  Person,
  Clear,
} from '@mui/icons-material';
import { bienimedFilterService, ClienteCorporativo, Area, Doctor } from '../../services/bienimedFilterService';

interface FilterPanelProps {
  onFiltersChange: (filters: {
    cliente?: ClienteCorporativo;
    area?: Area;
    doctor?: Doctor;
  }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const [clientes, setClientes] = useState<ClienteCorporativo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteCorporativo | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoading(true);
        const [clientesData, areasData, doctoresData] = await Promise.all([
          bienimedFilterService.getClientes(),
          bienimedFilterService.getAreas(),
          bienimedFilterService.getDoctores(),
        ]);
        
        setClientes(clientesData);
        setAreas(areasData);
        setDoctores(doctoresData);
      } catch (error) {
        console.error('Error loading filters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    onFiltersChange({
      cliente: selectedCliente || undefined,
      area: selectedArea || undefined,
      doctor: selectedDoctor || undefined,
    });
  }, [selectedCliente, selectedArea, selectedDoctor, onFiltersChange]);

  const handleClearFilters = () => {
    setSelectedCliente(null);
    setSelectedArea(null);
    setSelectedDoctor(null);
  };

  const hasActiveFilters = selectedCliente || selectedArea || selectedDoctor;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Cargando filtros...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      backgroundColor: '#ffffff',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f0f0f0',
      mb: 3,
      width: '100%',
    }}>
      {/* Filtros en línea horizontal como BieniMedico */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        width: '100%',
      }}>
        {/* Filtro Cliente */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="cliente-label">Cliente</InputLabel>
          <Select
            labelId="cliente-label"
            value={selectedCliente?.id || ''}
            label="Cliente"
            onChange={(e) => {
              const cliente = clientes.find(c => c.id === e.target.value);
              setSelectedCliente(cliente || null);
            }}
            startAdornment={<Business sx={{ mr: 1, color: '#7367f0' }} />}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <MenuItem value="">
              <em>Todos los clientes</em>
            </MenuItem>
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business sx={{ color: '#7367f0', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cliente.nombre}
                    </Typography>
                    {cliente.direccion && (
                      <Typography variant="caption" sx={{ color: '#6e6b7b' }}>
                        {cliente.direccion}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro Área */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="area-label">Área</InputLabel>
          <Select
            labelId="area-label"
            value={selectedArea?.id || ''}
            label="Área"
            onChange={(e) => {
              const area = areas.find(a => a.id === e.target.value);
              setSelectedArea(area || null);
            }}
            startAdornment={<LocalHospital sx={{ mr: 1, color: '#7367f0' }} />}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <MenuItem value="">
              <em>Todas las áreas</em>
            </MenuItem>
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospital sx={{ color: area.icon_color || '#7367f0', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {area.nombre}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro Doctor */}
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id="doctor-label">Doctor</InputLabel>
          <Select
            labelId="doctor-label"
            value={selectedDoctor?.id || ''}
            label="Doctor"
            onChange={(e) => {
              const doctor = doctores.find(d => d.id === e.target.value);
              setSelectedDoctor(doctor || null);
            }}
            startAdornment={<Person sx={{ mr: 1, color: '#7367f0' }} />}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <MenuItem value="">
              <em>Todos los doctores</em>
            </MenuItem>
            {doctores.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: '#7367f0', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {doctor.nombre_completo}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default FilterPanel;
