<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/config';
  import { currentPath, navigate } from '$lib/stores/router';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { Bot, ExternalLink, Undo2, Server, Home, Palette, GitBranch, Network, Wind, Share2, Eye } from 'lucide-svelte';
  import type { ComponentType, SvelteComponent } from 'svelte';
  import { toast } from "svelte-sonner";
  import logger from '$lib/utils/ActivityLogger';
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils.js";

  import MainLayout from "$lib/components/layout/MainLayout.svelte";

  let post: {
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
    viewCnt?: number;
  } | null = null;

  let loading = true;
  let error: string | null = null;

  // 카테고리별 아이콘 매핑
  const categoryIcons: Record<string, ComponentType<SvelteComponent>> = {
    "Frontend": Palette,
    "Backend": Server,
    "AI": Bot,
    "DevOps": GitBranch,
    "Architecture": Network,
    "Else": Wind,
    "All": Home
  };

  // 카테고리에 맞는 아이콘 컴포넌트 반환
  function getCategoryIcon(category: string): ComponentType<SvelteComponent> {
    return categoryIcons[category] || Wind; // 기본값으로 Wind 아이콘 사용
  }

  onMount(() => {
    techBlogsStore.fetchTechBlogs();
  });

  async function fetchPost(postId: string) {
    try {
      loading = true;
      const response = await fetch(getApiUrl(`/api/post/${postId}`));
      if (!response.ok) throw new Error('포스트를 불러오는데 실패했습니다.');
      post = await response.json();
      
      // 페이지 조회 로깅
      if (post) {
        logger.logPageView('POST', post.id);
      }
      
      // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
      const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
      window.scrollTo({ 
        top: 0, 
        behavior: isMobile ? 'auto' : 'smooth' 
      });
    } catch (e) {
      error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }

  $: {
    const postId = $currentPath.split('/').pop();
    if (postId) {
      fetchPost(postId);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleOriginalPostClick() {
    if (post?.url) {
      // 원문 클릭 로깅
      logger.logClick('ORIGINAL_POST', post.id, post.title, {   
        blogName: post.techBlogName,
        url: post.url
      });
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  }

  function handleBackClick() {
    // 뒤로가기 클릭 로깅
    if (post) {
      logger.logClick('BACK_BUTTON', post.id, '뒤로가기', { page: 'post' });
    }
    window.history.back();
  }

  function handleCategoryClick(category: string | undefined) {
    if (category) {
      // 카테고리 클릭 로깅
      logger.logClick('CATEGORY', undefined, category, { from: 'post_detail' });
      navigate(`/?page=1&category=${category.toLowerCase()}`);
    }
  }

  // 블로그 상세 페이지로 이동하는 함수 추가
  function navigateToBlog(blogName: string | undefined) {
    if (blogName) {
      // 블로그 이름 클릭 로깅
      logger.logClick('TECH_BLOG', undefined, blogName, { from: 'post_detail' });
      
      // techBlogMap에서 블로그 ID 찾기
      const blogInfo = $techBlogMap[blogName];
      if (blogInfo && blogInfo.id) {
        navigate(`/blog/${blogInfo.id}`);
      } else {
        console.error(`블로그 정보를 찾을 수 없음: ${blogName}`);
      }
    }
  }

  // 공유 기능 추가
  function handleShareClick() {
    if (post) {
      // 공유하기 클릭 로깅
      logger.logClick('SHARE_BUTTON', post.id, post.title, { 
        blogName: post.techBlogName
      });
      
      const shareUrl = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("URL이 클립보드에 복사되었습니다.", {
            description: "이 포스트를 다른 사람과 공유해보세요!",
            duration: 3000
          });
        })
        .catch(() => {
          toast.error("URL 복사에 실패했습니다.", {
            description: "다시 시도해주세요.",
            duration: 3000
          });
        });
    }
  }

  // 태그 클릭 핸들러 추가
  function handleTagClick(tag: string) {
    logger.logClick('TAG', undefined, tag, { from: 'post_detail' });
    navigate(`/?tags=${tag}`);
  }

  // 검색 관련 함수들
  const searchWithSelected = () => {};
  const onSearch = () => {};
  const onReset = () => {};
</script>

<svelte:head>
  {#if post}
    <title>{post.title} - {post.techBlogName} | Velopers</title>
    <meta name="title" property="og:title" content={`${post.title} - ${post.techBlogName}`} />
    <meta name="description" property="og:description" content={post.preview} />
    <meta name="image" property="og:image" content={post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : 'https://www.velopers.kr/default-post-image.jpg') : `/icons/${$techBlogMap[post.techBlogName]?.icon}`} />
    <meta name="type" property="og:type" content="article" />
    <meta name="url" property="og:url" content={`https://www.velopers.kr/post/${post.id}`} />
    <meta name="site_name" property="og:site_name" content="Velopers" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="article:published_time" content={new Date(post.createdAt).toISOString()} />
    <meta property="article:section" content={post.category || '기술 블로그'} />
    <meta property="article:publisher" content="https://www.velopers.kr" />
    <meta property="article:author" content={post.techBlogName} />
    {#if post.tags && post.tags.length > 0}
      {#each post.tags as tag}
        <meta property="article:tag" content={tag} />
      {/each}
    {/if}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${post.title} - ${post.techBlogName}`} />
    <meta name="twitter:description" content={post.preview} />
    <meta name="twitter:image" content={post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : 'https://www.velopers.kr/default-post-image.jpg') : `/icons/${$techBlogMap[post.techBlogName]?.icon}`} />
    <meta name="keywords" content={post.tags.join(', ')} />
    <meta name="author" content={post.techBlogName} />
    <link rel="canonical" href={`https://www.velopers.kr/post/${post.id}`} />
  {/if}
</svelte:head>

{#if loading}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <div class="max-w-4xl mx-auto p-3 sm:p-4 md:p-5 space-y-4">
      <Skeleton class="w-full h-48 sm:h-64 md:h-72 rounded-lg" />
      <Skeleton class="w-2/3 h-8 sm:h-10" />
      <Skeleton class="w-full h-72 sm:h-80 md:h-96 rounded-lg" />
    </div>
  </MainLayout>
{:else if error}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <div class="max-w-4xl mx-auto p-3 sm:p-4 md:p-5">
      <div class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-sm">
        <p>{error}</p>
      </div>
    </div>
  </MainLayout>
{:else if post}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <article class="max-w-4xl mx-auto p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-5 md:space-y-6 mb-4 sm:mb-6">
      <div class="w-full h-48 sm:h-64 md:h-72 relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <img 
          src={post.imageUrl ? post.imageUrl : `/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
          alt={post.title}
          class="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          fetchpriority="high"
        />
      </div>

      <header class="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-800 hover:shadow-md transition-all duration-300">
        <h1 class="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          {post.title}
        </h1>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 md:gap-4">
          <!-- 블로그명과 카테고리 그룹 -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <!-- 블로그 이름 -->
            <div 
              class="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-300 dark:border-gray-700 h-8 sm:h-9"
              on:click={() => post && navigateToBlog(post.techBlogName)}
              on:keydown={(e) => post && e.key === 'Enter' && navigateToBlog(post.techBlogName)}
              role="button"
              tabindex={0}
            >
              <img 
                src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
                alt={post.techBlogName}
                class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full mr-1.5 sm:mr-2"
                loading="lazy"
              />
              <span class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium hover:text-blue-500 transition-colors">
                {post.techBlogName}
              </span>
            </div>
            
            {#if post.category}
              <div 
                class="flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 border border-blue-200 dark:border-blue-800 h-8 sm:h-9"
                on:click={() => post && post.category && handleCategoryClick(post.category)}
                on:keydown={(e) => post && post.category && e.key === 'Enter' && handleCategoryClick(post.category)}
                role="button"
                tabindex={0}
              >
                <span class="flex items-center gap-1 sm:gap-1.5 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                  <svelte:component 
                    this={getCategoryIcon(post.category)} 
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                    strokeWidth={1.5}
                  />
                  {post.category}
                </span>
              </div>
            {/if}
          </div>
          
          <!-- 날짜와 조회수 그룹 -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <time class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
              {formatDate(post.createdAt)}
            </time>
            
            {#if post.viewCnt !== undefined}
              <div class="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" strokeWidth={1.5} />
                <span>{post.viewCnt.toLocaleString()}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- 태그 리스트 -->
        <div class="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
          {#each post.tags as tag}
            <Button 
              variant="outline"
              size="sm"
              class={cn(
                "px-3 py-[0.3rem] h-auto font-normal text-xs sm:text-sm transition-all duration-300",
                "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
              )}
              on:click={() => handleTagClick(tag)}
            >
              {tag}
            </Button>
          {/each}
        </div>
      </header>

      {#if !post.gptSummary || post.gptSummary.length <= 10}
        <div class="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-5 shadow-sm dark:ring-1 dark:ring-gray-800">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-yellow-600 dark:text-yellow-400">
            <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="font-semibold text-xs sm:text-sm">AI 요약 불가</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
            게시글에서 제공된 내용이 적어 요약이 불가능합니다. 하단의 원문 보기를 클릭해서 읽어주세요.
          </p>
        </div>
      {:else}
        <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-5 shadow-sm dark:ring-1 dark:ring-gray-800">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-blue-600 dark:text-blue-400">
            <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="font-semibold text-xs sm:text-sm">AI 요약</span>
          </div>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-5 md:mb-6">
            이 글은 AI가 원문을 분석하여 핵심 내용을 요약한 것입니다.
          </p>
          <div class="prose dark:prose-invert max-w-none prose-xs sm:prose-sm prose-headings:text-sm sm:prose-headings:text-base prose-h1:text-base sm:prose-h1:text-lg prose-h2:text-sm sm:prose-h2:text-base">
            {@html post.gptSummary}
          </div>
        </div>
      {/if}

      <div class="flex justify-center items-center gap-2 sm:gap-4 md:gap-6">
        <Button
          on:click={handleBackClick}
          class="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center text-sm min-w-[110px]"
          role="button"
          tabindex={0}
        >
          <Undo2 class="mr-1.5 h-4 w-4" />
          <span>뒤로가기</span>
        </Button>
        <Button
          on:click={handleShareClick}
          class="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center text-sm min-w-[110px]"
          role="button"
          tabindex={0}
        >
          <Share2 class="mr-1.5 h-4 w-4" />
          <span>공유하기</span>
        </Button>
        <Button
          on:click={handleOriginalPostClick}
          class="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center text-sm min-w-[110px]"
          role="button"
          tabindex={0}
        >
          <ExternalLink class="mr-1.5 h-4 w-4" />
          <span>원문 보기</span>
        </Button>
      </div>
    </article>
  </MainLayout>
{/if}

<style lang="postcss">
  :global(.prose) {
    color: rgb(31, 41, 55);
  }
  :global(.dark .prose) {
    color: rgb(229, 231, 235);
  }
  :global(.prose h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  :global(.prose h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  :global(.prose h4) {
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  :global(.prose p) {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  :global(.prose ul) {
    list-style-type: disc;
    list-style-position: inside;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  :global(.prose li) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  /* 모바일 환경에서 헤딩 크기 강제 조정 */
  @media (max-width: 640px) {
    :global(.prose h1) {
      font-size: 1.1rem !important;
      margin-top: 1.2rem !important;
      margin-bottom: 0.8rem !important;
    }
    :global(.prose h2) {
      font-size: 1rem !important;
      margin-top: 1rem !important;
      margin-bottom: 0.6rem !important;
    }
    :global(.prose h3) {
      font-size: 0.9rem !important;
      margin-top: 0.8rem !important;
      margin-bottom: 0.5rem !important;
    }
    :global(.prose h4, .prose h5, .prose h6) {
      font-size: 0.85rem !important;
      margin-top: 0.7rem !important;
      margin-bottom: 0.4rem !important;
    }
  }
</style> 