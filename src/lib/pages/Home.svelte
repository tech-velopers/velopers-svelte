<script lang="ts">
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { onMount } from 'svelte';
  import { toggleBlog, toggleTag, resetSelected } from '$lib/stores/search';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import { store as postsStore } from '$lib/stores/posts';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import { currentUrl, visitedPosts } from '$lib/stores/router';

  // 상태 관리
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();
  let prevUrl = '';

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

  onMount(() => {
    const unsubscribe = tagsStore.subscribe((tags) => {
      allTags = tags.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    });
    
    tagsStore.fetchTags();
    techBlogsStore.fetchTechBlogs();
    // 초기 URL 상태 반영을 위해 currentUrl 값 설정
    prevUrl = '';
    currentUrl.set(window.location.href);

    return () => {
      unsubscribe();
    };
  });

  $: {
    if (prevUrl !== $currentUrl) {
      const { page, category } = getParamsFromUrl();
      // store의 현재 값과 다를 때만 업데이트
      if (page !== $postsStore.currentPage || category !== $postsStore.currentCategory) {
        postsStore.setPage(page);
        postsStore.setCategory(category);
        postsStore.fetchPosts();
      }
      
      prevUrl = $currentUrl;
    }
  }

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    updateUrl(1, category);
    postsStore.setCategory(category);
  };

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    updateUrl(page, $postsStore.currentCategory);
    postsStore.setPage(page);
    
    // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
    const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
    window.scrollTo({
      top: 0,
      behavior: isMobile ? 'auto' : 'smooth'
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