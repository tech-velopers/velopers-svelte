<script lang="ts">
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import { onMount } from 'svelte';

  export let allTags: Array<{ id: number; tagName: string; }>;
  export let searchWithSelected: (data: any) => void;
  export let onSearch: (event: CustomEvent<{query: string}>) => void;
  export let onReset: () => void;
  export let showLogo = true;
  export let showSidebar = true;
  
  let adLoaded = false;
  
  // 타입 정의
  interface ExtendedWindow extends Window {
    adsbygoogle?: any[];
  }
  
  // 광고 초기화
  onMount(() => {
    // 이미 AdSense가 로드되어 있는지 확인
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      // AdSense 스크립트 로드
      const adScript = document.createElement('script');
      adScript.async = true;
      adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2560054260004649';
      adScript.crossOrigin = 'anonymous';
      document.head.appendChild(adScript);
    }
    
    // 광고 초기화
    setTimeout(() => {
      try {
        const extWindow = window as ExtendedWindow;
        (extWindow.adsbygoogle = extWindow.adsbygoogle || []).push({});
        adLoaded = true;
      } catch (e) {
        console.error('AdSense 초기화 오류:', e);
      }
    }, 500);
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
  <div class="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
    {#if showLogo}
      <div class="mb-4 sm:mb-8">
        <div class="bg-black rounded-xl sm:rounded-2xl overflow-hidden dark:ring-1 dark:ring-gray-700">
          <img src="/velopers.png" alt="Velopers 로고" class="w-full h-28 sm:h-36 md:h-40 object-contain scale-[1.5] sm:scale-[1.75] md:scale-100"/>
        </div>
      </div>
    {/if}

    <div class="flex flex-col lg:flex-row gap-6">
      <main class="flex-1">
        <slot />
      </main>
      
      {#if showSidebar}
        <Sidebar
          {allTags}
          {searchWithSelected}
          {onSearch}
          {onReset}
        />
      {/if}
    </div>
  </div>
  
  <!-- 왼쪽 광고 영역 - 데스크톱에서만 표시 (lg 이상) -->
  <div class="hidden lg:block absolute top-4 ml-4">
    <div class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">광고</div>
      <!-- 왼쪽 사이드 광고 -->
      <ins class="adsbygoogle"
          style="display:block; width:160px; height:600px;"
          data-ad-client="ca-pub-2560054260004649"
          data-ad-slot="3835436676"
          data-ad-format="auto"
          data-full-width-responsive="false"></ins>
    </div>
  </div>
</div>
