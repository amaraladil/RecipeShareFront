<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div class="bg-zinc-900 text-white w-full max-w-md rounded-lg p-6 relative">
      <button class="absolute top-2 right-2" @click="close">✖</button>

      <h2 class="text-xl font-semibold mb-4">Edit Profile</h2>

      <div v-if="errorMessage" class="text-red-500 text-sm" > {{errorMessage}} </div>

      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block mb-1">Username</label>
          <input v-model="form.display_name" class="input" disabled />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Name</label>
          <input v-model="form.nick_name" class="input" />
          <p class="text-xs text-gray-400">Can only be changed every 7 days</p>
        </div>

        <div class="mb-4">
          <label class="block mb-1">Bio</label>
          <textarea v-model="form.bio" maxlength="80" class="input" />
          <p class="text-xs text-gray-400">{{ form.bio.length }}/80</p>
        </div>

        <div class="mb-4">
          <label class="block mb-1">Avatar URL</label>
          <input v-model="form.avatar_url" class="input" />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button" class="btn bg-gray-700" @click="close">Cancel</button>
          <button type="submit" class="btn bg-green-600">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useApi } from "~/composables/useApi";
const props = defineProps({
  show: Boolean,
  user: Object
})
const emits = defineEmits(['close', 'updated'])

const close = () => emits('close')

const form = reactive({
  display_name: '',
  nick_name: '',
  bio: '',
  avatar_url: ''
})

const api = useApi()

const errorMessage = ref('')

watch(() => props.user, (val) => {
    console.info(val)
  if (val) {
    Object.assign(form, {
      display_name: val.display_name,
      nick_name: val.nick_name || '',
      bio: val.bio || '',
      avatar_url: val.avatar_url || ''
    })
  }
}, { immediate: true })

const original = ref({ ...props.user })

const save = async () => {
    type FormField = 'display_name' | 'nick_name' | 'bio' | 'avatar_url'
    const getUpdatedFields = () => {
        const updated: Record<string, any> = {}
        
        ;(Object.keys(form) as FormField[]).forEach((key) => {
            if (form[key] !== original.value[key] && form[key] != null && form[key] !== "") {
                updated[key] = form[key]
            } 
        })

        return updated
    }

    const updatedFields = getUpdatedFields()

    if (Object.keys(updatedFields).length === 0) {
        errorMessage.value = "No value has changed"
        console.log("Nothing changed")
        return
    }

    try {
        await api(`/users/${props.user?.id}`, {
        method: 'PATCH',
        body: updatedFields
        })
        emits('updated')
        close()
    } catch (err) {
        console.error('Failed to update profile', err)
    }
    

}


</script>

<style scoped>
/* .inputProf {
  @apply w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700;
}
.btn {
  @apply px-4 py-2 rounded text-sm;
} */
</style>