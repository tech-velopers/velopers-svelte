<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import { navigate } from "$lib/stores/router";
  export let isDarkMode: boolean;
  export let toggleDarkMode: () => void;
</script>

<header class="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b shadow-sm transition-colors">
  <div class="container mx-auto px-4 h-16 flex items-center justify-between">
    <button on:click={() => navigate('/')} class="inline-flex items-center hover:opacity-90 transition-opacity">
      <span class="text-orange-500 text-sm font-bold leading-none">&lt;</span>
      <span class="text-2xl font-bold text-gray-900 dark:text-white leading-none">V</span>
      <span class="text-orange-500 text-sm font-bold leading-none">&gt;</span>
      <span class="text-2xl font-bold text-gray-900 dark:text-white leading-none ml-0.5">elopers</span>
    </button>
    <nav class="flex items-center space-x-2">
      <div class="flex items-center space-x-2">
        <button on:click={() => navigate('/')} class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">홈</button>
        <button on:click={() => navigate('/all-blogs')} class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">모든 블로그</button>
        <button on:click={() => navigate('/about')} class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">소개</button>
      </div>
      <button on:click={toggleDarkMode} class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="다크모드 토글">
        {#if isDarkMode}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        {/if}
      </button>
      <div class="hidden md:block h-4 w-px mx-2 bg-gray-300 dark:bg-gray-700"></div>
      <div class="hidden md:flex items-center space-x-2">
        <HoverCard.Root openDelay={500}>
          <HoverCard.Trigger>
            <button disabled class="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-400 dark:text-gray-500">로그인</button>
          </HoverCard.Trigger>
          <HoverCard.Content class="w-56">
            <div class="p-4">
              <p class="text-sm text-gray-600 dark:text-gray-300">아직 구현되지 않았어요</p>
            </div>
          </HoverCard.Content>
        </HoverCard.Root>

        <HoverCard.Root openDelay={500}>
          <HoverCard.Trigger>
            <button disabled class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">회원가입</button>
          </HoverCard.Trigger>
          <HoverCard.Content class="w-56">
            <div class="p-4">
              <p class="text-sm text-gray-600 dark:text-gray-300">아직 구현되지 않았어요</p>
            </div>
          </HoverCard.Content>
        </HoverCard.Root>
      </div>
    </nav>
  </div>
</header> 