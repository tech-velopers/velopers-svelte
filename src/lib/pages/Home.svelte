<script lang="ts">
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { onMount } from 'svelte';
  import { selectedBlogs, selectedTags, toggleBlog, toggleTag, resetSelected } from '$lib/stores/search';

  // 태그 타입 정의
  interface Tag {
    id: number;
    tagName: string;
  }

  interface Post {
    id: number;
    title: string;
    preview: string;
    imageUrl: string;
    company: {
      name: string;
      avatar: string;
    };
    tags: string[];
    createdAt: any;
  }

  // 상태 관리
  let allTags: Tag[] = [];
  let posts: Post[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let isLoading = false;
  let currentCategory = "All";
  let loadedImages = new Set<string>();
  let searchQuery = '';

  // 상태 관리를 위한 로컬 변수
  let localSelectedTags: string[] = [];
  let localSelectedBlogs: Array<{ name: string; avatar: string }> = [];

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

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    currentPage = page;
    updateUrl(page, currentCategory);
    fetchPosts();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  // API에서 포스트 데이터 가져오기
  async function fetchPosts() {
    isLoading = true;
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.posts), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: currentCategory,
          tags: localSelectedTags,
          blogs: localSelectedBlogs.map(blog => blog.name),
          query: searchQuery,
          size: 10,
          page: currentPage
        })
      });
      const data = await response.json();
      posts = data.content;
      totalPages = data.totalPages;
    } catch (error) {
      console.error('포스트를 가져오는데 실패했습니다:', error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    const { page, category } = getParamsFromUrl();
    currentPage = page;
    currentCategory = category;
    fetchTags();
    
    // 선택된 블로그와 태그 구독 - 로컬 상태만 업데이트
    const unsubscribeBlogs = selectedBlogs.subscribe(blogs => {
      localSelectedBlogs = blogs || [];
    });

    const unsubscribeTags = selectedTags.subscribe(tags => {
      localSelectedTags = tags || [];
    });

    fetchPosts();

    return () => {
      unsubscribeBlogs();
      unsubscribeTags();
    };
  });

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    currentCategory = category;
    currentPage = 1;
    searchQuery = '';
    updateUrl(currentPage, category);
    fetchPosts();
  };
  

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
    searchQuery = event.detail.query;
    currentPage = 1;
    fetchPosts();
  };

  const searchWithSelected = (data: any) => {
    currentPage = 1;
    // 검색 버튼을 눌렀을 때 fetchPosts 호출
    fetchPosts();
  };

  const handleResetSelected = () => {
    // store 초기화
    resetSelected();
    // 로컬 상태 초기화
    localSelectedTags = [];
    localSelectedBlogs = [];
    // 검색어 초기화
    searchQuery = '';
    // 카테고리 초기화
    currentCategory = 'All';
    // 페이지 초기화
    currentPage = 1;
    // URL 업데이트
    updateUrl(currentPage, currentCategory);
    // 전체 포스트 목록 가져오기
    fetchPosts();
  };
</script>

<MainLayout
  {allTags}
  {searchWithSelected}
  onSearch={handleSearch}
  onReset={handleResetSelected}
>
  <CategoryList {currentCategory} {selectCategory} />
  <PostList
    {posts}
    {currentPage}
    {totalPages}
    {goToPage}
    toggleTag={handleToggleTag}
    toggleBlog={handleToggleBlog}
    selectedTags={localSelectedTags}
    selectedBlogs={localSelectedBlogs}
    {loadedImages}
    loading={isLoading}
  />
</MainLayout> 