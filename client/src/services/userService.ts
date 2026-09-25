import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface SubscriptionSummary {
  id: number;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  pricePaid: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "admin" | "client";
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  subscription: SubscriptionSummary | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "admin" | "client";
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: "admin" | "client";
  isBanned?: boolean;
}

const headers = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axios.get(`${API_URL}/users`, { headers: headers() });
  return data;
};

export const getUser = async (id: string): Promise<User> => {
  const { data } = await axios.get(`${API_URL}/users/${id}`, {
    headers: headers(),
  });
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await axios.post(`${API_URL}/users`, payload, {
    headers: headers(),
  });
  return data;
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  const { data } = await axios.patch(`${API_URL}/users/${id}`, payload, {
    headers: headers(),
  });
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/users/${id}`, { headers: headers() });
};

export const banUser = async (id: string): Promise<User> => {
  const { data } = await axios.patch(
    `${API_URL}/users/${id}/ban`,
    {},
    { headers: headers() },
  );
  return data;
};

export const unbanUser = async (id: string): Promise<User> => {
  const { data } = await axios.patch(
    `${API_URL}/users/${id}/unban`,
    {},
    { headers: headers() },
  );
  return data;
};
