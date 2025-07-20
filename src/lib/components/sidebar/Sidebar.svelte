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
  import { store as tagsStore, type Tag } from '$lib/stores/tags';
  import { onMount } from 'svelte';
  import * as Dialog from "$lib/components/ui/dialog";

  export let searchWithSelected: (data: any) => void;
  export let onSearch: (event: CustomEvent<{ query: string }>) => void;
  export let onReset: () => void;

  let allTagsData: Tag[] = [];

  onMount(() => {
    const unsubscribe = tagsStore.subscribe(value => {
      allTagsData = value;
    });
    tagsStore.fetchTags();
    return unsubscribe;
  });

  $: popularTags = [...allTagsData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
    .sort((a, b) => a.tagName.localeCompare(b.tagName))
    .map(tag => ({ id: tag.id, tagName: tag.tagName }));

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
<Dialog.Root bind:open={$isSidebarOpen}>
  <Dialog.Trigger asChild let:builder>
    <button
      use:builder.action
      {...builder}
      class="fixed right-3 bottom-3 lg:right-4 lg:bottom-4 lg:hidden z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5"
      aria-label="검색 메뉴 열기"
    >
      <span class="text-xs font-medium">필터 검색</span>
      <Search class="h-4 w-4" />
    </button>
  </Dialog.Trigger>

  <Dialog.Content class="max-w-[95%] sm:max-w-[90%] max-h-[85vh] sm:max-h-[75vh] p-0 overflow-hidden lg:hidden">
    <Dialog.Header class="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
      <Dialog.Title class="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
        검색
      </Dialog.Title>
    </Dialog.Header>
    
    <!-- 컨텐츠 -->
    <div
      class="p-2 sm:p-3 overflow-y-auto space-y-3 sm:space-y-4"
      style="max-height: calc(85vh - 60px);"
    >
      <SearchBox
        searchWithSelected={handleSearchWithSelected}
        on:search={handleSearch}
        onReset={handleReset}
      />
      <WeeklyPopularPosts />
      <PopularBlogs />
      <PopularTags allTags={popularTags} />
    </div>
  </Dialog.Content>
</Dialog.Root>

<!-- 데스크톱 사이드바 -->
<aside class="hidden lg:block w-[352px] space-y-6">
  <SearchBox
    searchWithSelected={handleSearchWithSelected}
    on:search={handleSearch}
    {onReset}
  />
  <WeeklyPopularPosts />
  <PopularBlogs />
  <PopularTags allTags={popularTags} />
</aside>
