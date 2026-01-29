<script setup lang="ts">
  import { UnitGroups, UnitsById } from '~/utils/units'

  interface Ingredient {
    name: string
    amount: number
    unit: number
  }

  interface Props {
    ingredients: Ingredient[]
    editable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: false
  })

  const emit = defineEmits<{
    add: []
    remove: [index: number]
    update: [index: number, ingredient: Ingredient]
  }>()

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const updated = { ...props.ingredients[index], [field]: value }
    emit('update', index, updated)
  }
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white/80">
        Ingredients
      </h2>
      <button
        v-if="editable"
        @click="emit('add')"
        type="button"
        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer transition-colors"
      >
        Add Ingredient
      </button>
    </div>

    <!-- Ingredients List -->
    <ul class="space-y-2">
      <li
        v-for="(ingredient, index) in ingredients"
        :key="index"
        :class="['flex items-start gap-3', editable ? 'pb-4' : '']"
      >
        <!-- View Mode -->
        <template v-if="!editable">
          <span
            class="size-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"
          ></span>
          <span class="text-gray-700 dark:text-gray-300 flex gap-2 flex-wrap">
            <span>{{ ingredient.name }}</span>
            <span class="text-gray-500">-</span>
            <span
              >{{ ingredient.amount }} {{ UnitsById[ingredient.unit] }}</span
            >
          </span>
        </template>

        <!-- Edit Mode -->
        <template v-else>
          <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
            <input
              :value="ingredient.name"
              @input="
                updateIngredient(
                  index,
                  'name',
                  ($event.target as HTMLInputElement).value
                )
              "
              type="text"
              class="px-3 py-2 col-span-2 md:col-span-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingredient name"
            />
            <input
              :value="ingredient.amount"
              @input="
                updateIngredient(
                  index,
                  'amount',
                  parseFloat(($event.target as HTMLInputElement).value)
                )
              "
              type="number"
              step="0.01"
              min="0"
              class="px-3 py-2 col-span-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amount"
            />
            <select
              :value="ingredient.unit"
              @change="
                updateIngredient(
                  index,
                  'unit',
                  parseInt(($event.target as HTMLSelectElement).value)
                )
              "
              class="px-3 py-2 col-span-1 border border-gray-300 dark:focus-visible:bg-gray-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <optgroup
                v-for="(groupItems, groupName) in UnitGroups"
                :key="groupName"
                :label="groupName"
              >
                <option
                  v-for="unit in groupItems"
                  :key="unit.id"
                  :value="unit.id"
                >
                  {{ unit.label }}
                </option>
              </optgroup>
            </select>
          </div>
          <button
            @click="emit('remove', index)"
            type="button"
            class="text-red-600 hover:text-red-800 px-2 cursor-pointer mt-2"
          >
            <UIcon name="ic:outline-delete" class="size-5" />
          </button>
        </template>
      </li>
    </ul>

    <!-- Empty State -->
    <div
      v-if="!editable && (!ingredients || ingredients.length === 0)"
      class="text-gray-500 italic"
    >
      No ingredients listed.
    </div>
  </div>
</template>

<style scoped>
  @import '@/assets/styles/main.css';
</style>
