<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { Bot, ExternalLink, Undo2, Server, Home, Palette, GitBranch, Network, Wind, Share2, Eye } from 'lucide-svelte';
  import type { ComponentType, SvelteComponent } from 'svelte';
  import { toast } from "svelte-sonner";
  import logger from '$lib/utils/ActivityLogger';
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { formatDate, dateArrayToISOString } from '$lib/utils/dateUtils';
  import type { PageData } from './$types';

  import MainLayout from "$lib/components/layout/MainLayout.svelte";

  export let data: PageData;
  
  $: post = data.post;
  let imageLoaded = false;

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

  function handleImageLoad() {
    imageLoaded = true;
  }

  onMount(() => {
    techBlogsStore.fetchTechBlogs();
    
    // 페이지 조회 로깅
    if (post) {
      logger.logPageView('POST', post.id);
    }
    
    // 즉시 맨 위로 스크롤
    window.scrollTo(0, 0);
  });

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
      goto(`/?page=1&category=${category.toLowerCase()}`);
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
        goto(`/blog/${blogInfo.id}`);
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
    goto(`/?tags=${tag}`);
  }

  // 연관 게시글 클릭 핸들러 추가
  function handleRelatedPostClick(relatedPost: any) {
    logger.logClick('RELATED_POST', relatedPost.id, relatedPost.title, {
      from: 'post_detail',
      techBlogName: relatedPost.techBlogName,
      currentPostId: post?.id,
      currentPostTitle: post?.title
    });
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
    <meta property="og:image" content={post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `https://www.velopers.kr${post.imageUrl}`) : `https://www.velopers.kr/icons/${$techBlogMap[post.techBlogName]?.icon}`} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://www.velopers.kr/post/${post.id}`} />
    <meta property="og:site_name" content="Velopers" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="article:published_time" content={dateArrayToISOString(post.createdAt)} />
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
    <meta name="twitter:image" content={post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `https://www.velopers.kr${post.imageUrl}`) : `https://www.velopers.kr/icons/${$techBlogMap[post.techBlogName]?.icon}`} />
    <meta name="keywords" content={post.tags.join(', ')} />
    <meta name="author" content={post.techBlogName} />
    <link rel="canonical" href={`https://www.velopers.kr/post/${post.id}`} />
  {/if}
</svelte:head>

