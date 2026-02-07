<template>
  <div class="">
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white/80 mb-4">
        Comments ({{ totalComments }})
      </h3>

      <!-- Add Comment Form -->
      <CommentForm
        v-if="profile"
        v-model="newComment"
        :profile="profile"
        :error="errorMessage"
        :is-submitting="isSubmitting"
        :max-length="maxCommentLength"
        @submit="submitComment"
      />

      <!-- Login prompt -->
      <div v-else class="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <p class="text-gray-600 mb-2">Please log in to leave a comment</p>
        <button @click="openAuth" class="text-blue-600 hover:underline">
          Log in
        </button>
      </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :user-id="user?.id"
        :can-reply="!!user"
        :show-replies="comment.showReplies"
        @like="toggleLike(comment)"
        @delete="deleteComment(comment)"
        @report="reportComment(comment)"
        @reply="startReply(comment)"
        @toggle-replies="toggleReplies(comment)"
      >
        <!-- Reply Form Slot -->
        <template #reply-form>
          <CommentReplyForm
            v-if="replyingTo === comment.id"
            v-model="replyContent"
            :profile="profile"
            :error="errorMessage"
            :reply-to-user="replyToUser"
            :is-submitting="isSubmittingReply"
            :max-length="maxCommentLength"
            @submit="submitReply(comment)"
            @cancel="cancelReply"
          />
        </template>

        <!-- Replies List Slot -->
        <template #replies>
          <div
            v-if="comment.showReplies && comment.replies"
            class="mt-4 pl-4 border-l-2 border-gray-200 space-y-3"
          >
            <CommentReplyItem
              v-for="reply in comment.replies"
              :key="reply.id"
              :reply="reply"
              :user-id="user?.id"
              :can-reply="!!user"
              @like="toggleReplyLike(reply)"
              @delete="deleteReply(reply, comment)"
              @report="reportReply(reply)"
              @reply="startReplyToReply(reply, comment)"
            />

            <div
              v-if="
                comment.replies && comment.replyCount > comment.replies.length
              "
              class="pt-2"
            >
              <button
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
        </template>
      </CommentItem>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full size-8 border-b-2 border-blue-600"
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

    <div
      v-if="!loading && comments.length === 0"
      class="text-center pt-4 pb-8 text-gray-500"
    >
      No comments yet. Be the first to comment!
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Profile } from '~/types/profile'
  import type { User, Comment, Reply } from '~/types/comment'
  const { fetchAuthor, fetchAuthors, cacheAuthor } = useAuthorCache()
  const { errorNotif, successNotif } = useNotification()
  const { openAuth } = useAuthModal()

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

        // Collect all unique user IDs
        const userIds = activeComments.map((c: Comment) => c.createdBy)

        // Batch fetch all authors at once
        await fetchAuthors(userIds)

        // Attach authors from cache
        const commentsWithAuthors = activeComments.map((comment: Comment) => ({
          ...comment,
          author: fetchAuthor(comment.createdBy),
          showReplies: false,
          replies: []
        }))

        // Resolve all author promises
        const resolved = await Promise.all(
          commentsWithAuthors.map(async (comment: Comment) => ({
            ...comment,
            author: await comment.author
          }))
        )

        if (append) {
          comments.value.push(...resolved)
        } else {
          comments.value = resolved
          totalComments.value = resolved.length
        }

        hasMore.value = response.length === pageSize
        currentPage.value = page
      }
    } catch (error: any) {
      console.error('Error loading comments:', error)
      errorNotif('Failed to load comments. Please refresh the page.')
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
          content: newComment.value.trim(),
          recipeId: props.recipeId
        })
      })

      if (response) {
        const author = await fetchAuthor(response.createdBy)
        const newCommentObj: Comment = {
          ...response,
          author,
          showReplies: false,
          replies: []
        }

        comments.value.unshift(newCommentObj)
        totalComments.value++
        newComment.value = ''
        successNotif('Comment posted successfully!')
      }
    } catch (error: any) {
      if (error.statusCode === 422) {
        const validationErrors = extractValidationErrors(error)
        const parse = parseValidationErrors(validationErrors)

        if (parse.length > 0) {
          // Get the first error message
          const firstError = parse[0]
          errorNotif(firstError.message || 'Validation failed')
        } else {
          errorNotif('Please check your comment and try again')
        }
      } else if (error.statusCode === 401) {
        errorNotif('You must be logged in to comment')
        openAuth()
      } else if (error.statusCode === 403) {
        errorNotif('You do not have permission to comment')
      } else if (error.statusCode === 400) {
        errorNotif(error.message || 'Invalid comment')
      } else {
        errorNotif('Failed to post comment. Please try again.')
      }
    } finally {
      isSubmitting.value = false
    }
  }
  // TODO: add error message functionality
  let errorMessage = ''

  // Start reply
  const startReply = (comment: Comment) => {
    replyingTo.value = comment.id
    currentReplyToId.value = comment.id
    replyContent.value = ''
    replyToUser.value = comment.author || null
  }

  const startReplyToReply = (reply: Reply, comment: Comment) => {
    replyingTo.value = comment.id
    currentReplyToId.value = reply.id
    replyContent.value = ''
    replyToUser.value = reply.author || null
  }

  const cancelReply = () => {
    replyingTo.value = null
    currentReplyToId.value = null
    replyContent.value = ''
    replyToUser.value = null
  }

  // Submit reply
  const submitReply = async (comment: Comment) => {
    if (!replyContent.value.trim() || isSubmittingReply.value || !profile.value)
      return

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
        const author = await fetchAuthor(response.createdBy)

        const newReply: Reply = {
          ...response,
          author,
          replyToUser: replyToUser.value
        }

        if (!comment.replies) {
          comment.replies = []
        }
        comment.replies.push(newReply)
        comment.replyCount++

        if (!comment.showReplies) {
          comment.showReplies = true
        }

        replyContent.value = ''
        replyingTo.value = null
        currentReplyToId.value = null
        replyToUser.value = null
        successNotif('Reply posted successfully!')
      }
    } catch (error: any) {
      console.error('Error submitting reply:', error)

      // Handle validation errors (422)
      if (error.statusCode === 422) {
        const validationErrors = extractValidationErrors(error)

        if (validationErrors.length > 0) {
          const firstError = validationErrors[0]
          errorNotif(firstError.msg || 'Validation failed')
        } else {
          errorNotif('Please check your reply and try again')
        }
      } else if (error.statusCode === 401) {
        errorNotif('You must be logged in to reply')
        openAuth()
      } else if (error.statusCode === 403) {
        errorNotif('You do not have permission to reply')
      } else if (error.statusCode === 400) {
        errorNotif(error.message || 'Invalid reply')
      } else {
        errorNotif('Failed to post reply. Please try again.')
      }
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

  // Load replies
  const loadReplies = async (comment: Comment) => {
    if (loadingReplies.value[comment.id]) return

    try {
      loadingReplies.value[comment.id] = true
      const response = await fetchApi(
        `/comments/replies/${comment.id}?skip=0&limit=5`
      )

      if (response) {
        const activeReplies = response.filter(
          (reply: Reply) => reply.status !== 3
        )

        const userIds = new Set<string>()
        activeReplies.forEach((reply: Reply) => {
          userIds.add(reply.createdBy)
          if (reply.replyToId && reply.replyToId !== comment.id) {
            const originalReply = response.find(
              (r: Reply) => r.id === reply.replyToId
            )
            if (originalReply) {
              userIds.add(originalReply.createdBy)
            }
          }
        })

        await fetchAuthors(Array.from(userIds))

        const repliesWithAuthors = await Promise.all(
          activeReplies.map(async (reply: Reply) => {
            const author = await fetchAuthor(reply.createdBy)

            let replyToUser = null
            if (reply.replyToId && reply.replyToId !== comment.id) {
              const originalReply = response.find(
                (r: Reply) => r.id === reply.replyToId
              )
              if (originalReply) {
                replyToUser = await fetchAuthor(originalReply.createdBy)
              }
            }

            return {
              ...reply,
              author,
              replyToUser
            }
          })
        )

        comment.replies = repliesWithAuthors
      }
    } catch (error: any) {
      console.error('Error loading replies:', error)
      errorNotif('Failed to load replies. Please try again.')
    } finally {
      loadingReplies.value[comment.id] = false
    }
  }

  // Load more replies
  const loadMoreReplies = async (comment: Comment) => {
    if (!comment.replies || loadingReplies.value[comment.id]) return

    try {
      loadingReplies.value[comment.id] = true
      const response = await fetchApi(
        `/comments/replies/${comment.id}?skip=${comment.replies.length}&limit=5`
      )

      if (response) {
        const activeReplies = response.filter(
          (reply: Reply) => reply.status !== 3
        )

        const userIds = new Set<string>()
        activeReplies.forEach((reply: Reply) => {
          userIds.add(reply.createdBy)
          if (reply.replyToId && reply.replyToId !== comment.id) {
            const originalReply = response.find(
              (r: Reply) => r.id === reply.replyToId
            )
            if (originalReply) {
              userIds.add(originalReply.createdBy)
            }
          }
        })

        await fetchAuthors(Array.from(userIds))

        const repliesWithAuthors = await Promise.all(
          activeReplies.map(async (reply: Reply) => {
            const author = await fetchAuthor(reply.createdBy)

            let replyToUser = null
            if (reply.replyToId && reply.replyToId !== comment.id) {
              const originalReply = response.find(
                (r: Reply) => r.id === reply.replyToId
              )
              if (originalReply) {
                replyToUser = await fetchAuthor(originalReply.createdBy)
              }
            }

            return {
              ...reply,
              author,
              replyToUser
            }
          })
        )

        comment.replies.push(...repliesWithAuthors)
      }
    } catch (error: any) {
      console.error('Error loading more replies:', error)
      errorNotif('Failed to load more replies. Please try again.')
    } finally {
      loadingReplies.value[comment.id] = false
    }
  }

  // Like/unlike comment
  const toggleLike = async (comment: Comment) => {
    if (!user.value || user.value.id === comment.createdBy) return

    const wasLiked = comment.isLikedByUser
    const originalCount = comment.likeCount

    comment.isLikedByUser = !wasLiked
    comment.likeCount += wasLiked ? -1 : 1

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      await fetchApi(`/comments/${comment.id}/like`, { method })
    } catch (error: any) {
      comment.isLikedByUser = wasLiked
      comment.likeCount = originalCount
      errorNotif(`Failed to ${wasLiked ? 'unlike' : 'like'} comment.`)
    }
  }

  // Like/unlike reply
  const toggleReplyLike = async (reply: Reply) => {
    if (!user.value || user.value.id === reply.createdBy) return

    const wasLiked = reply.isLikedByUser
    const originalCount = reply.likeCount

    reply.isLikedByUser = !wasLiked
    reply.likeCount += wasLiked ? -1 : 1

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      await fetchApi(`/comments/${reply.id}/like`, { method })
    } catch (error: any) {
      reply.isLikedByUser = wasLiked
      reply.likeCount = originalCount
      errorNotif(`Failed to ${wasLiked ? 'unlike' : 'like'} reply.`)
    }
  }

  // Delete comment
  const deleteComment = async (comment: Comment) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await fetchApi(`/comments/${comment.id}`, { method: 'DELETE' })
      successNotif('Comment deleted successfully.')
      const index = comments.value.findIndex((c) => c.id === comment.id)
      if (index > -1) {
        comments.value.splice(index, 1)
        totalComments.value--
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error)

      if (error.statusCode === 403) {
        errorNotif('You do not have permission to delete this comment')
      } else if (error.statusCode === 404) {
        errorNotif('Comment not found')
      } else {
        errorNotif('Something went wrong with deleting comment, try again.')
      }
    }
  }

  // Delete reply
  const deleteReply = async (reply: Reply, comment: Comment) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      await fetchApi(`/comments/${reply.id}`, { method: 'DELETE' })
      successNotif('Reply deleted successfully.')
      if (comment.replies) {
        const index = comment.replies.findIndex((r) => r.id === reply.id)
        if (index > -1) {
          comment.replies.splice(index, 1)
          comment.replyCount--
        }
      }
    } catch (error: any) {
      console.error('Error deleting reply:', error)

      if (error.statusCode === 403) {
        errorNotif('You do not have permission to delete this reply')
      } else if (error.statusCode === 404) {
        errorNotif('Reply not found')
      } else {
        errorNotif('Something went wrong with deleting reply, try again.')
      }
    }
  }

  // Report comment (placeholder)
  const reportComment = (comment: Comment) => {
    // TODO: Implement report functionality
    console.log('Report comment:', comment.id)
    errorNotif('Report functionality coming soon')
  }

  // Report reply (placeholder)
  const reportReply = (reply: Reply) => {
    // TODO: Implement report functionality
    console.log('Report reply:', reply.id)
    errorNotif('Report functionality coming soon')
  }

  // Setup intersection observer
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
