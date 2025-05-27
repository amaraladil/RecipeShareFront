import { useApi } from "./useApi";

export function useRecipes(handle: string) {
  const fetchApi = useApi();

  const posts = ref([]);
  const liked = ref<null | any[]>(null);
  const saved = ref<null | any[]>(null);

  const isLoading = ref(false);

  const fetchPosts = async () => {
    isLoading.value = true;
    posts.value = await fetchApi(`/recipes/by/${handle}`);
    isLoading.value = false;
  };

  const fetchLiked = async () => {
    if (!liked.value) liked.value = await fetchApi(`/recipes/liked/${handle}`);
  };

  const fetchSaved = async () => {
    if (!saved.value) saved.value = await fetchApi(`/recipes/saved/${handle}`);
  };

  return { posts, liked, saved, isLoading, fetchPosts, fetchLiked, fetchSaved };
}
