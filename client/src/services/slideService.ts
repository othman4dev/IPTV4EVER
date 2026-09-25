import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  background: string;
  textColor: string;
  backgroundDim: number;
  hasTextBorder: boolean;
  textBorderColor?: string;
  bgImage?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlidePayload {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  background?: string;
  textColor?: string;
  backgroundDim?: number;
  hasTextBorder?: boolean;
  textBorderColor?: string;
  bgImage?: string;
  order?: number;
  isActive?: boolean;
}

export type UpdateSlidePayload = Partial<CreateSlidePayload>;

export const getSlides = async (): Promise<Slide[]> => {
  const { data } = await axios.get(`${API_URL}/slides`);
  return data;
};

export const getActiveSlides = async (): Promise<Slide[]> => {
  const { data } = await axios.get(`${API_URL}/slides/active`);
  return data;
};

export const getSlide = async (id: number): Promise<Slide> => {
  const { data } = await axios.get(`${API_URL}/slides/${id}`);
  return data;
};

export const createSlide = async (
  payload: CreateSlidePayload,
): Promise<Slide> => {
  const { data } = await axios.post(`${API_URL}/slides`, payload);
  return data;
};

export const updateSlide = async (
  id: number,
  payload: UpdateSlidePayload,
): Promise<Slide> => {
  const { data } = await axios.put(`${API_URL}/slides/${id}`, payload);
  return data;
};

export const deleteSlide = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/slides/${id}`);
};
