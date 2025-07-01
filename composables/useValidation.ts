import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_PASSWORD_MIN_LENGTH,
  PROFILE_BIO_MAX_LINES
} from '~/constants'

// composables/useValidation.ts
export const useValidation = () => {
  // Email validation
  const validateEmail = (
    email: string
  ): { isValid: boolean; error?: string } => {
    if (!email) {
      return { isValid: false, error: 'Email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    return { isValid: true }
  }

  // Password validation
  const validatePassword = (
    password: string,
    isSignup = false
  ): { isValid: boolean; error?: string } => {
    if (!password) {
      return { isValid: false, error: 'Password is required' }
    }

    if (isSignup) {
      if (password.length < PROFILE_PASSWORD_MIN_LENGTH) {
        return {
          isValid: false,
          error: 'Password must be at least 6 characters long'
        }
      }

      // Check for at least one number and one letter
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        return {
          isValid: false,
          error: 'Password must contain at least one letter and one number'
        }
      }
    }

    return { isValid: true }
  }

  // Username validation
  const validateUsername = (
    username: string
  ): { isValid: boolean; error?: string } => {
    if (!username) {
      return { isValid: false, error: 'Username is required' }
    }

    if (username.length < 3) {
      return {
        isValid: false,
        error: 'Username must be at least 3 characters long'
      }
    }

    if (username.length > PROFILE_USERNAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Username cannot exceed ${PROFILE_USERNAME_MAX_LENGTH} characters`
      }
    }

    // Only allow letters, numbers, underscores, and periods
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return {
        isValid: false,
        error:
          'Username can only contain letters, numbers, underscores, and periods'
      }
    }

    // Cannot start with underscore or period
    if (/^[_.]/.test(username)) {
      return {
        isValid: false,
        error: 'Username cannot start with underscore or period'
      }
    }

    // Cannot end with underscore or period
    if (/[_.]$/.test(username)) {
      return {
        isValid: false,
        error: 'Username cannot end with underscore or period'
      }
    }

    // Cannot have consecutive periods or underscores
    if (/[_.]{2,}/.test(username)) {
      return {
        isValid: false,
        error: 'Username cannot have consecutive periods or underscores'
      }
    }

    return { isValid: true }
  }

  // Display name validation
  const validateNickName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    if (!name) {
      return { isValid: false, error: 'Display name is required' }
    }

    if (name.length < 2) {
      return {
        isValid: false,
        error: 'Display name must be at least 2 characters long'
      }
    }

    if (name.length > PROFILE_NAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Display name cannot exceed ${PROFILE_NAME_MAX_LENGTH} characters`
      }
    }

    // Allow letters, numbers, spaces, and some special characters
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name)) {
      return {
        isValid: false,
        error: 'Display name contains invalid characters'
      }
    }

    return { isValid: true }
  }

  // Bio validation
  const validateBio = (bio: string): { isValid: boolean; error?: string } => {
    if (bio && bio.length > PROFILE_BIO_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Bio cannot exceed ${PROFILE_BIO_MAX_LENGTH} characters`
      }
    }

    // Check for maximum 4 lines
    if (bio && bio.split('\n').length > PROFILE_BIO_MAX_LINES) {
      return {
        isValid: false,
        error: `Bio cannot exceed ${PROFILE_BIO_MAX_LINES} lines`
      }
    }

    return { isValid: true }
  }

  return {
    validateEmail,
    validatePassword,
    validateUsername,
    validateNickName,
    validateBio
  }
}
