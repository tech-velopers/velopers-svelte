<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { 
    selectedBlogs, 
    selectedTags, 
    toggleBlog, 
    toggleTag, 
    resetSelected,
    searchQuery,
    setSearchQuery
  } from '$lib/stores/search';
  import { updateUrl } from '$lib/stores/router';
  import { Search, RotateCcw, X } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils.js";

  export let searchWithSelected: () => void;
  export let onReset: () => void;

  const dispatch = createEventDispatcher<{
    search: { query: string };
  }>();

  // 입력 중인 검색어를 임시로 저장하는 변수
  let inputQuery = '';

  // 컴포넌트 마운트 시 검색어 초기화
  onMount(() => {
    // 스토어에서 검색어를 가져와 설정
    inputQuery = $searchQuery;
  });

  async function handleSearch() {
    if (inputQuery.trim()) {
      // 검색어 업데이트
      setSearchQuery(inputQuery.trim());
      dispatch('search', { query: inputQuery.trim() });
      // URL 업데이트
      updateUrl();
    } else if ($selectedTags.length > 0 || $selectedBlogs.length > 0) {
      setSearchQuery(''); // 검색어 초기화
      searchWithSelected();
      // URL 업데이트
      updateUrl();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  // 검색어가 변경되면 inputQuery 업데이트 (빈 문자열일 때도 업데이트)
  $: {
    if ($searchQuery !== inputQuery && $searchQuery) {
      inputQuery = $searchQuery;
    }
  }
</script>

<div class="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
  <div class="space-y-2">
    <div class="relative">
      <Input
        type="search"
        bind:value={inputQuery}
        on:keydown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        class="pl-9 pr-4 py-2"
      />
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
    </div>
    <p class="text-xs text-muted-foreground">블로그나 태그를 선택하여 검색할 수 있습니다</p>
  </div>

  {#if $selectedTags.length > 0 || $selectedBlogs.length > 0}
    <div 
      transition:fade|local={{ duration: 200 }}
      class="mt-4"
    >
      <div class="flex items-center justify-center my-3">
        <div class="flex-1 h-px bg-border"></div>
        <span class="px-3 text-xs font-medium text-muted-foreground">AND</span>
        <div class="flex-1 h-px bg-border"></div>
      </div>

      {#if $selectedBlogs.length > 0}
        <div class="my-3" transition:fade|local={{ duration: 200 }}>
          <h4 class="text-xs font-medium text-muted-foreground mb-2">선택된 블로그</h4>
          <div class="flex flex-wrap gap-1.5">
            {#each $selectedBlogs as blog (blog.name)}
              <button
                transition:fade|local={{ duration: 200 }}
                on:click={() => {
                  toggleBlog(blog);
                  updateUrl(); // URL 업데이트
                }}
                class={cn(
                  "group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
                  "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors",
                  "dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/50"
                )}
              >
                <img 
                  src={`/icons/${blog.avatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${blog.name}`}
                  alt={blog.name} 
                  class="w-3 h-3 rounded-full" 
                />
                <span>{blog.name}</span>
                <X class="w-3 h-3 text-orange-500 dark:text-orange-400" />
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if $selectedBlogs.length > 0 && $selectedTags.length > 0}
        <div class="flex items-center justify-center my-3">
          <div class="flex-1 h-px bg-border"></div>
          <span class="px-3 text-xs font-medium text-muted-foreground">AND</span>
          <div class="flex-1 h-px bg-border"></div>
        </div>
      {/if}

      {#if $selectedTags.length > 0}
        <div class="mb-3" transition:fade|local={{ duration: 200 }}>
          <h4 class="text-xs font-medium text-muted-foreground mb-2">선택된 태그</h4>
          <div class="flex flex-wrap gap-1.5">
            {#each $selectedTags as tag (tag)}
              <button
                transition:fade|local={{ duration: 200 }}
                on:click={() => {
                  toggleTag(tag);
                  updateUrl(); // URL 업데이트
                }}
                class={cn(
                  "group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
                  "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors",
                  "dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                )}
              >
                <span>{tag}</span>
                <X class="w-3 h-3 text-blue-500 dark:text-blue-400" />
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="flex items-center justify-end gap-3 mt-5">
    <Button
      variant="default"
      size="sm"
      on:click={handleSearch}
      class="text-sm px-4 py-2 h-9 bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
    >
      <span>검색</span>
      <Search class="ml-2 h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      on:click={() => {
        onReset();
        inputQuery = ''; // 입력 필드 초기화
        updateUrl(); // URL 업데이트
      }}
      class="text-sm px-4 py-2 h-9"
    >
      <span>초기화</span>
      <RotateCcw class="ml-2 h-4 w-4" />
    </Button>
  </div>
</div>