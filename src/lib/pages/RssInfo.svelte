<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import logger from '$lib/utils/ActivityLogger';
  import { onMount } from 'svelte';
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
        각 게시물의 전체 내용이 포함된 표준 RSS 피드입니다. RSS 리더기에서 바로 모든 내용을 확인하고 싶을 때 유용합니다.
      </p>
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
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 dark:ring-1 dark:ring-gray-800">
      <h2 class="text-lg font-semibold mb-3 dark:text-gray-200">요약 RSS</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        각 게시물의 제목과 요약 정보만 포함된 RSS 피드입니다. 빠르게 새로운 글을 확인하고 싶으신 경우 편리합니다.
      </p>
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
    </div>
  </div>
</div>

<script lang="ts">
  onMount(() => {
    logger.logPageView('RSS_INFO');
  });

  const handleLinkClick = (type: 'FULL' | 'SUMMARY') => {
    const targetUrl = type === 'FULL' ? 'https://www.velopers.kr/rss.xml' : 'https://www.velopers.kr/summary-rss.xml';
    const targetType = type === 'FULL' ? 'RSS_FULL_LINK' : 'RSS_SUMMARY_LINK';
    
    logger.logClick(targetType, undefined, {
      url: targetUrl,
      from: 'RssInfo',
      location: 'RSS_INFO'
    });
  };
</script> 