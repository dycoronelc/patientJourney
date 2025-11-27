import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import {
  LocalHospital,
  Settings,
  Build,
  Timeline,
  PlayArrow,
} from '@mui/icons-material';

// Componentes de configuración
import SpecialtiesConfig from './components/SpecialtiesConfig';
import HealthCentersConfig from './components/HealthCentersConfig';
import ResourcesConfig from './components/ResourcesConfig';
import PatientFlowsConfig from './components/PatientFlowsConfig';
import FlowManagement from './components/FlowManagement';
import StepsConfig from './components/StepsConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Configuration: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Configure las especialidades médicas, centros de salud, recursos y flujos de pacientes.
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="configuración tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<LocalHospital />}
            label="Especialidades"
            id="config-tab-0"
            aria-controls="config-tabpanel-0"
          />
          <Tab
            icon={<Settings />}
            label="Centros de Salud"
            id="config-tab-1"
            aria-controls="config-tabpanel-1"
          />
          <Tab
            icon={<Build />}
            label="Recursos"
            id="config-tab-2"
            aria-controls="config-tabpanel-2"
          />
          <Tab
            icon={<PlayArrow />}
            label="Pasos"
            id="config-tab-3"
            aria-controls="config-tabpanel-3"
          />
          <Tab
            icon={<Timeline />}
            label="Gestión de Flujos"
            id="config-tab-4"
            aria-controls="config-tabpanel-4"
          />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <SpecialtiesConfig />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <HealthCentersConfig />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ResourcesConfig />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <StepsConfig />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <FlowManagement />
      </TabPanel>
    </Box>
  );
};

export default Configuration;


