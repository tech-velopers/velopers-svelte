<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/config';
  import { currentPath, navigate, updateMetaTags } from '$lib/stores/router';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { Bot, SquareArrowOutUpRight, Undo2, Server, Home, Palette, GitBranch, Network, Wind, Share2 } from 'lucide-svelte';
  import type { ComponentType, SvelteComponent } from 'svelte';
  import { toast } from "svelte-sonner";

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
    createdAt: number[];
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
      
      // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
      const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
      window.scrollTo({ 
        top: 0, 
        behavior: isMobile ? 'auto' : 'smooth' 
      });

      // 메타 태그 업데이트
      if (post) {
        updateMetaTags({
          title: `${post.title} - ${post.techBlogName} | Velopers`,
          meta: [
            { key: '1', property: 'og:title', content: `${post.title} - ${post.techBlogName}` },
            { key: '2', property: 'og:description', content: post.preview },
            { key: '3', property: 'og:image', content: post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : 'https://www.velopers.kr/default-post-image.jpg') : `/icons/${$techBlogMap[post.techBlogName]?.icon}` },
            { key: '4', property: 'og:type', content: 'article' },
            { key: '5', property: 'og:url', content: `https://www.velopers.kr/post/${post.id}` },
            { key: '6', property: 'og:site_name', content: 'Velopers' },
            { key: '7', property: 'og:locale', content: 'ko_KR' },
            { key: '8', property: 'article:published_time', content: new Date(post.createdAt[0], post.createdAt[1] - 1, post.createdAt[2]).toISOString() },
            { key: '9', property: 'article:section', content: post.category || '기술 블로그' },
            { key: '10', property: 'article:publisher', content: 'https://www.velopers.kr' },
            { key: '11', property: 'article:author', content: post.techBlogName },
            { key: '12', name: 'twitter:card', content: 'summary_large_image' },
            { key: '13', name: 'twitter:title', content: `${post.title} - ${post.techBlogName}` },
            { key: '14', name: 'twitter:description', content: post.preview },
            { key: '15', name: 'twitter:image', content: post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : 'https://www.velopers.kr/default-post-image.jpg') : `/icons/${$techBlogMap[post.techBlogName]?.icon}` },
            { key: '16', name: 'keywords', content: post.tags.join(', ') },
            { key: '17', name: 'author', content: post.techBlogName },
            ...post.tags.map((tag, i) => ({ key: `tag-${i}`, property: 'article:tag', content: tag }))
          ],
          links: [
            { rel: 'canonical', href: `https://www.velopers.kr/post/${post.id}` }
          ]
        });
      }
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

  function formatDate(date: number[]): string {
    const [year, month, day] = date;
    return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleOriginalPostClick() {
    if (post?.url) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  }

  function handleBackClick() {
    window.history.back();
  }

  function handleCategoryClick(category: string | undefined) {
    if (category) {
      navigate(`/?page=1&category=${category.toLowerCase()}`);
    }
  }

  // 블로그 상세 페이지로 이동하는 함수 추가
  function navigateToBlog(blogName: string | undefined) {
    if (blogName) {
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

  // 검색 관련 함수들
  const searchWithSelected = () => {};
  const onSearch = () => {};
  const onReset = () => {};
</script>

{#if loading}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <div class="max-w-4xl mx-auto p-4 space-y-4">
      <Skeleton class="w-full h-64" />
      <Skeleton class="w-2/3 h-8" />
      <Skeleton class="w-full h-96" />
    </div>
  </MainLayout>
{:else if error}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    </div>
  </MainLayout>
{:else if post}
  <MainLayout allTags={[]} {searchWithSelected} {onSearch} {onReset} showLogo={false} showSidebar={false}>
    <article class="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div class="w-full h-48 sm:h-64 relative rounded-xl overflow-hidden">
        <img 
          src={post.imageUrl ? post.imageUrl : `/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
          alt={post.title}
          class="w-full h-full object-cover"
        />
      </div>

      <header class="space-y-3 sm:space-y-4">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {post.title}
        </h1>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- 블로그 이름 클릭 시 블로그 상세 페이지로 이동 -->
          <div 
            class="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            on:click={() => post && navigateToBlog(post.techBlogName)}
            on:keydown={(e) => post && e.key === 'Enter' && navigateToBlog(post.techBlogName)}
            role="button"
            tabindex="0"
          >
            <img 
              src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
              alt={post.techBlogName}
              class="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1.5 sm:mr-2"
            />
            <span class="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">{post.techBlogName}</span>
          </div>
          
          {#if post.category}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
              class="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              on:click={() => post && post.category && handleCategoryClick(post.category)}
              role="button"
              tabindex="0"
            >
              <span class="flex items-center gap-1 sm:gap-1.5 text-blue-700 dark:text-blue-400 text-xs sm:text-sm font-medium">
                <svelte:component 
                  this={getCategoryIcon(post.category)} 
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                  strokeWidth={1.5}
                />
                {post.category}
              </span>
            </div>
          {/if}
          
          <time class="text-gray-500 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
            {formatDate(post.createdAt)}
          </time>
        </div>

        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          {#each post.tags as tag}
            <span class="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
              {tag}
            </span>
          {/each}
        </div>
      </header>

      {#if !post.gptSummary || post.gptSummary.length <= 10}
        <div class="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-yellow-600 dark:text-yellow-400">
            <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="font-semibold text-sm sm:text-base">AI 요약 불가</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            게시글에서 제공된 내용이 적어 요약이 불가능합니다. 하단의 원문 보기를 클릭해서 읽어주세요.
          </p>
        </div>
      {:else}
        <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-8">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-blue-600 dark:text-blue-400">
            <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="font-semibold text-sm sm:text-base">AI 요약</span>
          </div>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            이 글은 AI가 원문을 분석하여 핵심 내용을 요약한 것입니다.
          </p>
          <div class="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            {@html post.gptSummary}
          </div>
        </div>
      {/if}

      <div class="flex justify-center gap-2 sm:gap-4 pt-4 sm:pt-8">
        <button
          on:click={handleBackClick}
          class="px-3 py-2 sm:px-6 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
        >
          <Undo2 class="h-4 w-4 sm:h-5 sm:w-5" />
          <span>목록으로</span>
        </button>
        <button
          on:click={handleShareClick}
          class="px-3 py-2 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
        >
          <Share2 class="h-4 w-4 sm:h-5 sm:w-5" />
          <span>공유하기</span>
        </button>
        <button
          on:click={handleOriginalPostClick}
          class="px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
        >
          <span>원문 보기</span>
          <SquareArrowOutUpRight class="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </article>
  </MainLayout>
{/if}

<style>
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
</style> 