import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface PageSectionConfig {
  id: number;
  page: string;
  sectionKey: string;
  label: string;
  icon: string;
  isVisible: boolean;
  order: number;
  variant: string;
  config?: string; // JSON string, e.g. '{"bgColor":"#000","textColor":"#fff"}'
}

export interface PageSectionUpdateItem {
  sectionKey: string;
  isVisible: boolean;
  order: number;
  variant?: string;
  config?: string;
}

export const getHomeSections = async (): Promise<PageSectionConfig[]> => {
  const { data } = await axios.get(`${API_URL}/page-layout/home`);
  return data;
};

export const updateHomeSections = async (
  sections: PageSectionUpdateItem[],
): Promise<PageSectionConfig[]> => {
  const { data } = await axios.put(`${API_URL}/page-layout/home`, { sections });
  return data;
};

export const getSectionConfig = async (
  sectionKey: string,
): Promise<PageSectionConfig | null> => {
  const { data } = await axios.get(
    `${API_URL}/page-layout/home/section/${sectionKey}`,
  );
  return data ?? null;
};

export const patchSectionConfig = async (
  sectionKey: string,
  patch: { config?: string; variant?: string },
): Promise<PageSectionConfig> => {
  const { data } = await axios.patch(
    `${API_URL}/page-layout/home/section/${sectionKey}`,
    patch,
  );
  return data;
};
