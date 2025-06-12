<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  show: Boolean,
  user: Object
})
const emits = defineEmits(['close', 'updated'])

const close = () => emits('close')

const api = useApi()

// Zod schema
const profileSchema = z.object({
  display_name: z.string().min(3).max(24),
  nick_name: z.string().min(3).max(30),
  bio: z.string().max(80).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

type Schema = z.output<typeof profileSchema>

const form = reactive<Partial<Schema>>({
  display_name: '',
  nick_name: '',
  bio: '',
  avatar_url: ''
})

const toast = useToast()
async function onSubmit2(event: FormSubmitEvent<Schema>) {
    try {
        await api(`/users/${props.user?.id}`, {
        method: 'PATCH',
        body: form
        })
        emits('updated')
        close()
    } catch (err) {
        // handle error
    }
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
    console.log(event.data)
}

watch(() => props.user, (val) => {
  if (val) {
    Object.assign(form, {
      display_name: val.display_name,
      nick_name: val.nick_name || '',
      bio: val.bio || '',
      avatar_url: val.avatar_url || ''
    })
  }
}, { immediate: true })

// const onSubmit = handleSubmit(async (form) => {
//   try {
//     await api(`/users/${props.user?.id}`, {
//       method: 'PATCH',
//       body: form
//     })
//     emits('updated')
//     close()
//   } catch (err) {
//     // handle error
//   }
// })
</script>

<template>
  <UModal title="Edit Profile" @update:model-value="close" size="lg">
    <UButton class="btn" label="Edit Profile" color="neutral" size="xl"/>

    <template #body >
        <UForm :schema="profileSchema" :state="form" class="space-y-4 w-full" @submit="onSubmit2">
            <UFormField class="flex mb-1" label="Display Name" name="display_name" size="xl">
                <UInput v-model="form.display_name" placeholder="Username" class="w-full" />
            </UFormField>

            <UFormField class="flex mb-1" label="Nickname" name="nick_name" help="Your nickname can only be changed every 7 days" size="xl">
                <UInput v-model="form.nick_name" placeholder="Name" class="w-full" />
            </UFormField>

            <UFormField class="flex mb-1" label="Bio" name="bio"  size="xl">
                <UTextarea v-model="form.bio" placeholder="Bio" autoresize :maxrows="4" class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
                <UButton class="btn bg-gray-700" @click="close">Cancel</UButton>
                <UButton type="submit">
                    Submit
                </UButton>
            </div>
        </UForm>
    </template>
  </UModal>
</template>