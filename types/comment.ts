export interface User {
  id: string
  display_name: string
  avatar_url: string
}

export interface Comment {
  id: string
  recipeId: string
  content: string
  status: number
  createdBy: string
  createdAt: string
  likeCount: number
  replyCount: number
  isLikedByUser: boolean
  author?: User
  showReplies?: boolean
  replies?: Reply[]
}

export interface Reply {
  id: string
  recipeId: string
  content: string
  status: number
  createdBy: string
  createdAt: string
  likeCount: number
  parentId: string
  replyToId?: string
  isLikedByUser: boolean
  author?: User
  replyToUser?: User
}
