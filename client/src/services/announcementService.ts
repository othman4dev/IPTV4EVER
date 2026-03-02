import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface Announcement {
  id: number;
  icon: string;
  text: string;
  order: number;
  isActive: boolean;
}

export interface CreateAnnouncementPayload {
  icon: string;
  text: string;
  order?: number;
  isActive?: boolean;
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const { data } = await axios.get(`${API_URL}/announcements`);
  return data;
};

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const { data } = await axios.get(`${API_URL}/announcements/active`);
  return data;
};

export const getAnnouncement = async (id: number): Promise<Announcement> => {
  const { data } = await axios.get(`${API_URL}/announcements/${id}`);
  return data;
};

export const createAnnouncement = async (
  payload: CreateAnnouncementPayload,
): Promise<Announcement> => {
  const { data } = await axios.post(`${API_URL}/announcements`, payload);
  return data;
};

export const updateAnnouncement = async (
  id: number,
  payload: UpdateAnnouncementPayload,
): Promise<Announcement> => {
  const { data } = await axios.put(`${API_URL}/announcements/${id}`, payload);
  return data;
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/announcements/${id}`);
};
