<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
  >
    <!-- Comment Header -->
    <div class="flex gap-3">
      <UserAvatar
        :avatar-url="comment.author?.avatar_url"
        :alt="comment.author?.display_name"
        class="size-8"
      />
      <div class="flex-1">
        <!-- Author and Date -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <NuxtLink
              v-if="comment.author"
              :to="`/@${comment.author.display_name}`"
              class="font-medium text-gray-900 dark:text-white hover:underline"
            >
              @{{ comment.author?.display_name || 'Anonymous' }}
            </NuxtLink>
            <span
              class="text-sm text-gray-500"
              :title="new Date(comment.createdAt).toLocaleDateString()"
            >
              {{ formatDate(comment.createdAt) }}
            </span>
          </div>

          <!-- Dropdown Menu -->
          <UIDropdownMenu align="right">
            <!-- User's own comment options -->
            <template v-if="isCommentOwner">
              <UIDropdownMenuItem
                label="Delete"
                icon="ic:outline-delete"
                variant="danger"
                @click="handleDelete"
              />
            </template>

            <!-- Other users' comment options -->
            <template v-else>
              <UIDropdownMenuItem
                label="Report"
                icon="ic:outline-flag"
                variant="danger"
                @click="handleReport"
              />
            </template>
          </UIDropdownMenu>
        </div>

        <!-- Comment Content -->
        <p class="text-gray-700 dark:text-gray-300 mb-2">
          {{ comment.content }}
        </p>

        <!-- Comment Actions -->
        <div class="flex items-center gap-4 text-sm">
          <button
            @click="handleLike"
            :class="[
              'flex items-center gap-1 transition-colors',
              comment.isLikedByUser
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-gray-700',
              isCommentOwner ? '!cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <Icon
              :name="
                comment.isLikedByUser
                  ? 'ic:baseline-favorite'
                  : 'ic:baseline-favorite-border'
              "
              class="size-4"
            />
            {{ comment.likeCount }}
          </button>

          <button
            v-if="canReply"
            @click="handleReply"
            class="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
          >
            Reply
          </button>

          <button
            v-if="comment.replyCount > 0"
            @click="handleToggleReplies"
            class="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          >
            {{ showReplies ? 'Hide' : 'View' }} replies ({{
              comment.replyCount
            }})
          </button>
        </div>

        <!-- Reply Form -->
        <slot name="reply-form" />

        <!-- Replies List -->
        <slot name="replies" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Comment {
    id: string
    content: string
    createdAt: string
    createdBy: string
    likeCount: number
    replyCount: number
    isLikedByUser: boolean
    author?: {
      id: string
      display_name: string
      avatar_url?: string
    }
  }

  interface Props {
    comment: Comment
    userId?: string
    canReply?: boolean
    showReplies?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    canReply: true,
    showReplies: false
  })

  const emit = defineEmits<{
    like: []
    delete: []
    report: []
    reply: []
    toggleReplies: []
  }>()

  const isCommentOwner = computed(() => {
    return props.userId && props.comment.createdBy === props.userId
  })

  const handleLike = () => {
    if (!isCommentOwner.value) {
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

  const handleToggleReplies = () => {
    emit('toggleReplies')
  }
</script>
