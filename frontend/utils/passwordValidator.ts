/**
 * Password validation criteria
 */
export interface PasswordCriteria {
  minLength: boolean; // At least 8 characters
  hasUppercase: boolean; // At least one uppercase letter
  hasLowercase: boolean; // At least one lowercase letter
  hasNumber: boolean; // At least one number
  hasSpecialChar: boolean; // At least one special character
}

/**
 * Validate password against criteria
 */
export const validatePassword = (password: string): PasswordCriteria => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

/**
 * Check if password meets all criteria
 */
export const isPasswordValid = (password: string): boolean => {
  const criteria = validatePassword(password);
  return (
    criteria.minLength &&
    criteria.hasUppercase &&
    criteria.hasLowercase &&
    criteria.hasNumber &&
    criteria.hasSpecialChar
  );
};

/**
 * Get password strength level (0-5)
 */
export const getPasswordStrength = (password: string): number => {
  const criteria = validatePassword(password);
  const metCriteria = Object.values(criteria).filter(Boolean).length;
  return metCriteria;
};

/**
 * Get password strength label and color
 */
export const getPasswordStrengthLabel = (strength: number): { label: string; color: string } => {
  switch (strength) {
    case 0:
    case 1:
      return { label: 'Very Weak', color: 'text-red-600' };
    case 2:
      return { label: 'Weak', color: 'text-orange-600' };
    case 3:
      return { label: 'Fair', color: 'text-yellow-600' };
    case 4:
      return { label: 'Good', color: 'text-blue-600' };
    case 5:
      return { label: 'Strong', color: 'text-green-600' };
    default:
      return { label: 'Unknown', color: 'text-gray-600' };
  }
};
