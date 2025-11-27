import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface ClienteCorporativo {
  id: number;
  nombre: string;
  direccion: string;
  imagen_url: string;
  estado: number;
  idcentro: number;
}

export interface Area {
  id: number;
  nombre: string;
  icon_active: string;
  icon_color: string;
  estado: number;
  idcentro: number;
}

export interface Doctor {
  id: number;
  primernombre: string;
  segundonombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  nombre_completo: string;
  foto: string;
}

export const bienimedFilterService = {
  // Obtener clientes corporativos
  getClientes: async (idcliente: number = 1): Promise<ClienteCorporativo[]> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/clientes?idcliente=${idcliente}`);
    return response.data;
  },

  // Obtener áreas médicas
  getAreas: async (idcentro: number = 1): Promise<Area[]> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/areas?idcentro=${idcentro}`);
    return response.data;
  },

  // Obtener doctores
  getDoctores: async (idcentro: number = 1): Promise<Doctor[]> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/doctores?idcentro=${idcentro}`);
    return response.data;
  },

  // Obtener cliente por ID
  getClienteById: async (clienteId: number): Promise<ClienteCorporativo> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/clientes/${clienteId}`);
    return response.data;
  },

  // Obtener área por ID
  getAreaById: async (areaId: number): Promise<Area> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/areas/${areaId}`);
    return response.data;
  },

  // Obtener doctor por ID
  getDoctorById: async (doctorId: number): Promise<Doctor> => {
    const response = await axios.get(`${API_URL}/api/v1/bienimed/filters/doctores/${doctorId}`);
    return response.data;
  },
};
