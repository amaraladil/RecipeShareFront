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

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div class="flex flex-col bg-zinc-900 w-[700px] text-white/90 rounded-lg overflow-hidden relative">
      <div class="px-6 pt-6 pb-3 border-b-[0.5px] border-white/20">
        <h2 class="pb-[0.5px] pl border-/20 text-2xl font-semibold mb-4">Edit Profile</h2>
        <button class="absolute top-5 right-8 cursor-pointer text-zinc-400 text-2xl" @click="close">&times;</button>
      </div>
      
      

      <div v-if="errorMessage" class="text-red-500 text-sm" > {{errorMessage}} </div>

      <form class="px-6 text-base" @submit.prevent="save">
        <div class="form-row ">
          <label>Username</label>
          <div>
            <input v-model="form.display_name" class="input"  />
            <p>www.recipe.com/@{{ form.display_name }}</p>
            <p>Usernames can only contain letters, numbers, underscores, and periods. Changing your username will also change your profile link.</p>
          </div>
          
        </div>

        <div class="form-row">
          <label>Name</label>
          <div>
            <input v-model="form.nick_name" class="input " />
            <p >Can only be changed every 7 days</p>
          </div>
        </div>

        <div class="form-row">
          <label>Bio</label>
          <div>
            <textarea v-model="form.bio" maxlength="80" class="input resize-none h-24" />
            <p>{{ form.bio.length }}/80</p>
          </div>
          
        </div>

        <div class="form-row">
          <label>Avatar URL</label>
          <input v-model="form.avatar_url" class="input" />
        </div>

        <div class="flex justify-end h-[86px]  items-center   ">
          <button type="button" class="cancel" @click="close">Cancel</button>
          <button type="submit" class="save">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.form-row {
    @apply flex py-4  w-full  border-white/80  border-b-[0.5px] last:bg-amber-600;

    label {
        @apply w-[120px] font-semibold text-base mr-6;
    }

    input, textarea {
        @apply w-[360px] bg-white/10 outline outline-transparent focus:border-current focus:ring-0 px-3;
    }

    p {
      @apply max-w-[350px] text-xs text-white/75 mt-1 mb-1 ;
    }
}

.cancel {
  border-radius: 8px;
  @apply flex relative w-[62px] h-[36px] rounded-md border-solid border border-white/0 bg-white/10 font-semibold px-4 py-2 justify-center items-center cursor-pointer ml-4 hover:border-white/90;
}

.save {
  @apply flex relative w-[62px] h-[36px] rounded-md border-solid border border-white/0 bg-white/10 font-semibold px-4 py-2 justify-center items-center cursor-pointer ml-4;
}
</style>

