import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Timeline,
  ShowChart,
  PieChart,
  BarChart,
  CompareArrows,
  Assessment,
  Assignment,
} from '@mui/icons-material';
import FlowComparison from '../../components/Visualization/FlowComparison';
import GapAnalysis from '../../components/Visualization/GapAnalysis';
import ActionPlan from '../../components/Visualization/ActionPlan';
import FlowVisualization from '../../components/Visualization/FlowVisualization';

const Visualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`visualization-tabpanel-${index}`}
        aria-labelledby={`visualization-tab-${index}`}
      >
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Análisis de Flujos y Mejoras
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Herramientas avanzadas para comparar flujos ideales vs reales, identificar brechas y generar planes de mejora específicos.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="visualization tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<CompareArrows />}
            label="Comparación de Flujos"
            id="visualization-tab-0"
            aria-controls="visualization-tabpanel-0"
          />
          <Tab
            icon={<Assessment />}
            label="Análisis de Brechas"
            id="visualization-tab-1"
            aria-controls="visualization-tabpanel-1"
          />
          <Tab
            icon={<Assignment />}
            label="Planes de Acción"
            id="visualization-tab-2"
            aria-controls="visualization-tabpanel-2"
          />
          <Tab
            icon={<Timeline />}
            label="Visualizaciones"
            id="visualization-tab-3"
            aria-controls="visualization-tabpanel-3"
          />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <FlowComparison />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <GapAnalysis />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ActionPlan />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <FlowVisualization />
      </TabPanel>
    </Box>
  );
};

export default Visualization;










