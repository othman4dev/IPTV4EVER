export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      message: "Email is required",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: "Please enter a valid email address",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

// Simple password validation for login (only checks length)
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === "") {
    return {
      isValid: false,
      message: "Password is required",
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

// Stronger password validation for registration (accepts all special characters)
export const validatePasswordStrong = (password: string): ValidationResult => {
  if (!password || password.trim() === "") {
    return {
      isValid: false,
      message: "Password is required",
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  // Check for number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for special character (accepts any non-alphanumeric character)
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

// Password strength calculator
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export const calculatePasswordStrength = (
  password: string,
): PasswordStrength => {
  let score = 0;

  if (!password) {
    return { score: 0, label: "", color: "#e0e0e0" };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Map score to label and color
  if (score <= 1) {
    return { score, label: "Weak", color: "#ff4444" };
  } else if (score === 2) {
    return { score, label: "Fair", color: "#ff9800" };
  } else if (score === 3) {
    return { score, label: "Good", color: "#2196f3" };
  } else if (score === 4) {
    return { score, label: "Strong", color: "#4caf50" };
  } else {
    return { score, label: "Very Strong", color: "#00c853" };
  }
};
export const validateName = (
  name: string,
  fieldName: string = "Name",
): ValidationResult => {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return {
      isValid: false,
      message: "Please confirm your password",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: "Passwords do not match",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
