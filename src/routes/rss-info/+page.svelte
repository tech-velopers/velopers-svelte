<svelte:head>
  <title>RSS 피드 안내 | Velopers</title>
  <meta property="og:title" content="RSS 피드 안내 - Velopers" />
  <meta property="og:description" content="Velopers RSS 피드를 구독하여 최신 기술 블로그 게시글을 놓치지 마세요. 전체 콘텐츠와 요약 RSS 두 가지 옵션을 제공합니다." />
  <meta property="og:image" content="https://www.velopers.kr/velopers.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.velopers.kr/rss-info" />
  <meta property="og:site_name" content="Velopers" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="RSS 피드 안내 - Velopers" />
  <meta name="twitter:description" content="Velopers RSS 피드를 구독하여 최신 기술 블로그 게시글을 놓치지 마세요. 전체 콘텐츠와 요약 RSS 두 가지 옵션을 제공합니다." />
  <meta name="twitter:image" content="https://www.velopers.kr/velopers.png" />
  <meta name="description" content="Velopers RSS 피드를 구독하여 최신 기술 블로그 게시글을 놓치지 마세요. 전체 콘텐츠와 요약 RSS 두 가지 옵션을 제공합니다." />
  <meta name="keywords" content="RSS 피드, RSS 구독, 기술 블로그 RSS, 요약 RSS, 전체 콘텐츠 RSS" />
  <link rel="canonical" href="https://www.velopers.kr/rss-info" />
</svelte:head>

<script lang="ts">
  import { ArrowUpRight, Copy } from 'lucide-svelte';
  import logger from '$lib/utils/ActivityLogger';
  import { onMount } from 'svelte';
  import { toast } from "svelte-sonner";

  onMount(() => {
    logger.logPageView('RSS_INFO');
  });

  const handleLinkClick = (type: 'FULL' | 'SUMMARY') => {
    const targetUrl = type === 'FULL' ? 'https://www.velopers.kr/rss.xml' : 'https://www.velopers.kr/summary-rss.xml';
    const targetType = type === 'FULL' ? 'RSS_FULL_LINK' : 'RSS_SUMMARY_LINK';
    
    logger.logClick(targetType, undefined, undefined, {
      url: targetUrl,
      from: 'RssInfo',
      location: 'RSS_INFO'
    });
  };

  const handleCopyClick = (type: 'FULL' | 'SUMMARY') => {
    const targetUrl = type === 'FULL' ? 'https://www.velopers.kr/rss.xml' : 'https://www.velopers.kr/summary-rss.xml';
    const targetType = type === 'FULL' ? 'RSS_FULL_COPY' : 'RSS_SUMMARY_COPY';

    navigator.clipboard.writeText(targetUrl)
      .then(() => {
        toast.success("RSS 링크가 클립보드에 복사되었습니다.", {
          description: targetUrl,
          duration: 3000
        });
        logger.logClick(targetType, undefined, type, {
          url: targetUrl,
          from: 'RssInfo',
          location: 'RSS_INFO',
          status: 'success'
        });
      })
      .catch((err) => {
        toast.error("링크 복사에 실패했습니다.", {
          description: "다시 시도해주세요.",
          duration: 3000
        });
        logger.logClick(targetType, undefined, type, {
          url: targetUrl,
          from: 'RssInfo',
          location: 'RSS_INFO',
          status: 'error',
          error: err instanceof Error ? err.message : String(err)
        });
      });
  };
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-semibold mb-6 dark:text-gray-100">RSS 피드 안내</h1>

  <p class="mb-8 text-gray-600 dark:text-gray-300">
    Velopers에서는 두 가지 종류의 RSS 피드를 제공합니다. 필요에 따라 선택하여 구독하실 수 있습니다.
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 dark:ring-1 dark:ring-gray-800">
      <h2 class="text-lg font-semibold mb-3 dark:text-gray-200">전체 콘텐츠 RSS</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        각 게시물의 전체 내용이 포함된 표준 RSS 피드입니다. <br>RSS 리더기에서 바로 모든 내용을 확인하고 싶을 때 유용합니다.
      </p>
      <div class="flex items-center gap-2">
        <a 
          href="https://www.velopers.kr/rss.xml" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          on:click={() => handleLinkClick('FULL')}
        >
          /rss.xml
          <ArrowUpRight class="w-4 h-4 ml-1" />
        </a>
        <button
          class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          title="링크 복사"
          on:click={() => handleCopyClick('FULL')}
        >
          <Copy class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 dark:ring-1 dark:ring-gray-800 relative border-2 border-blue-400 dark:border-blue-600">
      <div class="absolute -top-3 -right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
        추천
      </div>
      <h2 class="text-lg font-semibold mb-3 dark:text-gray-200 flex items-center">
        요약 RSS
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        많은 분들이 선택하는 <span class="font-medium text-blue-600 dark:text-blue-400">요약 RSS</span> 피드입니다. <br>
        빠르게 새로운 글을 확인할 수 있어 <span class="font-medium">시간 절약에 효과적이며</span>, 필요한 정보만 간결하게 받아보실 수 있습니다.
      </p>
      <div class="flex items-center gap-2">
        <a 
          href="https://www.velopers.kr/summary-rss.xml" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          on:click={() => handleLinkClick('SUMMARY')}
        >
          /summary-rss.xml
          <ArrowUpRight class="w-4 h-4 ml-1" />
        </a>
        <button
          class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          title="링크 복사"
          on:click={() => handleCopyClick('SUMMARY')}
        >
          <Copy class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div> 