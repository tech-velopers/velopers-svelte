<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/config';
  import { currentPath, navigate } from '$lib/stores/router';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { Bot } from 'lucide-svelte';

  let post: {
    id: number;
    title: string;
    preview: string;
    gptSummary: string;
    imageUrl: string;
    url: string;
    techBlogName: string;
    tags: string[];
    createdAt: number[];
  } | null = null;

  let loading = true;
  let error: string | null = null;

  onMount(() => {
    techBlogsStore.fetchTechBlogs();
  });

  async function fetchPost(postId: string) {
    try {
      loading = true;
      const response = await fetch(getApiUrl(`/api/post/${postId}`));
      if (!response.ok) throw new Error('포스트를 불러오는데 실패했습니다.');
      post = await response.json();
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
</script>

<svelte:head>
  {#if post}
    <title>{post.title} - {post.techBlogName} | Velopers</title>
    <meta name="description" content={post.preview} />
    <meta property="og:title" content={`${post.title} - ${post.techBlogName}`} />
    <meta property="og:description" content={post.preview} />
    <meta property="og:image" content={post.imageUrl} />
    <meta property="og:type" content="article" />
    <meta name="keywords" content={post.tags.join(', ')} />
    <meta name="author" content={post.techBlogName} />
    <link rel="canonical" href={`https://velopers.kr/post/${post.id}`} />
  {/if}
</svelte:head>

{#if loading}
  <div class="max-w-4xl mx-auto p-4 space-y-4">
    <Skeleton class="w-full h-64" />
    <Skeleton class="w-2/3 h-8" />
    <Skeleton class="w-full h-96" />
  </div>
{:else if error}
  <div class="max-w-4xl mx-auto p-4">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{error}</p>
    </div>
  </div>
{:else if post}
  <article class="max-w-4xl mx-auto p-4 space-y-6">
    <div class="w-full h-64 relative rounded-xl overflow-hidden">
      <img 
        src={post.imageUrl} 
        alt={post.title}
        class="w-full h-full object-cover"
      />
    </div>

    <header class="space-y-4">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {post.title}
      </h1>

      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <img 
            src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} 
            alt={post.techBlogName}
            class="w-8 h-8 rounded-full mr-2"
          />
          <span class="text-gray-700 dark:text-gray-300">{post.techBlogName}</span>
        </div>
        <span class="text-gray-500">•</span>
        <time class="text-gray-500">{formatDate(post.createdAt)}</time>
      </div>

      <div class="flex flex-wrap gap-2">
        {#each post.tags as tag}
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
            {tag}
          </span>
        {/each}
      </div>
    </header>

    <div class="bg-blue-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
      <div class="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
        <Bot class="h-5 w-5" />
        <span class="font-semibold">AI 요약</span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        이 글은 AI가 원문을 분석하여 핵심 내용을 요약한 것입니다.
      </p>
      <div class="prose dark:prose-invert max-w-none">
        {@html post.gptSummary}
      </div>
    </div>

    <div class="flex justify-center gap-4 pt-8">
      <button
        on:click={handleBackClick}
        class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        <span>목록으로</span>
      </button>
      <button
        on:click={handleOriginalPostClick}
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        <span>원문 보기</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </button>
    </div>
  </article>
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