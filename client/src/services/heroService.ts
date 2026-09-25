import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export type HeroMediaType = "image" | "video";

export interface HeroSectionEntry {
  id: number;
  titleLine1Prefix: string;
  titleLine1Highlight: string;
  titleLine1Suffix: string;
  titleLine2Prefix: string;
  titleLine2Highlight: string;
  titleLine2Suffix: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  mediaType: HeroMediaType;
  mediaPath: string;
  order: number;
  isActive: boolean;
  heroStyle: string;
  textMode: "difference" | "solid";
  textColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeroSectionPayload {
  titleLine1Prefix: string;
  titleLine1Highlight: string;
  titleLine1Suffix: string;
  titleLine2Prefix: string;
  titleLine2Highlight: string;
  titleLine2Suffix: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  mediaType: HeroMediaType;
  mediaPath: string;
  order?: number;
  isActive?: boolean;
  heroStyle?: string;
  textMode?: "difference" | "solid";
  textColor?: string;
}

export type UpdateHeroSectionPayload = Partial<CreateHeroSectionPayload>;

export const getHeroEntries = async (): Promise<HeroSectionEntry[]> => {
  const { data } = await axios.get(`${API_URL}/heroes`);
  return data;
};

export const getActiveHeroEntries = async (): Promise<HeroSectionEntry[]> => {
  const { data } = await axios.get(`${API_URL}/heroes/active`);
  return data;
};

export const getHeroEntry = async (id: number): Promise<HeroSectionEntry> => {
  const { data } = await axios.get(`${API_URL}/heroes/${id}`);
  return data;
};

export const createHeroEntry = async (
  payload: CreateHeroSectionPayload,
): Promise<HeroSectionEntry> => {
  const { data } = await axios.post(`${API_URL}/heroes`, payload);
  return data;
};

export const updateHeroEntry = async (
  id: number,
  payload: UpdateHeroSectionPayload,
): Promise<HeroSectionEntry> => {
  const { data } = await axios.put(`${API_URL}/heroes/${id}`, payload);
  return data;
};

export const deleteHeroEntry = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/heroes/${id}`);
};
