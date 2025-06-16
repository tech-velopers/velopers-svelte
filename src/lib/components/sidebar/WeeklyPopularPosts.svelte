<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { goto } from '$app/navigation';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { TrendingUp, ExternalLink } from 'lucide-svelte';
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Button } from "$lib/components/ui/button";
  import * as Avatar from "$lib/components/ui/avatar";
  import { cn } from "$lib/utils";
  import logger from '$lib/utils/ActivityLogger';
  import { formatDateString } from '$lib/utils/dateUtils';

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
    createdAt: string;
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
    
    goto(`/post/${postId}`);
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
      
      goto(`/blog/${blogInfo.id}`);
    }
  }
</script>

<div class="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-base font-medium flex items-center gap-1.5">
      <TrendingUp class="text-orange-500 dark:text-orange-400" size={18} />
      <span>주간 인기 게시글</span>
    </h3>
    <Button 
      variant="ghost"
      size="sm"
      class="h-auto p-0 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-transparent"
      on:click={() => goto('/popular-posts')}
    >
      카테고리별 인기 게시글
    </Button>
  </div>

  {#if loading}
    <div class="space-y-2.5">
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
    <p class="text-sm text-destructive">{error}</p>
  {:else if weeklyPosts.length === 0}
    <p class="text-sm text-muted-foreground">주간 인기 게시글이 없습니다.</p>
  {:else}
    <ul class="space-y-3">
      {#each weeklyPosts as post, index}
        <li>
          <div class="flex gap-2">
            <div class="flex-shrink-0 w-5 text-center relative">
              <span class={cn(
                "text-sm font-semibold", 
                index === 0 ? "text-amber-500 dark:text-amber-400" : 
                index === 1 ? "text-zinc-500 dark:text-zinc-400" : 
                index === 2 ? "text-amber-700 dark:text-amber-600" : 
                "text-muted-foreground"
              )}>
                {index + 1}
              </span>
            </div>
            <div class="flex-1">
              <!-- 게시글 제목 (클릭 시 게시글 상세 페이지로 이동) -->
              <button 
                class="text-sm text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full font-medium line-clamp-1"
                on:click={() => navigateToPost(post.id, post)}
              >
                {post.title}
              </button>
              
              <!-- 블로그 정보 (클릭 시 블로그 상세 페이지로 이동) -->
              <div class="flex items-center mt-1">
                <button 
                  class="flex items-center gap-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  on:click={(e) => {
                    e.stopPropagation();
                    navigateToBlog(post.techBlogName);
                  }}
                >
                  <Avatar.Root class="h-4 w-4">
                    <Avatar.Image 
                      src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
                      alt={post.techBlogName}
                    />
                  </Avatar.Root>
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