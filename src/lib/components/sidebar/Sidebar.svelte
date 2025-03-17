<script lang="ts">
  import SearchBox from "./SearchBox.svelte";
  import PopularBlogs from "./PopularBlogs.svelte";
  import PopularTags from "./PopularTags.svelte";
  import { Search } from "lucide-svelte";
  import { selectedBlogs, selectedTags } from "$lib/stores/search";
  import {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
  } from "$lib/stores/sidebar";
  import WeeklyPopularPosts from "./WeeklyPopularPosts.svelte";

  export let allTags: { id: number; tagName: string }[];
  export let searchWithSelected: (data: any) => void;
  export let onSearch: (event: CustomEvent<{ query: string }>) => void;
  export let onReset: () => void;

  // 검색 이벤트 핸들러
  const handleSearch = (event: CustomEvent<{ query: string }>) => {
    onSearch(event);
    closeSidebar();
  };

  // 초기화 이벤트 핸들러
  const handleReset = () => {
    onReset();
    closeSidebar();
  };

  // 전체보기 이벤트 핸들러
  const handleSearchWithSelected = () => {
    searchWithSelected({ blogs: $selectedBlogs, tags: $selectedTags });
    closeSidebar();
  };
</script>

<!-- 모바일 검색 버튼 -->
<button
  class="fixed right-3 bottom-3 lg:right-4 lg:bottom-4 lg:hidden z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 lg:px-4 lg:py-3 rounded-full shadow-lg flex items-center gap-2"
  on:click={toggleSidebar}
  aria-label="검색 메뉴 열기"
>
  <span class="text-sm font-medium">검색</span>
  <Search class="h-6 w-6" />
</button>

<!-- 데스크톱 사이드바 -->
<aside class="hidden lg:block w-[352px] space-y-6">
  <SearchBox
    searchWithSelected={handleSearchWithSelected}
    on:search={handleSearch}
    {onReset}
  />
  <WeeklyPopularPosts />
  <PopularBlogs />
  <PopularTags {allTags} />
</aside>

<!-- 모바일 팝업 -->
{#if $isSidebarOpen}
  <!-- 오버레이 -->
  <button
    type="button"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    on:click={closeSidebar}
    on:keydown={(e) => e.key === "Escape" && closeSidebar()}
    aria-label="검색 메뉴 닫기"
  ></button>

  <!-- 팝업 컨테이너 -->
  <div
    class="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-50 lg:hidden"
  >
    <div
      class="bg-white dark:bg-gray-800 w-full max-w-[95%] sm:max-w-[90%] max-h-[85vh] sm:max-h-[75vh] rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 ease-out"
      on:click|stopPropagation
      role="presentation"
    >
      <!-- 헤더 -->
      <div
        class="flex justify-between items-center p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700"
      >
        <h2
          class="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200"
        >
          검색
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          on:click={closeSidebar}
          aria-label="검색 메뉴 닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 컨텐츠 -->
      <div
        class="p-2 sm:p-3 overflow-y-auto space-y-3 sm:space-y-4"
        style="max-height: calc(85vh - 45px);"
      >
        <SearchBox
          searchWithSelected={handleSearchWithSelected}
          on:search={handleSearch}
          onReset={handleReset}
        />
        <WeeklyPopularPosts />
        <PopularBlogs />
        <PopularTags {allTags} />
      </div>
    </div>
  </div>
{/if}
