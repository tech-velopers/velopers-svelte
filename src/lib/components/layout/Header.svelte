<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu";
  import { goto } from '$app/navigation';
  import { resetSelected } from "$lib/stores/search";
  import { Sun, Moon, Menu, X, Search, Sparkles } from "lucide-svelte";
  
  export let isDarkMode: boolean;
  export let toggleDarkMode: () => void;

  // 모바일 메뉴 상태
  let mobileMenuOpen = false;
  
  // AI 검색 상태
  let aiInput = "";
  let isFocused = false;
  let isComposing = false; // 한글 입력 조합 상태

  // 로고 또는 홈 클릭 시 검색 파라미터 초기화 후 홈으로 이동
  function handleHomeNavigation() {
    // resetSearchState 옵션을 true로 설정하여 검색 파라미터 초기화 및 홈으로 이동
    goto("/");
    mobileMenuOpen = false;
  }

  // 네비게이션 메뉴 아이템들
  const navigationItems = [
    { label: "홈", href: "/", onClick: handleHomeNavigation },
    { label: "모든 블로그", href: "/all-blogs" },
    { label: "모든 태그", href: "/all-tags" },
    { label: "소개", href: "/about" },
    { label: "인기 게시글", href: "/popular-posts" }
  ];

  function handleMobileNavigation(href: string) {
    goto(href);
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  // AI 검색 핸들러
  function handleAISearch() {
    if (!aiInput.trim()) return;
    
    // AI 검색 결과 페이지로 이동
    const searchUrl = `/ai-search?query=${encodeURIComponent(aiInput.trim())}`;
    goto(searchUrl);
    
    // 입력 필드 초기화
    aiInput = '';
    isFocused = false;
  }

  function handleInputFocus() {
    isFocused = true;
  }

  function handleInputBlur() {
    isFocused = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !isComposing) {
      handleAISearch();
    }
  }

  function handleCompositionStart() {
    isComposing = true;
  }

  function handleCompositionEnd() {
    isComposing = false;
  }
</script>

<header
  class="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b shadow-sm transition-colors"
>
  <div
    class="container mx-auto px-2 sm:px-4 h-16 sm:h-18 flex items-center justify-between"
  >
    <!-- 로고 (왼쪽) -->
    <div class="flex-shrink-0 flex justify-start">
      <button
        on:click={handleHomeNavigation}
        class="inline-flex items-center hover:opacity-90 transition-opacity ml-1 sm:ml-2"
      >
        <span class="text-orange-500 text-xs sm:text-sm font-bold leading-none"
          >&lt;</span
        >
        <span
          class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-none"
          >V</span
        >
        <span class="text-orange-500 text-xs sm:text-sm font-bold leading-none"
          >&gt;</span
        >
        <span
          class="hidden sm:inline text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none ml-0.5"
          >elopers</span
        >
      </button>
    </div>

    <!-- AI 검색 입력 (중앙) -->
    <div class="flex-1 flex justify-center px-1 sm:px-4 mx-2 sm:mx-4 max-w-xs sm:max-w-md">
      <div class="relative w-full group">
        
        <!-- 메인 입력 컨테이너 -->
        <div class="relative">
          <!-- 그라데이션 테두리 -->
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <div class="h-full w-full rounded-xl bg-white dark:bg-gray-900"></div>
          </div>
          
          <!-- 백그라운드 글로우 -->
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-md {isFocused ? 'animate-pulse' : ''}"></div>
          
          <!-- 실제 입력 필드 -->
          <div class="relative flex items-center">
            <div class="absolute left-2 sm:left-3 z-10">
              <Search class="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 {isFocused ? 'drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]' : ''} transition-all" />
            </div>
            
            <input
              type="text"
              bind:value={aiInput}
              on:focus={handleInputFocus}
              on:blur={handleInputBlur}
              on:keydown={handleKeydown}
              on:compositionstart={handleCompositionStart}
              on:compositionend={handleCompositionEnd}
              placeholder="AI로 관련된 게시글을 찾아보세요..."
              class="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 transition-all"
            />
            
            
            <!-- 검색 버튼 -->
            <button
              on:click={handleAISearch}
              disabled={!aiInput.trim()}
              class="absolute right-1 sm:right-2 p-1 sm:p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
            >
              <Sparkles class="h-3 w-3 group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            </button>
          </div>
        </div>
        
      </div>
    </div>

    <!-- 네비게이션 (오른쪽) -->
    <div class="flex-shrink-0 flex justify-end">
      <div class="flex items-center space-x-1 sm:space-x-2">
      <NavigationMenu.Root class="hidden sm:block">
        <NavigationMenu.List class="flex items-center space-x-1">
          {#each navigationItems as item}
            <NavigationMenu.Item>
              {#if item.onClick}
                <NavigationMenu.Link 
                  href={item.href}
                  on:click={item.onClick}
                  class="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  {item.label}
                </NavigationMenu.Link>
              {:else}
                <NavigationMenu.Link 
                  href={item.href}
                  on:click={() => goto(item.href)}
                  class="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  {item.label}
                </NavigationMenu.Link>
              {/if}
            </NavigationMenu.Item>
          {/each}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <!-- 모바일 메뉴 (드롭다운) -->
      <NavigationMenu.Root class="sm:hidden">
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Menu class="h-4 w-4 sm:h-5 sm:w-5" />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg py-2 z-50">
              <div class="space-y-1">
                {#each navigationItems as item}
                  {#if item.onClick}
                    <button
                      on:click={item.onClick}
                      class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  {:else}
                    <button
                      on:click={() => handleMobileNavigation(item.href)}
                      class="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  {/if}
                {/each}
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <!-- 다크모드 토글 -->
      <div class="hidden sm:block border-l border-gray-200 dark:border-gray-700 h-4 mx-1 sm:mx-2"></div>
      <button
        on:click={toggleDarkMode}
        class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="다크모드 토글"
      >
        {#if isDarkMode}
          <Sun class="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
        {:else}
          <Moon class="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-blue-600" />
        {/if}
      </button>
      </div>
    </div>
  </div>
</header>
