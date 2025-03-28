<script lang="ts">
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { onMount } from 'svelte';
  import { 
    toggleBlog, 
    toggleTag, 
    resetSelected, 
    selectedBlogs, 
    selectedTags,
    selectedCategory,
    currentPage,
    updateSearchStateFromUrl,
    setPage,
    setCategory,
    setSearchQuery
  } from '$lib/stores/search';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import { store as postsStore } from '$lib/stores/posts';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import { currentUrl, updateUrl } from '$lib/stores/router';
  import { get } from 'svelte/store';
  import logger from '$lib/utils/ActivityLogger';

  // 상태 관리
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();
  let prevUrl = '';
  let initialLoadComplete = false; // 초기 로드 완료 플래그

  onMount(() => {
    const unsubscribe = tagsStore.subscribe((tags) => {
      allTags = tags.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    });
    
    // 초기 URL 상태 반영
    prevUrl = window.location.href;
    
    // 먼저 필요한 데이터를 가져옵니다
    Promise.all([
      tagsStore.fetchTags(),
      techBlogsStore.fetchTechBlogs()
    ]).then(() => {
      // URL에서 검색 상태 복원
      updateSearchStateFromUrl();
      
      // 모든 상태 설정 후 한 번만 포스트 가져오기
      postsStore.fetchPosts();
      console.log('onMount fetchPosts');
      
      // 페이지 조회 로깅
      logger.logPageView('HOME', undefined);
      
      // 초기 URL 파라미터 로깅
      const category = get(selectedCategory);
      const page = get(currentPage);
      const blogs = get(selectedBlogs);
      const tags = get(selectedTags);
      
      if (category !== 'all' || page > 1 || blogs.length > 0 || tags.length > 0) {
        logger.logActivity({
          activityType: 'FILTER',
          targetType: 'HOME',
          extraData: {
            category,
            page,
            blogCount: blogs.length,
            tagCount: tags.length,
            initialLoad: true
          }
        });
      }
      
      // 초기 로드 완료 표시
      initialLoadComplete = true;
      
      // URL 설정 (이제 반응형 블록이 실행될 수 있음)
      currentUrl.set(window.location.href);
    });

    return () => {
      unsubscribe();
    };
  });

  $: {
    // 초기 로드가 완료된 후에만 URL 변경 감지 로직 실행
    if (initialLoadComplete && prevUrl !== $currentUrl) {
      console.log('URL changed:', prevUrl, '->', $currentUrl);
      
      // URL에서 검색 상태 업데이트
      updateSearchStateFromUrl();
      
      // 상태가 변경되었으므로 포스트 다시 가져오기
      postsStore.fetchPosts();
      
      prevUrl = $currentUrl;
    }
  }

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    // 현재 선택된 카테고리와 같고, 현재 페이지가 1이면 아무 작업도 하지 않음
    if (category === $selectedCategory && $currentPage === 1) {
      console.log('같은 카테고리 선택 & 1페이지 - 요청 무시');
      return;
    }
    
    // 카테고리 변경 로깅
    logger.logClick('CATEGORY', undefined, category, { 
      previousCategory: $selectedCategory,
      from: 'category_list'
    });
    
    // 카테고리 변경 및 페이지 리셋
    setCategory(category);
    setPage(1);
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    // 페이지 변경 로깅
    logger.logClick('PAGINATION', undefined, `Page ${page}`, { 
      previousPage: $currentPage,
      category: $selectedCategory,
      from: 'pagination_control'
    });
    
    // 페이지 변경
    setPage(page);
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
    
    // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
    const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
    window.scrollTo({
      top: 0,
      behavior: isMobile ? 'auto' : 'smooth'
    });
  }

  // 태그 토글
  const handleToggleTag = (tagName: string) => {
    // 태그 토글 로깅
    const isSelected = $selectedTags.includes(tagName);
    logger.logClick(isSelected ? 'TAG_UNSELECT' : 'TAG_SELECT', undefined, tagName, {
      totalSelected: isSelected ? $selectedTags.length - 1 : $selectedTags.length + 1
    });
    
    toggleTag(tagName);
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };

  // 블로그 토글
  const handleToggleBlog = (blog: { name: string; avatar: string }) => {
    // 블로그 토글 로깅
    const isSelected = $selectedBlogs.some(b => b.name === blog.name);
    logger.logClick(isSelected ? 'BLOG_UNSELECT' : 'BLOG_SELECT', undefined, blog.name, {
      totalSelected: isSelected ? $selectedBlogs.length - 1 : $selectedBlogs.length + 1
    });
    
    toggleBlog(blog);
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };

  // 검색 및 초기화 함수
  const handleSearch = (event: CustomEvent<{query: string}>) => {
    // 검색 로깅
    logger.logSearch(event.detail.query, 'POSTS');
    
    setSearchQuery(event.detail.query);
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };

  const searchWithSelected = () => {
    // 필터 적용 검색 로깅
    logger.logClick('SEARCH_WITH_FILTERS', undefined, `Filters: ${$selectedBlogs.length} blogs, ${$selectedTags.length} tags`, {
      blogCount: $selectedBlogs.length,
      tagCount: $selectedTags.length,
      category: $selectedCategory
    });
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };

  const handleResetSelected = () => {
    // 필터 초기화 로깅
    logger.logClick('RESET_FILTERS', undefined, 'Reset all filters', {
      previousBlogCount: $selectedBlogs.length,
      previousTagCount: $selectedTags.length,
      previousCategory: $selectedCategory
    });
    
    resetSelected();
    
    // URL 업데이트
    updateUrl();
    
    // 데이터 가져오기
    postsStore.fetchPosts();
  };
</script>

<MainLayout
  {allTags}
  {searchWithSelected}
  onSearch={handleSearch}
  onReset={handleResetSelected}
>
  <CategoryList currentCategory={$selectedCategory} {selectCategory} />
  <PostList
    posts={$postsStore.posts}
    currentPage={$currentPage}
    totalPages={$postsStore.totalPages}
    {goToPage}
    toggleTag={handleToggleTag}
    toggleBlog={handleToggleBlog}
    {loadedImages}
    loading={$postsStore.isLoading}
  />
</MainLayout> 