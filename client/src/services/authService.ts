import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      credentials,
    );

    // Store token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        message: error.response.data.message || "Login failed",
        statusCode: error.response.status,
      } as ApiError;
    }
    throw {
      message: "Network error. Please try again.",
    } as ApiError;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/register`,
      credentials,
    );

    // Store token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        message: error.response.data.message || "Registration failed",
        statusCode: error.response.status,
      } as ApiError;
    }
    throw {
      message: "Network error. Please try again.",
    } as ApiError;
  }
};

export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/auth/forgot-password`,
      { email },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        message: error.response.data.message || "Failed to send reset email",
        statusCode: error.response.status,
      } as ApiError;
    }
    throw {
      message: "Network error. Please try again.",
    } as ApiError;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/auth/reset-password`,
      { token, newPassword },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        message: error.response.data.message || "Failed to reset password",
        statusCode: error.response.status,
      } as ApiError;
    }
    throw {
      message: "Network error. Please try again.",
    } as ApiError;
  }
};
