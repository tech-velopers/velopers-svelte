<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import PostCard from '$lib/components/main/PostCard.svelte';
  import { Sparkles, Search, ArrowLeft } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import logger from '$lib/utils/ActivityLogger';
  import { API_ENDPOINTS, getApiUrl } from '$lib/config';

  interface AISearchPost {
    id: number;
    title: string;
    preview: string;
    gptSummary: string;
    twoLineSummary: string;
    imageUrl: string;
    url: string;
    techBlogName: string;
    category: string;
    tags: string[];
    createdAt: number[];
    viewCnt: number;
    score: number | null;
  }

  let isLoading = false;
  let searchResults: AISearchPost[] = [];
  let query = '';
  let error = '';
  let loadedImages = new Set<string>();

  // URL 파라미터 변경을 감지하여 새로운 검색 수행
  $: {
    const urlParams = new URLSearchParams($page.url.search);
    const newQuery = urlParams.get('query') || '';
    
    // 쿼리가 변경되었을 때만 새로운 검색 수행
    if (newQuery && newQuery !== query) {
      query = newQuery;
      performAISearch(query);
    } else if (newQuery && !query) {
      // 초기 로드 시
      query = newQuery;
      performAISearch(query);
    }
  }

  onMount(() => {
    logger.logActivity({
      activityType: 'VIEW',
      targetType: 'AI_SEARCH',
      extraData: {
        query: query
      }
    });
  });

  async function performAISearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    isLoading = true;
    error = '';
    
    try {
      await logger.logActivity({
          activityType: 'SEARCH',
          targetType: 'AI_SEARCH',
          searchQuery: searchQuery,
          extraData: {
              from: 'ai_search_page',
              searchType: 'ai_embedding'
          }
      });

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.aiEmbedding}?query=${encodeURIComponent(searchQuery)}`));
      
      if (!response.ok) {
        throw new Error('AI 검색에 실패했습니다.');
      }
      
      const results = await response.json();
      searchResults = results;
      
      await logger.logActivity({
          activityType: 'SEARCH',
          targetType: 'AI_SEARCH_COMPLETED',
          searchQuery: searchQuery,
          extraData: {
              from: 'ai_search_page',
              resultCount: results.length
          }
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'AI 검색 중 오류가 발생했습니다.';
      
      await logger.logActivity({
          activityType: 'ERROR',
          targetType: 'AI_SEARCH_FAILED',
          searchQuery: searchQuery,
          extraData: {
              from: 'ai_search_page',
              error: error
          }
      });
    } finally {
      isLoading = false;
    }
  }

  function handleBackClick() {
    logger.logClick('BACK_BUTTON', undefined, 'AI 검색 결과에서 뒤로가기', {
      from: 'ai_search_page'
    });
    history.back();
  }

  // PostCard에서 필요한 핸들러들 (AI 검색에서는 비활성화)
  function handleTagToggle(tag: string) {
    // AI 검색 결과에서는 태그 토글 기능 비활성화
    logger.logClick('TAG_CLICK_DISABLED', undefined, tag, {
      from: 'ai_search_page',
      reason: 'tag_toggle_disabled_in_ai_search'
    });
  }

  function handleBlogToggle(blog: { name: string; avatar: string }) {
    // AI 검색 결과에서는 블로그 토글 기능 비활성화
  }
</script>

<svelte:head>
  <title>AI 검색: {query} - Velopers</title>
  <meta name="description" content="AI를 활용한 '{query}' 검색 결과" />
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-6xl">
  <!-- 헤더 영역 -->
  <div class="mb-8">
    <button
      on:click={handleBackClick}
      class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
    >
      <ArrowLeft class="h-4 w-4" />
      뒤로가기
    </button>

    <div class="flex items-center gap-3 mb-4">
      <div class="flex items-center gap-2">
        <Sparkles class="h-6 w-6 text-purple-500" />
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          AI 검색 결과
        </h1>
      </div>
    </div>

    {#if query}
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
        <Search class="h-4 w-4" />
        <span class="text-sm">검색어:</span>
        <span class="font-medium text-gray-900 dark:text-white">"{query}"</span>
      </div>
    {/if}
  </div>

  <!-- 로딩 상태 -->
  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">AI가 관련 게시글을 찾고 있습니다...</p>
    </div>
  {/if}

  <!-- 에러 상태 -->
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
      <div class="flex items-center gap-2">
        <div class="text-red-500">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-red-800 dark:text-red-200 font-medium">검색 오류</h3>
      </div>
      <p class="text-red-700 dark:text-red-300 mt-2">{error}</p>
    </div>
  {/if}

  <!-- 검색 결과 -->
  {#if !isLoading && !error}
    {#if searchResults.length > 0}
      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-300">
          <span class="font-medium text-purple-600 dark:text-purple-400">{searchResults.length}개</span>의 관련 게시글을 찾았습니다
        </p>
      </div>

      <div class="space-y-4">
        {#each searchResults as post (post.id)}
          <PostCard 
            {post} 
            toggleTag={handleTagToggle}
            toggleBlog={handleBlogToggle}
            {loadedImages}
            showBlogToggle={false}
            viewMode="detailed"
            showAISummary={false}
          />
        {/each}
      </div>
    {:else if query}
      <div class="text-center py-16">
        <Sparkles class="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          검색 결과가 없습니다
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          "{query}"와 관련된 게시글을 찾을 수 없습니다.<br />
          다른 검색어로 시도해보세요.
        </p>
        <button
          on:click={() => goto('/')}
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          홈으로 돌아가기
        </button>
      </div>
    {/if}
  {/if}
</div>