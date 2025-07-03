<svelte:head>
  <title>Velopers - 국내 IT 기업 기술 블로그 모음</title>
  <meta property="og:title" content="Velopers - 국내 IT 기업 기술 블로그 모음" />
  <meta property="og:description" content="국내 주요 IT 기업들의 기술 블로그를 한 곳에서 확인하세요. 최신 기술 트렌드와 개발 인사이트를 제공합니다." />
  <meta property="og:image" content="https://www.velopers.kr/velopers.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.velopers.kr" />
  <meta property="og:site_name" content="Velopers" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Velopers - 국내 IT 기업 기술 블로그 모음" />
  <meta name="twitter:description" content="국내 주요 IT 기업들의 기술 블로그를 한 곳에서 확인하세요. 최신 기술 트렌드와 개발 인사이트를 제공합니다." />
  <meta name="twitter:image" content="https://www.velopers.kr/velopers.png" />
  <meta name="description" content="국내 주요 IT 기업들의 기술 블로그를 한 곳에서 확인하세요. 최신 기술 트렌드와 개발 인사이트를 제공합니다." />
  <meta name="keywords" content="기술 블로그, IT 기업, 개발자, 프로그래밍, 기술 트렌드, 네이버, 카카오, 쿠팡, 우아한형제들" />
  <link rel="canonical" href="https://www.velopers.kr" />
</svelte:head>

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
    setSearchQuery,
    getSearchParamsUrl
  } from '$lib/stores/search';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import { store as postsStore } from '$lib/stores/posts';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import logger from '$lib/utils/ActivityLogger';
  import type { PageData } from './$types';

  export let data: PageData;

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
    
    // 서버에서 받은 데이터로 store 초기화
    const serverData = data as any; // 타입 오류 임시 해결
    tagsStore.setData(serverData.allTags);
    techBlogsStore.setData(serverData.techBlogs);
    
    // 포스트 store 초기화
    postsStore.setData(serverData.posts, serverData.totalPages);
    
    // 검색 상태 초기화 (서버 데이터 기반)
    const { searchParams } = serverData;
    setPage(searchParams.page);
    setCategory(searchParams.category);
    setSearchQuery(searchParams.query);
    
    // 선택된 블로그들 초기화 (아바타 정보와 함께)
    if (searchParams.selectedBlogNames.length > 0) {
      const blogsWithAvatars = searchParams.selectedBlogNames
        .map(name => {
          const blog = serverData.techBlogs.find(b => b.techBlogName === name);
          return blog ? { name: blog.techBlogName, avatar: blog.icon } : null;
        })
        .filter(blog => blog !== null);
      selectedBlogs.set(blogsWithAvatars);
    }
    
    // 선택된 태그들 초기화
    selectedTags.set(searchParams.selectedTags);
    
    console.log('SSR data loaded');
    
    // 페이지 조회 로깅
    logger.logPageView('HOME', undefined);
    
    // 초기 URL 파라미터 로깅
    const category = searchParams.category;
    const page = searchParams.page;
    const blogs = searchParams.selectedBlogNames;
    const tags = searchParams.selectedTags;
    
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

    return () => {
      unsubscribe();
    };
  });

  $: {
    // 초기 로드가 완료된 후에만 URL 변경 감지 로직 실행
    if (initialLoadComplete && prevUrl !== $page.url.href) {
      console.log('URL changed:', prevUrl, '->', $page.url.href);
      
      // URL에서 검색 상태 업데이트
      updateSearchStateFromUrl();
      
      // 상태가 변경되었으므로 포스트 다시 가져오기
      postsStore.fetchPosts();
      
      prevUrl = $page.url.href;
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
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
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
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
    
    // 즉시 맨 위로 스크롤
    window.scrollTo(0, 0);
  }

  // 태그 토글
  const handleToggleTag = (tagName: string) => {
    // 태그 토글 로깅
    const isSelected = $selectedTags.includes(tagName);
    logger.logClick(isSelected ? 'TAG_UNSELECT' : 'TAG_SELECT', undefined, tagName, {
      totalSelected: isSelected ? $selectedTags.length - 1 : $selectedTags.length + 1
    });
    
    toggleTag(tagName);
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
  };

  // 블로그 토글
  const handleToggleBlog = (blog: { name: string; avatar: string }) => {
    // 블로그 토글 로깅
    const isSelected = $selectedBlogs.some(b => b.name === blog.name);
    logger.logClick(isSelected ? 'BLOG_UNSELECT' : 'BLOG_SELECT', undefined, blog.name, {
      totalSelected: isSelected ? $selectedBlogs.length - 1 : $selectedBlogs.length + 1
    });
    
    toggleBlog(blog);
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
  };

  // 검색 및 초기화 함수
  const handleSearch = (event: CustomEvent<{query: string}>) => {
    // 검색 로깅
    logger.logSearch(event.detail.query, 'POSTS');
    
    setSearchQuery(event.detail.query);
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
  };

  const searchWithSelected = () => {
    // 필터 적용 검색 로깅
    logger.logClick('SEARCH_WITH_FILTERS', undefined, `Filters: ${$selectedBlogs.length} blogs, ${$selectedTags.length} tags`, {
      blogCount: $selectedBlogs.length,
      tagCount: $selectedTags.length,
      category: $selectedCategory
    });
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
  };

  const handleResetSelected = () => {
    // 필터 초기화 로깅
    logger.logClick('RESET_FILTERS', undefined, 'Reset all filters', {
      previousBlogCount: $selectedBlogs.length,
      previousTagCount: $selectedTags.length,
      previousCategory: $selectedCategory
    });
    
    resetSelected();
    
    // URL 업데이트 (URL 변경 감지에서 자동으로 데이터 가져옴)
    goto(getSearchParamsUrl('/'), { replaceState: true });
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