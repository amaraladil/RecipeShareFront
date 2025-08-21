<template>
  <div class="">
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white/80 mb-4">
        Comments ({{ totalComments }})
      </h3>

      <!-- Add Comment Form -->
      <div v-if="profile" class="mb-6">
        <div class="flex gap-3">
          <img
            :src="profile.avatar_url || '/default-avatar.jpg'"
            :alt="profile.display_name"
            class="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div class="flex-1">
            <textarea
              v-model="newComment"
              placeholder="Add a comment..."
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm text-gray-500">
                {{ newComment.length }}/{{ maxCommentLength }}
              </span>
              <button
                @click="submitComment"
                :disabled="
                  !newComment.trim() ||
                  isSubmitting ||
                  newComment.length > maxCommentLength
                "
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Login prompt -->
      <div v-else class="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <p class="text-gray-600 mb-2">Please log in to leave a comment</p>
        <button class="text-blue-600 hover:underline">Log in</button>
      </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <!-- Comment Content -->
        <div class="flex gap-3">
          <img
            :src="comment.author?.avatar_url || '/default-avatar.jpg'"
            :alt="comment.author?.display_name"
            class="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink
                v-if="comment.author"
                :to="`/@${comment.author.display_name}`"
                class="font-medium text-gray-900 dark:text-white hover:underline"
              >
                @{{ comment.author?.display_name || 'Anonymous' }}
              </NuxtLink>
              <span class="text-sm text-gray-500">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>

            <p class="text-gray-700 dark:text-gray-300 mb-2">
              {{ comment.content }}
            </p>

            <!-- Comment Actions -->
            <div class="flex items-center gap-4 text-sm">
              <button
                @click="toggleLike(comment)"
                :class="[
                  'flex items-center gap-1 transition-colors',
                  comment.isLikedByUser
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                <UIcon
                  :name="
                    comment.isLikedByUser
                      ? 'ic:baseline-favorite'
                      : 'ic:baseline-favorite-border'
                  "
                  class="w-4 h-4"
                />
                {{ comment.likeCount }}
              </button>

              <button
                v-if="user"
                @click="startReply(comment)"
                class="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reply
              </button>

              <button
                v-if="comment.replyCount > 0"
                @click="toggleReplies(comment)"
                class="text-blue-600 hover:text-blue-700 transition-colors"
              >
                {{ comment.showReplies ? 'Hide' : 'View' }} replies ({{
                  comment.replyCount
                }})
              </button>

              <button
                v-if="user && user.id === comment.createdBy"
                @click="deleteComment(comment)"
                class="text-red-500 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            </div>

            <!-- Reply Form -->
            <div
              v-if="replyingTo === comment.id"
              class="mt-3 pl-4 border-l-2 border-blue-500"
            >
              <div class="flex gap-2">
                <img
                  :src="profile?.avatar_url || '/default-avatar.jpg'"
                  :alt="profile?.display_name"
                  class="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div class="flex-1">
                  <div v-if="replyToUser" class="text-sm text-gray-600 mb-1">
                    Replying to @{{ replyToUser.display_name }}
                  </div>
                  <textarea
                    v-model="replyContent"
                    placeholder="Write a reply..."
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    @keydown.ctrl.enter="submitReply(comment)"
                  ></textarea>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">
                      {{ replyContent.length }}/{{ maxCommentLength }}
                    </span>
                    <div class="flex gap-2">
                      <button
                        @click="cancelReply"
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        @click="submitReply(comment)"
                        :disabled="
                          !replyContent.trim() ||
                          isSubmittingReply ||
                          replyContent.length > maxCommentLength
                        "
                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {{ isSubmittingReply ? 'Posting...' : 'Reply' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Replies -->
            <div
              v-if="comment.showReplies && comment.replies"
              class="mt-4 pl-4 border-l-2 border-gray-200 space-y-3"
            >
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="flex gap-3"
              >
                <img
                  :src="reply.author?.avatar_url || '/default-avatar.jpg'"
                  :alt="reply.author?.display_name"
                  class="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <NuxtLink
                      v-if="reply.author"
                      :to="`/@${reply.author.display_name}`"
                      class="font-medium text-sm text-gray-900 dark:text-white hover:underline"
                    >
                      @{{ reply.author?.display_name || 'Anonymous' }}
                    </NuxtLink>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(reply.createdAt) }}
                    </span>
                  </div>

                  <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    <span v-if="reply.replyToUser" class="text-blue-600">
                      @{{ reply.replyToUser.display_name }}
                    </span>
                    {{ reply.content }}
                  </p>

                  <!-- Reply Actions -->
                  <div class="flex items-center gap-3 text-xs">
                    <button
                      @click="toggleReplyLike(reply)"
                      :class="[
                        'flex items-center gap-1 transition-colors',
                        reply.isLikedByUser
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-gray-500 hover:text-gray-700'
                      ]"
                    >
                      <UIcon
                        :name="
                          reply.isLikedByUser
                            ? 'ic:baseline-favorite'
                            : 'ic:baseline-favorite-border'
                        "
                        class="w-3 h-3"
                      />
                      {{ reply.likeCount }}
                    </button>

                    <button
                      v-if="user"
                      @click="startReplyToReply(comment, reply)"
                      class="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Reply
                    </button>

                    <button
                      v-if="user && user.id === reply.createdBy"
                      @click="deleteReply(reply, comment)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- Load More Replies -->
              <button
                v-if="
                  comment.replies && comment.replies.length < comment.replyCount
                "
                @click="loadMoreReplies(comment)"
                :disabled="loadingReplies[comment.id]"
                class="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {{
                  loadingReplies[comment.id]
                    ? 'Loading...'
                    : 'Load more replies'
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Load More Comments -->
    <div v-if="hasMore && !loading" class="text-center mt-6">
      <button
        @click="loadMoreComments"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Load more comments
      </button>
    </div>

    <!-- Intersection Observer Target -->
    <div ref="scrollTarget" class="h-1"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import type { Profile } from '~/types/profile'
  import type { User, Comment, Reply } from '~/types/comment'

  const props = defineProps<{
    recipeId: string
  }>()

  const { user } = useSupabaseUser()
  const profile = useProfileState() as Ref<Profile | null>
  const fetchApi = useApi()

  import { COMMENT_MIN_LENGTH, COMMENT_MAX_LENGTH } from '~/constants'

  // State
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(0)
  const pageSize = 10
  const totalComments = ref(0)

  // New comment
  const newComment = ref('')
  const isSubmitting = ref(false)
  const maxCommentLength = COMMENT_MAX_LENGTH

  // Replies
  const replyingTo = ref<string | null>(null)
  const replyContent = ref('')
  const isSubmittingReply = ref(false)
  const loadingReplies = ref<Record<string, boolean>>({})
  const replyToUser = ref<User | null>(null)
  const currentReplyToId = ref<string | null>(null)

  // Intersection Observer
  const scrollTarget = ref<HTMLElement>()
  let observer: IntersectionObserver | null = null

  // Format date helper
  const formatDate = (dateString: string) => {
    // Ensure the dateString is treated as UTC by adding 'Z' if not present
    const utcDateString = dateString.endsWith('Z')
      ? dateString
      : dateString + 'Z'
    const date = new Date(utcDateString)
    const now = new Date()

    let diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    // If the difference is negative (future date), treat as 0
    if (diffInMinutes < 0) diffInMinutes = 0
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  // Load comments
  const loadComments = async (page = 0, append = false) => {
    try {
      loading.value = true
      const response = await fetchApi(
        `/comments/${props.recipeId}?skip=${page * pageSize}&limit=${pageSize}`
      )

      if (response) {
        // Filter out deleted comments
        const activeComments = response.filter(
          (comment: Comment) => comment.status !== 3
        )

        // Fetch author info for each comment
        const commentsWithAuthors = await Promise.all(
          activeComments.map(async (comment: Comment) => {
            const authorResponse = await fetchApi(
              `/users/id/${comment.createdBy}`
            )
            return {
              ...comment,
              author: authorResponse,
              showReplies: false,
              replies: []
            }
          })
        )

        if (append) {
          comments.value.push(...commentsWithAuthors)
        } else {
          comments.value = commentsWithAuthors
          totalComments.value = commentsWithAuthors.length
        }

        hasMore.value = response.length === pageSize
        currentPage.value = page
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      loading.value = false
    }
  }

  // Load more comments
  const loadMoreComments = async () => {
    if (!hasMore.value || loading.value) return
    await loadComments(currentPage.value + 1, true)
  }

  // Submit new comment
  const submitComment = async () => {
    if (!newComment.value.trim() || isSubmitting.value) return

    try {
      isSubmitting.value = true
      const response = await fetchApi('/comments/', {
        method: 'POST',
        body: JSON.stringify({
          recipeId: props.recipeId,
          content: newComment.value.trim()
        })
      })

      if (response) {
        // Add new comment to the beginning of the list
        const authorResponse = await fetchApi(`/users/id/${response.createdBy}`)
        const newCommentWithAuthor = {
          ...response,
          author: authorResponse,
          showReplies: false,
          replies: []
        }

        comments.value.unshift(newCommentWithAuthor)
        totalComments.value++
        newComment.value = ''
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  // Reply functionality
  const startReply = (comment: Comment) => {
    replyingTo.value = comment.id
    replyContent.value = ''
    replyToUser.value = null
    currentReplyToId.value = null
    nextTick(() => {
      // Focus on the textarea
      const textarea = document.querySelector(
        `textarea[placeholder="Write a reply..."]`
      ) as HTMLTextAreaElement
      if (textarea) textarea.focus()
    })
  }

  const startReplyToReply = (comment: Comment, reply: Reply) => {
    replyingTo.value = comment.id
    replyContent.value = ''
    replyToUser.value = reply.author || null
    currentReplyToId.value = reply.id
    nextTick(() => {
      // Focus on the textarea
      const textarea = document.querySelector(
        `textarea[placeholder="Write a reply..."]`
      ) as HTMLTextAreaElement
      if (textarea) textarea.focus()
    })
  }

  const cancelReply = () => {
    replyingTo.value = null
    replyContent.value = ''
    replyToUser.value = null
    currentReplyToId.value = null
  }

  const submitReply = async (comment: Comment) => {
    if (!replyContent.value.trim() || isSubmittingReply.value) return

    try {
      isSubmittingReply.value = true
      const response = await fetchApi('/comments/reply', {
        method: 'POST',
        body: JSON.stringify({
          recipeId: props.recipeId,
          content: replyContent.value.trim(),
          parentId: comment.id,
          replyToId: currentReplyToId.value || comment.id
        })
      })

      if (response) {
        // Add reply to the comment
        const authorResponse = await fetchApi(`/users/id/${response.createdBy}`)
        const newReply = {
          ...response,
          author: authorResponse,
          replyToUser: replyToUser.value
        }

        if (!comment.replies) {
          comment.replies = []
        }
        comment.replies.push(newReply)
        comment.replyCount++
        comment.showReplies = true

        cancelReply()
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      isSubmittingReply.value = false
    }
  }

  // Toggle replies visibility
  const toggleReplies = async (comment: Comment) => {
    if (!comment.showReplies) {
      comment.showReplies = true
      if (!comment.replies || comment.replies.length === 0) {
        await loadReplies(comment)
      }
    } else {
      comment.showReplies = false
    }
  }

  // Load replies for a comment
  const loadReplies = async (comment: Comment) => {
    try {
      loadingReplies.value[comment.id] = true
      const response = await fetchApi(
        `/comments/replies/${comment.id}?skip=0&limit=5`
      )

      if (response) {
        // Filter out deleted replies
        const activeReplies = response.filter(
          (reply: Reply) => reply.status !== 3
        )

        const repliesWithAuthors = await Promise.all(
          activeReplies.map(async (reply: Reply) => {
            const authorResponse = await fetchApi(
              `/users/id/${reply.createdBy}`
            )

            let replyToUser = null
            if (reply.replyToId && reply.replyToId !== comment.id) {
              // This is a reply to another reply, get the original reply author
              const originalReply = response.find(
                (r: Reply) => r.id === reply.replyToId
              )
              if (originalReply) {
                replyToUser = await fetchApi(
                  `/users/id/${originalReply.createdBy}`
                )
              }
            }

            return {
              ...reply,
              author: authorResponse,
              replyToUser
            }
          })
        )

        comment.replies = repliesWithAuthors
      }
    } catch (error) {
      console.error('Error loading replies:', error)
    } finally {
      loadingReplies.value[comment.id] = false
    }
  }

  // Load more replies for a comment
  const loadMoreReplies = async (comment: Comment) => {
    if (!comment.replies || loadingReplies.value[comment.id]) return

    try {
      loadingReplies.value[comment.id] = true
      const response = await fetchApi(
        `/comments/replies/${comment.id}?skip=${comment.replies.length}&limit=5`
      )

      if (response) {
        // Filter out deleted replies
        const activeReplies = response.filter(
          (reply: Reply) => reply.status !== 3
        )

        const repliesWithAuthors = await Promise.all(
          activeReplies.map(async (reply: Reply) => {
            const authorResponse = await fetchApi(
              `/users/id/${reply.createdBy}`
            )

            let replyToUser = null
            if (reply.replyToId && reply.replyToId !== comment.id) {
              // This is a reply to another reply, get the original reply author
              const originalReply = response.find(
                (r: Reply) => r.id === reply.replyToId
              )
              if (originalReply) {
                replyToUser = await fetchApi(
                  `/users/id/${originalReply.createdBy}`
                )
              }
            }

            return {
              ...reply,
              author: authorResponse,
              replyToUser
            }
          })
        )

        comment.replies.push(...repliesWithAuthors)
      }
    } catch (error) {
      console.error('Error loading more replies:', error)
    } finally {
      loadingReplies.value[comment.id] = false
    }
  }

  // Like/unlike comment
  const toggleLike = async (comment: Comment) => {
    if (!user.value || user.value.id === comment.createdBy) return

    const wasLiked = comment.isLikedByUser
    const originalCount = comment.likeCount

    // Optimistic update
    comment.isLikedByUser = !wasLiked
    comment.likeCount += wasLiked ? -1 : 1

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      await fetchApi(`/comments/${comment.id}/like`, { method })
    } catch (error) {
      // Revert on error
      comment.isLikedByUser = wasLiked
      comment.likeCount = originalCount
      console.error('Error toggling like:', error)
    }
  }

  // Like/unlike reply
  const toggleReplyLike = async (reply: Reply) => {
    if (!user.value) return

    const wasLiked = reply.isLikedByUser
    const originalCount = reply.likeCount

    // Optimistic update
    reply.isLikedByUser = !wasLiked
    reply.likeCount += wasLiked ? -1 : 1

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      await fetchApi(`/comments/${reply.id}/like`, { method })
    } catch (error) {
      // Revert on error
      reply.isLikedByUser = wasLiked
      reply.likeCount = originalCount
      console.error('Error toggling reply like:', error)
    }
  }

  // Delete comment
  const deleteComment = async (comment: Comment) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await fetchApi(`/comments/${comment.id}`, { method: 'DELETE' })
      const index = comments.value.findIndex((c) => c.id === comment.id)
      if (index > -1) {
        comments.value.splice(index, 1)
        totalComments.value--
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  // Delete reply
  const deleteReply = async (reply: Reply, comment: Comment) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      await fetchApi(`/comments/${reply.id}`, { method: 'DELETE' })
      if (comment.replies) {
        const index = comment.replies.findIndex((r) => r.id === reply.id)
        if (index > -1) {
          comment.replies.splice(index, 1)
          comment.replyCount--
        }
      }
    } catch (error) {
      console.error('Error deleting reply:', error)
    }
  }

  // Setup intersection observer for infinite scroll
  const setupIntersectionObserver = () => {
    if (!scrollTarget.value) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value) {
          loadMoreComments()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(scrollTarget.value)
  }

  onMounted(() => {
    loadComments()
    nextTick(() => {
      setupIntersectionObserver()
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })
</script>

<style scoped>
  @import '@/assets/styles/main.css';

  button {
    @apply cursor-pointer;
  }
</style>
