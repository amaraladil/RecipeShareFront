export const PROFILE_BIO_MAX_LENGTH = 80
export const PROFILE_BIO_MAX_LINES = 4
export const PROFILE_USERNAME_MAX_LENGTH = 24
export const PROFILE_NAME_MAX_LENGTH = 30
export const PROFILE_PASSWORD_MIN_LENGTH = 6

export const COMMENT_MIN_LENGTH = 1
export const COMMENT_MAX_LENGTH = 160

export const DEFAULT_AVATAR_URL = '/images/default-avatar.png'

export const ROLES = {
  admin: 'admin',
  user: 'user'
}

export const MESSAGES = {
  usernameTaken: 'That username is already taken.',
  profileUpdated: 'Profile updated successfully!'
}

export const CACHE_PROFILE_DURATION = 60 * 1000 // 1 min
export const CACHE_RECIPE_DURATION = 10 * 60 * 1000 // 10 min
