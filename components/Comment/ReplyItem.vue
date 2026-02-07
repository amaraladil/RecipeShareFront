<template>
  <div class="flex gap-3">
    <UserAvatar
      :avatar-url="reply.author?.avatar_url"
      :alt="reply.author?.display_name"
      class="size-6"
    />
    <div class="flex-1">
      <!-- Author and Date -->
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <NuxtLink
            v-if="reply.author"
            :to="`/@${reply.author.display_name}`"
            class="font-medium text-sm text-gray-900 dark:text-white hover:underline"
          >
            @{{ reply.author.display_name }}
          </NuxtLink>
          <div v-else class="font-medium text-sm text-gray-900 dark:text-white">
            Hidden User
          </div>
          <span
            class="text-xs text-gray-500"
            :title="new Date(reply.createdAt).toLocaleDateString()"
          >
            {{ formatDate(reply.createdAt) }}
          </span>
        </div>

        <!-- Dropdown Menu -->
        <UIDropdownMenu v-if="reply.author" align="right">
          <!-- User's own reply options -->
          <template v-if="isReplyOwner">
            <UIDropdownMenuItem
              label="Delete"
              icon="ic:outline-delete"
              variant="danger"
              @click="handleDelete"
            />
          </template>

          <!-- Other users' reply options -->
          <template v-else>
            <UIDropdownMenuItem
              label="Report"
              icon="ic:outline-flag"
              variant="danger"
              @click="handleReport"
            />
          </template>
        </UIDropdownMenu>
        <div v-else class="h-7"></div>
      </div>

      <!-- Reply Content -->
      <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">
        <span v-if="reply.replyToUser" class="text-blue-600">
          @{{ reply.replyToUser.display_name }}
        </span>
        {{ reply.content }}
      </p>

      <!-- Reply Actions -->
      <div v-if="reply.author" class="flex items-center gap-3 text-xs">
        <button
          @click="handleLike"
          :class="[
            'flex items-center gap-1 transition-colors',
            reply.isLikedByUser
              ? 'text-red-600 hover:text-red-700'
              : 'text-gray-500 hover:text-gray-700',
            isReplyOwner ? '!cursor-not-allowed' : 'cursor-pointer'
          ]"
        >
          <Icon
            :name="
              reply.isLikedByUser
                ? 'ic:baseline-favorite'
                : 'ic:baseline-favorite-border'
            "
            class="size-3"
          />
          {{ reply.likeCount }}
        </button>

        <button
          v-if="canReply"
          @click="handleReply"
          class="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
        >
          Reply
        </button>
      </div>
      <div v-else class="h-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Reply {
    id: string
    content: string
    createdAt: string
    createdBy: string
    likeCount: number
    isLikedByUser: boolean
    replyToId?: string
    author?: {
      id: string
      display_name: string
      avatar_url?: string
    }
    replyToUser?: {
      id: string
      display_name: string
      avatar_url?: string
    }
  }

  interface Props {
    reply: Reply
    userId?: string
    canReply?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    canReply: true
  })

  const emit = defineEmits<{
    like: []
    delete: []
    report: []
    reply: []
  }>()

  const isReplyOwner = computed(() => {
    return props.userId && props.reply.createdBy === props.userId
  })

  const handleLike = () => {
    if (!isReplyOwner.value) {
      emit('like')
    }
  }

  const handleDelete = () => {
    emit('delete')
  }

  const handleReport = () => {
    emit('report')
  }

  const handleReply = () => {
    emit('reply')
  }
</script>
