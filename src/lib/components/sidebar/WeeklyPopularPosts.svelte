<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { navigate } from '$lib/stores/router';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { TrendingUp } from 'lucide-svelte';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import logger from '$lib/utils/ActivityLogger';

  type WeeklyPost = {
    id: number;
    title: string;
    preview: string;
    gptSummary: string;
    imageUrl: string;
    url: string;
    techBlogName: string;
    category: string;
    tags: string[];
    createdAt: number[];
    viewCnt: number;
  };

  let weeklyPosts: WeeklyPost[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      // 테크블로그 정보 로드
      await techBlogsStore.fetchTechBlogs();
      
      // 주간 인기 게시글 가져오기
      const response = await fetch(getApiUrl(API_ENDPOINTS.weeklyPosts));
      if (!response.ok) throw new Error('주간 인기 게시글을 불러오는데 실패했습니다.');
      
      weeklyPosts = await response.json();
      loading = false;
    } catch (e) {
      console.error('주간 인기 게시글 로딩 오류:', e);
      error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      loading = false;
    }
  });

  // 게시글 상세 페이지로 이동
  function navigateToPost(postId: number, post: WeeklyPost) {
    // 게시글 클릭 로깅
    logger.logClick('POST_CARD', postId, post.title, {
      techBlogName: post.techBlogName,
      from: 'weekly_popular_posts',
      viewCnt: post.viewCnt,
      location: 'sidebar'
    });
    
    navigate(`/post/${postId}`);
  }

  // 블로그 상세 페이지로 이동
  function navigateToBlog(blogName: string) {
    const blogInfo = $techBlogMap[blogName];
    if (blogInfo && blogInfo.id) {
      // 블로그 클릭 로깅
      logger.logClick('TECH_BLOG', blogInfo.id, blogName, {
        from: 'weekly_popular_posts',
        location: 'sidebar'
      });
      
      navigate(`/blog/${blogInfo.id}`);
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return '정보 없음';
    
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md dark:ring-1 dark:ring-gray-700">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-base font-medium dark:text-white flex items-center gap-2">
      <TrendingUp class="text-red-500 dark:text-red-400" size={18} />
      주간 인기 게시글
    </h3>
  </div>

  {#if loading}
    <div class="space-y-3">
      {#each Array(5) as _, i}
        <div class="flex gap-2">
          <div class="flex-shrink-0 w-5 text-center">
            <Skeleton class="h-5 w-5 rounded-full" />
          </div>
          <div class="flex-1">
            <Skeleton class="h-5 w-full" />
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <p class="text-red-500 dark:text-red-400 text-sm">{error}</p>
  {:else if weeklyPosts.length === 0}
    <p class="text-gray-500 dark:text-gray-400 text-sm">주간 인기 게시글이 없습니다.</p>
  {:else}
    <ul class="space-y-3">
      {#each weeklyPosts as post, index}
        <li>
          <div class="flex gap-2">
            <div class="flex-shrink-0 w-5 text-center">
              <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">{index + 1}</span>
            </div>
            <div class="flex-1">
              <!-- 게시글 제목 (클릭 시 게시글 상세 페이지로 이동) -->
              <button 
                class="text-sm text-left text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium line-clamp-2 transition-colors w-full"
                on:click={() => navigateToPost(post.id, post)}
              >
                {post.title}
              </button>
              
              <!-- 블로그 정보 (클릭 시 블로그 상세 페이지로 이동) -->
              <div class="flex items-center mt-1">
                <button 
                  class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  on:click|stopPropagation={() => navigateToBlog(post.techBlogName)}
                >
                  <img 
                    src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
                    alt={post.techBlogName}
                    class="w-4 h-4 rounded-full"
                  />
                  <span class="text-xs">
                    {post.techBlogName}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div> 