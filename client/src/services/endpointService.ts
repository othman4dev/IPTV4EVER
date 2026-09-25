import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface Endpoint {
  id: number;
  playlistName: string;
  username: string;
  password: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEndpointPayload {
  username: string;
  password: string;
  url: string;
}

export type UpdateEndpointPayload = Partial<CreateEndpointPayload>;

export const getEndpoints = async (): Promise<Endpoint[]> => {
  const { data } = await axios.get(`${API_URL}/endpoints`);
  return data;
};

export const getEndpoint = async (id: number): Promise<Endpoint> => {
  const { data } = await axios.get(`${API_URL}/endpoints/${id}`);
  return data;
};

export const createEndpoint = async (
  payload: CreateEndpointPayload,
): Promise<Endpoint> => {
  const { data } = await axios.post(`${API_URL}/endpoints`, payload);
  return data;
};

export const updateEndpoint = async (
  id: number,
  payload: UpdateEndpointPayload,
): Promise<Endpoint> => {
  const { data } = await axios.put(`${API_URL}/endpoints/${id}`, payload);
  return data;
};

export const deleteEndpoint = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/endpoints/${id}`);
};
