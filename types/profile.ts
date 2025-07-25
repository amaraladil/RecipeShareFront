export interface Profile {
  id: string
  display_name: string
  nick_name: string
  avatar_url?: string
  bio?: string
  role?: number
}

export interface ProfileUpdate {
  name?: string
  bio?: string
  avatar?: string
}
