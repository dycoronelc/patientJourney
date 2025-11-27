export const dashboardService = {
  getDashboardData: async (timeRange: string) => {
    // Simular datos para desarrollo
    return {
      metrics: {
        totalPatients: 150,
        averageWaitTime: 15,
        resourceUtilization: { doctors: 85, nurses: 92 },
        costPerPatient: 120.50,
        patientSatisfaction: 4.2
      }
    };
  },

  getAlerts: async () => {
    // Simular alertas para desarrollo
    return [
      {
        id: '1',
        type: 'warning',
        title: 'Alta utilización de recursos',
        message: 'Los doctores están al 85% de capacidad',
        timestamp: new Date(),
        severity: 'medium'
      },
      {
        id: '2',
        type: 'info',
        title: 'Mantenimiento programado',
        message: 'El ecógrafo estará en mantenimiento mañana',
        timestamp: new Date(),
        severity: 'low'
      }
    ];
  }
};
