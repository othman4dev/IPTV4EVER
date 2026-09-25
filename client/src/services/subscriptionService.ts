import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export type SubscriptionStatus = "pending" | "ongoing" | "paused" | "expired";

export interface Subscription {
  id: number;
  user: { id: string; name: string; email: string };
  plan: { id: number; name: string; color: string };
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  pricePaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPayload {
  userId: string;
  planId: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  pricePaid: number;
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

const headers = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await axios.get(`${API_URL}/subscriptions`, {
    headers: headers(),
  });
  return data;
};

export const getSubscription = async (id: number): Promise<Subscription> => {
  const { data } = await axios.get(`${API_URL}/subscriptions/${id}`, {
    headers: headers(),
  });
  return data;
};

export const getSubscriptionsByUser = async (
  userId: string,
): Promise<Subscription[]> => {
  const { data } = await axios.get(`${API_URL}/subscriptions/user/${userId}`, {
    headers: headers(),
  });
  return data;
};

export const createSubscription = async (
  payload: CreateSubscriptionPayload,
): Promise<Subscription> => {
  const { data } = await axios.post(`${API_URL}/subscriptions`, payload, {
    headers: headers(),
  });
  return data;
};

export const updateSubscription = async (
  id: number,
  payload: UpdateSubscriptionPayload,
): Promise<Subscription> => {
  const { data } = await axios.put(`${API_URL}/subscriptions/${id}`, payload, {
    headers: headers(),
  });
  return data;
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/subscriptions/${id}`, { headers: headers() });
};