{#if post}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <article class="max-w-4xl mx-auto pt-2 pb-3 sm:pt-3 sm:pb-4 md:pt-4 md:pb-5 px-3 sm:px-4 md:px-5 space-y-4 sm:space-y-5 md:space-y-6">
      <div class="w-full h-48 sm:h-64 md:h-72 relative rounded-lg overflow-hidden shadow-sm border dark:ring-1 dark:ring-gray-800 transition-all duration-300">
        {#if !imageLoaded}
          <Skeleton class="w-full h-full" />
        {/if}
        <img 
          src={post.imageUrl ? post.imageUrl : `/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
          alt={post.title}
          class={cn(
            "w-full h-full object-cover",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          decoding="async"
          fetchpriority="high"
          on:load={handleImageLoad}
        />
      </div>

      <header class="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-5 bg-card text-card-foreground rounded-lg border shadow-sm dark:ring-1 dark:ring-gray-800 transition-all duration-300">
        <button 
          class="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-flex items-center gap-2 text-left bg-transparent border-none p-0 w-full"
          on:click={handleOriginalPostClick}
          aria-label="원문 링크로 이동"
        >
          {post.title}
          <ExternalLink class="h-5 w-5 sm:h-6 sm:w-6 text-current opacity-60" />
        </button>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 md:gap-4">
          <!-- 블로그명과 카테고리 그룹 -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <!-- 블로그 이름 -->
            <button 
              class="flex items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors duration-300 h-9"
              on:click={() => post && navigateToBlog(post.techBlogName)}
              tabindex={0}
            >
              <img 
                src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
                alt={post.techBlogName}
                class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full mr-1.5 sm:mr-2"
                loading="lazy"
              />
              <span class="text-xs sm:text-sm font-medium">
                {post.techBlogName}
              </span>
            </button>
            
            {#if post.category}
              <button 
                class="flex items-center px-3 py-2 rounded-md border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-600 transition-colors duration-300 h-9"
                on:click={() => post && post.category && handleCategoryClick(post.category)}
                tabindex={0}
              >
                <svelte:component 
                  this={getCategoryIcon(post.category)} 
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" 
                  strokeWidth={1.5}
                />
                <span class="text-xs sm:text-sm font-medium">
                  {post.category}
                </span>
              </button>
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
        <div class="flex flex-wrap gap-1.5">
          {#each post.tags as tag}
            <Button 
              variant="outline"
              size="sm"
              class={cn(
                "px-3 py-[0.3rem] h-auto font-normal text-xs sm:text-sm transition-colors border",
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
        <div class="bg-card p-3 sm:p-4 md:p-5 rounded-lg border shadow-sm dark:ring-1 dark:ring-gray-800 transition-all duration-300">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-yellow-600 dark:text-yellow-400">
            <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="font-semibold text-xs sm:text-sm">AI 요약 불가</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
            게시글에서 제공된 내용이 적어 요약이 불가능합니다. 하단의 원문 보기를 클릭해서 읽어주세요.
          </p>
        </div>
      {:else}
        <div class="bg-card p-3 sm:p-4 md:p-5 rounded-lg border shadow-sm dark:ring-1 dark:ring-gray-800 transition-all duration-300">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-blue-500 dark:text-blue-400">
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

      {#if data.relatedPosts && data.relatedPosts.length > 0}
        <section class="my-4 sm:my-5 md:my-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-5 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span>연관 게시글</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {#each data.relatedPosts as relatedPost (relatedPost.id)}
              <a href={`/post/${relatedPost.id}`} 
                 class="flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden dark:ring-1 dark:ring-gray-800 group"
                 on:click={() => handleRelatedPostClick(relatedPost)}>
                <div class="w-full h-32 sm:h-36 relative flex-shrink-0">
                  <img 
                    src={relatedPost.imageUrl ? relatedPost.imageUrl : `/icons/${$techBlogMap[relatedPost.techBlogName]?.icon}`}
                    alt={relatedPost.title}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="p-3 sm:p-4 flex flex-col flex-grow">
                  <h3 class="font-semibold text-sm sm:text-base leading-snug group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate-2-lines">
                    {relatedPost.title}
                  </h3>
                  <div class="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div class="flex items-center gap-1.5 truncate">
                      <img 
                        src={`/icons/${$techBlogMap[relatedPost.techBlogName]?.icon}`} 
                        alt={relatedPost.techBlogName}
                        class="w-4 h-4 rounded-full flex-shrink-0"
                        loading="lazy"
                      />
                      <span class="truncate">{relatedPost.techBlogName}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      {#if relatedPost.viewCnt}
                        <span class="flex items-center">
                          <Eye class="w-3.5 h-3.5 mr-0.5" strokeWidth={1.5} />
                          {relatedPost.viewCnt.toLocaleString()}
                        </span>
                      {/if}
                      <time>{formatDate(relatedPost.createdAt)}</time>
                    </div>
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Advertisement -->
      <div class="w-full my-4 sm:my-5 md:my-6 text-center">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2560054260004649"
             crossorigin="anonymous"></script>
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-2560054260004649"
             data-ad-slot="4577187600"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>

      <div class="flex justify-center items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          on:click={handleBackClick}
          class="px-3 py-2 h-9 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors duration-300 flex items-center text-sm"
          tabindex={0}
        >
          <Undo2 class="mr-1.5 h-4 w-4" />
          <span>뒤로가기</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          on:click={handleShareClick}
          class="px-3 py-2 h-9 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors duration-300 flex items-center text-sm"
          tabindex={0}
        >
          <Share2 class="mr-1.5 h-4 w-4" />
          <span>공유하기</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          on:click={handleOriginalPostClick}
          class="px-3 py-2 h-9 bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 hover:border-blue-600 transition-colors duration-300 flex items-center text-sm"
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
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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