<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { navigate } from "$lib/stores/router";
  import { resetSelected } from "$lib/stores/search";
  
  export let isDarkMode: boolean;
  export let toggleDarkMode: () => void;

  // 로고 또는 홈 클릭 시 검색 파라미터 초기화 후 홈으로 이동
  function handleHomeNavigation() {
    // resetSearchState 옵션을 true로 설정하여 검색 파라미터 초기화 및 홈으로 이동
    navigate("/", false, true);
  }
</script>

<header
  class="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b shadow-sm transition-colors"
>
  <div
    class="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between"
  >
    <button
      on:click={handleHomeNavigation}
      class="inline-flex items-center hover:opacity-90 transition-opacity"
    >
      <span class="text-orange-500 text-xs sm:text-sm font-bold leading-none"
        >&lt;</span
      >
      <span
        class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none"
        >V</span
      >
      <span class="text-orange-500 text-xs sm:text-sm font-bold leading-none"
        >&gt;</span
      >
      <span
        class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none ml-0.5"
        >elopers</span
      >
    </button>
    <nav class="flex items-center">
      <div class="flex flex-wrap items-center">
        <button
          on:click={handleHomeNavigation}
          class="hidden sm:block p-1.5 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >홈</button
        >
        <span class="hidden sm:block border-l border-gray-200 dark:border-gray-700 h-4 mx-1"></span>
        <button
          on:click={() => navigate("/all-blogs")}
          class="p-1 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-[11px] sm:text-base whitespace-nowrap"
          >모든 블로그</button
        >
        <span class="border-l border-gray-200 dark:border-gray-700 h-4 mx-1"></span>
        <button
          on:click={() => navigate("/all-tags")}
          class="p-1 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-[11px] sm:text-base whitespace-nowrap"
          >모든 태그</button
        >
        <span class="border-l border-gray-200 dark:border-gray-700 h-4 mx-1"></span>
        <button
          on:click={() => navigate("/about")}
          class="p-1 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-[11px] sm:text-base whitespace-nowrap"
          >소개</button
        >
        <span class="border-l border-gray-200 dark:border-gray-700 h-4 mx-1"></span>
        <button
          on:click={() => navigate("/popular-posts")}
          class="p-1 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-[11px] sm:text-base whitespace-nowrap"
          >인기 게시글</button
        >
      </div>
      <span class="border-l border-gray-200 dark:border-gray-700 h-4 mx-1 sm:mx-2"></span>
      <button
        on:click={toggleDarkMode}
        class="p-1.5 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="다크모드 토글"
      >
        {#if isDarkMode}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 sm:h-6 sm:w-6 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 hover:text-blue-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        {/if}
      </button>
    </nav>
  </div>
</header>
