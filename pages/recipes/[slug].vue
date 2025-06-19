<script setup lang="ts">
  const route = useRoute()
  import { useSupabaseUser } from '~/composables/useSupabaseUser'
  const { user } = useSupabaseUser() // assuming you're using Supabase auth
  const isEditing = ref(false)

  import { useApi } from '~/composables/useApi'
  const api = useApi()

  interface Ingredient {
    name: string
    quantity: string
    measurement: string
  }

  interface Recipe {
    _id: string
    title: string
    description: string
    status: number
    author: User
    ingredients: Ingredient[]
    steps: string[]
    tags: string[]
  }

  interface User {
    id: string
    display_name: string
    avatar_url: string
  }

  const {
    data: recipe,
    pending,
    refresh
  } = await useAsyncData<Recipe | null>(`recipe-${route.params.slug}`, () =>
    api(`/recipes/${route.params.slug}`)
  )

  const isOwner = computed(
    () => user.value && recipe.value?.author.id === user.value?.id
  )

  // Editable draft form state
  const draft = reactive({
    ...recipe.value,
    ingredients: recipe.value?.ingredients ?? [],
    instructions: recipe.value?.steps ?? []
  })

  const toggleEdit = () => {
    if (isOwner.value) {
      isEditing.value = !isEditing.value
      Object.assign(draft, recipe.value) // Reset draft when toggling
    }
  }

  const saveRecipe = async () => {
    if (!recipe.value) return
    await $fetch(`/api/recipes/${recipe.value._id}`, {
      method: 'PATCH',
      body: draft
    })
    await refresh()
    isEditing.value = false
  }

  if (recipe.value) {
    useSeoMeta({
      title: pageTitle(`${recipe.value?.title}`),
      description: `${recipe.value?.description}`,
      ogTitle: pageTitle(`${recipe.value?.title}`),
      ogDescription: `${recipe.value?.description}`,
      ogImage: '[og:image]',
      ogUrl: route.fullPath,
      twitterTitle: pageTitle(`${recipe.value?.title}`),
      twitterDescription: `${recipe.value?.description}`,
      twitterImage: '[twitter:image]',
      twitterCard: 'summary'
    })
  } else {
    useSeoMeta({
      title: pageTitle(`Find and Share Recipes`),
      description: 'Find and share your favorite recipes with our community.',
      ogTitle: pageTitle(`Find and Share Recipes`),
      ogDescription: 'Find and share your favorite recipes with our community.',
      ogImage: '[og:image]',
      ogUrl: route.fullPath,
      twitterTitle: pageTitle(`Find and Share Recipes`),
      twitterDescription:
        'Find and share your favorite recipes with our community.',
      twitterImage: '[twitter:image]',
      twitterCard: 'summary_large_image'
    })
  }
</script>

<template>
  <div class="container mx-auto py-10 px-8">
    <div v-if="recipe">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">
            <template v-if="!isEditing">{{ recipe?.title }}</template>
            <template v-else><UInput v-model="draft.title" /></template>
          </h1>

          <div class="text-xl italic">
            Author:
            <NuxtLink
              :to="`/@${recipe?.author.display_name}`"
              class="hover:underline"
            >
              <img
                v-if="recipe?.author.avatar_url"
                :src="recipe?.author.avatar_url"
                alt="User Avatar"
                class="text-sm inline-block w-15 h-15 rounded-full mr-2 object-cover border"
              />
              <span v-if="recipe?.author.display_name">{{
                recipe.author.display_name
              }}</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="isOwner">
          <UButton label="Edit" @click="toggleEdit" v-if="!isEditing" />
          <UButton
            label="Save"
            color="primary"
            @click="saveRecipe"
            v-if="isEditing"
          />
        </div>
      </div>

      <!-- Visibility Toggle -->
      <div v-if="isEditing" class="mb-4">
        <label class="text-sm">Visibility</label>
        <USelect
          v-model="draft.status"
          :options="[
            { label: 'Public', value: 1 },
            { label: 'Unlisted', value: 2 },
            { label: 'Private', value: 3 }
          ]"
        />
      </div>

      <section class="mb-6">
        <div v-if="!isEditing">{{ recipe?.description }}</div>
        <div v-else>
          <UTextarea v-model="draft.description" :rows="4" />
        </div>
      </section>

      <!-- Ingredients -->
      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Ingredients</h2>
        <ul v-if="!isEditing">
          <li v-for="item in recipe?.ingredients" :key="item.name">
            - {{ item.name }}
            <span class="">{{ item.quantity }} {{ item.measurement }}</span>
          </li>
        </ul>
        <div v-else>
          <div
            v-for="(item, i) in draft.ingredients"
            :key="i"
            class="flex gap-2 mb-2"
          >
            <UInput v-model="item.quantity" placeholder="1 cup" class="w-1/3" />
            <UInput v-model="item.name" placeholder="flour" class="w-2/3" />
            <UInput
              v-model="item.measurement"
              placeholder="flour"
              class="w-2/3"
            />
          </div>
          <UButton
            label="Add Ingredient"
            @click="
              draft.ingredients.push({
                name: '',
                quantity: '',
                measurement: ''
              })
            "
            size="xs"
          />
        </div>
      </section>

      <!-- Instructions -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Instructions</h2>
        <ol v-if="!isEditing" class="list-decimal ml-6">
          <li v-for="(step, i) in recipe?.steps" :key="i">{{ step }}</li>
        </ol>
        <div v-else>
          <div v-for="(step, i) in draft.instructions" :key="i" class="mb-2">
            <UTextarea v-model="draft.instructions[i]" :rows="2" />
          </div>
          <UButton
            label="Add Step"
            @click="draft.instructions.push('')"
            size="xs"
          />
        </div>
      </section>
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center min-h-[40vh] mb-4 text-xl font-bold"
    >
      Recipe does not exist or is not available.
    </div>
  </div>
</template>
