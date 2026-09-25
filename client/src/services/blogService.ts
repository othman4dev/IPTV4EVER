import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface BlogMedia {
  url: string;
  type: "image" | "video";
  caption?: string;
}

export interface Blog {
  id: number;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  media: BlogMedia[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPayload {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  media?: BlogMedia[];
  order?: number;
  isPublished?: boolean;
}

export type UpdateBlogPayload = Partial<CreateBlogPayload>;

export const getBlogs = async (): Promise<Blog[]> => {
  const { data } = await axios.get(`${API_URL}/blogs`);
  return data;
};

export const getPublishedBlogs = async (): Promise<Blog[]> => {
  const { data } = await axios.get(`${API_URL}/blogs/published`);
  return data;
};

export const getBlog = async (id: number): Promise<Blog> => {
  const { data } = await axios.get(`${API_URL}/blogs/${id}`);
  return data;
};

export const createBlog = async (payload: CreateBlogPayload): Promise<Blog> => {
  const { data } = await axios.post(`${API_URL}/blogs`, payload);
  return data;
};

export const updateBlog = async (
  id: number,
  payload: UpdateBlogPayload,
): Promise<Blog> => {
  const { data } = await axios.put(`${API_URL}/blogs/${id}`, payload);
  return data;
};

export const deleteBlog = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/blogs/${id}`);
};
