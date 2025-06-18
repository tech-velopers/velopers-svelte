<svelte:head>
  <title>주간 인기 게시글 | Velopers</title>
  <meta property="og:title" content="주간 인기 게시글 - Velopers" />
  <meta property="og:description" content="카테고리별로 인기 있는 기술 블로그 게시글을 확인해보세요. Frontend, Backend, AI, DevOps 등 다양한 분야의 트렌딩 게시글을 제공합니다." />
  <meta property="og:image" content="https://www.velopers.kr/velopers.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.velopers.kr/popular-posts" />
  <meta property="og:site_name" content="Velopers" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="주간 인기 게시글 - Velopers" />
  <meta name="twitter:description" content="카테고리별로 인기 있는 기술 블로그 게시글을 확인해보세요. Frontend, Backend, AI, DevOps 등 다양한 분야의 트렌딩 게시글을 제공합니다." />
  <meta name="twitter:image" content="https://www.velopers.kr/velopers.png" />
  <meta name="description" content="카테고리별로 인기 있는 기술 블로그 게시글을 확인해보세요. Frontend, Backend, AI, DevOps 등 다양한 분야의 트렌딩 게시글을 제공합니다." />
  <meta name="keywords" content="인기 게시글, 주간 인기, 기술 트렌드, Frontend, Backend, AI, DevOps, 개발자" />
  <link rel="canonical" href="https://www.velopers.kr/popular-posts" />
</svelte:head>

<script lang="ts">
  import { onMount } from "svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { selectedBlogs, selectedTags, resetSelected, toggleBlog, toggleTag } from '$lib/stores/search';
  import { goto } from '$app/navigation';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import { TrendingUp } from 'lucide-svelte';
  import logger from '$lib/utils/ActivityLogger';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import PostCard from '$lib/components/main/PostCard.svelte';
  import CategoryList from '$lib/components/main/CategoryList.svelte';

  type WeeklyPost = {
    id: number;
    title: string;
    preview: string;
    gptSummary: string;
    imageUrl: string | null;
    url: string;
    techBlogName: string;
    category: string;
    tags: string[];
    createdAt: number[];
    viewCnt: number;
    score: number;
  };

  type CategoryPosts = {
    [key: string]: WeeklyPost[];
  };

  let categoryPosts: CategoryPosts = {};
  let allCategories: string[] = [];
  let selectedCategory: string = 'all';
  let isLoading = true;
  let error: string | null = null;
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();

  // 카테고리 표시용 매핑 (소문자 -> 표시용)
  const categoryDisplayMap: {[key: string]: string} = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'ai': 'AI',
    'devops': 'DevOps',
    'architecture': 'Architecture',
    'else': 'else'
  };

  function setCategory(category: string) {
    selectedCategory = category;
    // 카테고리 선택 로깅
    logger.logClick('CATEGORY_SELECT', undefined, category, {
      from: 'popular_posts',
    });
  }

  // 주간 인기 포스트 데이터 가져오기
  onMount(() => {
    let tagsUnsubscribe: () => void;
    
    async function init() {
      try {
        // 테크블로그 정보 로드
        await techBlogsStore.fetchTechBlogs();
        
        // 태그 정보 로드
        tagsUnsubscribe = tagsStore.subscribe((value: Tag[]) => {
          allTags = value;
        });
        await tagsStore.fetchTags();
        
        // 주간 인기 게시글 카테고리별 데이터 가져오기
        const response = await fetch(getApiUrl(API_ENDPOINTS.weeklyPostsByCategory));
        if (!response.ok) throw new Error('주간 인기 게시글을 불러오는데 실패했습니다.');
        
        categoryPosts = await response.json();
        
        // 카테고리 순서 정의 (소문자로)
        const categoryOrder = ['frontend', 'backend', 'ai', 'devops', 'architecture', 'else'];
        
        // 가져온 카테고리를 정의된 순서대로 정렬
        allCategories = Object.keys(categoryPosts).sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.toLowerCase());
          const indexB = categoryOrder.indexOf(b.toLowerCase());
          
          // 두 카테고리가 모두 정의된 순서에 있으면 해당 순서대로 정렬
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // a만 정의된 순서에 있으면 a가 앞으로
          if (indexA !== -1) {
            return -1;
          }
          // b만 정의된 순서에 있으면 b가 앞으로
          if (indexB !== -1) {
            return 1;
          }
          // 둘 다 정의된 순서에 없으면 알파벳 순
          return a.localeCompare(b);
        });
        
        // 페이지 조회 로깅
        logger.logPageView('POPULAR_POSTS', undefined);
      } catch (e) {
        console.error('주간 인기 게시글 로딩 오류:', e);
        error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      } finally {
        isLoading = false;
      }
    }

    init();

    return () => {
      if (tagsUnsubscribe) tagsUnsubscribe();
    };
  });

  // 현재 선택된 카테고리의 포스트
  $: postsToShow = selectedCategory === 'all'
    ? Object.values(categoryPosts).flat()
    : categoryPosts[selectedCategory] || [];

  // 정렬된 포스트 (항상 score 기준 내림차순)
  $: sortedPosts = [...postsToShow].sort((a, b) => b.score - a.score);

  function searchWithSelected(data: any) {
    if ($selectedBlogs.length > 0 || $selectedTags.length > 0) {
      logger.logClick('FILTERED_SEARCH', undefined, `필터: ${$selectedBlogs.length}개 블로그, ${$selectedTags.length}개 태그`, {
        blogCount: $selectedBlogs.length,
        tagCount: $selectedTags.length
      });
    }
    goto('/');
  }

  function handleReset() {
    resetSelected();
  }

  // 태그 전환 핸들러
  function handleToggleTag(tag: string) {
    toggleTag(tag);
  }

  // 카테고리 표시명 가져오기
  function getCategoryDisplayName(category: string): string {
    return categoryDisplayMap[category.toLowerCase()] || category;
  }
  
  // 검색 핸들러 (빈 함수로 유지, MainLayout에 필요함)
  function handleSearch() {
    // 실제 검색 기능은 구현하지 않음
  }
</script>

<MainLayout
  {allTags}
  {searchWithSelected}
  onSearch={handleSearch}
  onReset={handleReset}
  showLogo={true}
>
  <div class="flex flex-col gap-1 mb-6">
    <h1 class="text-2xl font-bold dark:text-white flex items-center gap-2">
      <TrendingUp class="text-red-500 dark:text-red-400" size={24} />
      주간 인기 게시글
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      카테고리별로 인기 있는 기술 블로그 게시글을 확인해보세요
    </p>
  </div>
  
  <!-- CategoryList 컴포넌트 사용 -->
  <CategoryList currentCategory={selectedCategory} selectCategory={setCategory} />
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center p-4">{error}</div>
  {:else if sortedPosts.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">표시할 게시글이 없습니다.</p>
    </div>
    
  {:else}
    <div class="space-y-4">
      {#each sortedPosts as post, index (post.id)}
        <div class="flex items-start">
          <div class="flex-shrink-0 w-12 flex justify-center items-start pt-4 mr-2">
            <span class="text-2xl font-bold text-blue-500 dark:text-blue-400">{index + 1}</span>
          </div>
          <div class="flex-1">
            <PostCard 
              post={{
                ...post, 
                imageUrl: post.imageUrl || '',
                createdAt: post.createdAt
              }} 
              toggleTag={handleToggleTag} 
              toggleBlog={toggleBlog} 
              {loadedImages} 
              showBlogToggle={true}
            />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</MainLayout>