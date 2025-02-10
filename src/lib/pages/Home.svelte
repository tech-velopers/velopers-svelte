<script lang="ts">
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { onMount } from 'svelte';
  import { toggleBlog, toggleTag, resetSelected } from '$lib/stores/search';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import { store as postsStore } from '$lib/stores/posts';

  // 태그 타입 정의
  interface Tag {
    id: number;
    tagName: string;
  }

  // 상태 관리
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();

  // URL에서 파라미터 가져오기
  function getParamsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page') || '1');
    const category = urlParams.get('category') || 'All';
    return {
      page: isNaN(page) ? 1 : page,
      category
    };
  }

  // URL 업데이트
  function updateUrl(page: number, category: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url.toString());
  }

  // API에서 태그 목록 가져오기
  async function fetchTags() {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.tags));
      const data = await response.json();
      allTags = data.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    } catch (error) {
      console.error('태그 목록을 가져오는데 실패했습니다:', error);
    }
  }

  onMount(() => {
    const { page, category } = getParamsFromUrl();
    postsStore.setPage(page);
    postsStore.setCategory(category);
    fetchTags();
    techBlogsStore.fetchTechBlogs();
  });

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    updateUrl(1, category);
    postsStore.setCategory(category);
  };

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    updateUrl(page, $postsStore.currentCategory);
    postsStore.setPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // 태그 토글
  const handleToggleTag = (tagName: string) => {
    toggleTag(tagName);
  };

  // 블로그 토글
  const handleToggleBlog = (blog: { name: string; avatar: string }) => {
    toggleBlog(blog);
  };

  // 검색 및 초기화 함수
  const handleSearch = (event: CustomEvent<{query: string}>) => {
    postsStore.setSearchQuery(event.detail.query);
  };

  const searchWithSelected = () => {
    postsStore.fetchPosts();
  };

  const handleResetSelected = () => {
    resetSelected();
    postsStore.reset();
  };
</script>

<MainLayout
  {allTags}
  {searchWithSelected}
  onSearch={handleSearch}
  onReset={handleResetSelected}
>
  <CategoryList currentCategory={$postsStore.currentCategory} {selectCategory} />
  <PostList
    posts={$postsStore.posts}
    currentPage={$postsStore.currentPage}
    totalPages={$postsStore.totalPages}
    {goToPage}
    toggleTag={handleToggleTag}
    toggleBlog={handleToggleBlog}
    {loadedImages}
    loading={$postsStore.isLoading}
  />
</MainLayout> 