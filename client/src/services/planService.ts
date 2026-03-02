import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface PlanFeature {
  id: number;
  description: string;
  order: number;
}

export interface Plan {
  id: number;
  name: string;
  pricePerMonth: number;
  pricePer6Months: number;
  pricePerYear: number;
  color: string;
  thumb: string | null;
  buttonText: string;
  order: number;
  features: PlanFeature[];
}

export interface CreatePlanPayload {
  name: string;
  pricePerMonth: number;
  pricePer6Months: number;
  pricePerYear: number;
  color: string;
  thumb?: string;
  buttonText: string;
  order: number;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface CreateFeaturePayload {
  planId: number;
  description: string;
  order: number;
}

export type UpdateFeaturePayload = Partial<CreateFeaturePayload>;

// Plans
export const getPlans = async (): Promise<Plan[]> => {
  const { data } = await axios.get<Plan[]>(`${API_URL}/plans`);
  return data;
};

export const getPlan = async (id: number): Promise<Plan> => {
  const { data } = await axios.get<Plan>(`${API_URL}/plans/${id}`);
  return data;
};

export const createPlan = async (payload: CreatePlanPayload): Promise<Plan> => {
  const { data } = await axios.post<Plan>(`${API_URL}/plans`, payload);
  return data;
};

export const updatePlan = async (
  id: number,
  payload: UpdatePlanPayload,
): Promise<Plan> => {
  const { data } = await axios.put<Plan>(`${API_URL}/plans/${id}`, payload);
  return data;
};

export const deletePlan = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/plans/${id}`);
};

// Features
export const createFeature = async (
  payload: CreateFeaturePayload,
): Promise<PlanFeature> => {
  const { data } = await axios.post<PlanFeature>(
    `${API_URL}/plan-feature`,
    payload,
  );
  return data;
};

export const updateFeature = async (
  id: number,
  payload: UpdateFeaturePayload,
): Promise<PlanFeature> => {
  const { data } = await axios.put<PlanFeature>(
    `${API_URL}/plan-feature/${id}`,
    payload,
  );
  return data;
};

export const deleteFeature = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/plan-feature/${id}`);
};
