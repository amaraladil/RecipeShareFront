export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  cookTime: number
  servings: number
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
}
