<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { selectedBlogs, selectedTags, toggleBlog, toggleTag, resetSelected } from '$lib/stores/search';
  import { Search, RotateCcw } from 'lucide-svelte';

  export let searchWithSelected: () => void;
  export let onReset: () => void;

  const dispatch = createEventDispatcher<{
    search: { query: string };
  }>();

  let searchQuery = '';

  async function handleSearch() {
    if (searchQuery.trim()) {
      dispatch('search', { query: searchQuery.trim() });
    } else if ($selectedTags.length > 0 || $selectedBlogs.length > 0) {
      searchWithSelected();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md dark:ring-1 dark:ring-gray-700">
  <div class="relative">
    <div class="relative flex items-center mb-2">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
      <input
        type="search"
        bind:value={searchQuery}
        on:keydown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        class="w-full pl-10 pr-4 py-3 border-2 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 ml-3">블로그나 태그를 선택하여 검색할 수 있습니다</p>
  </div>

  {#if $selectedTags.length > 0 || $selectedBlogs.length > 0}
    <div 
      transition:fade|local={{ duration: 200 }}
      class="mt-4"
    >
      <div class="flex items-center justify-center my-3">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <span class="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">AND</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {#if $selectedBlogs.length > 0}
        <div class="my-3" transition:fade|local={{ duration: 200 }}>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">선택된 블로그</h4>
          <div class="flex flex-wrap gap-2">
            {#each $selectedBlogs as blog (blog.name)}
              <button
                transition:fade|local={{ duration: 200 }}
                on:click={() => toggleBlog(blog)}
                class="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <img 
                  src={`/icons/${blog.avatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${blog.name}`}
                  alt={blog.name} 
                  class="w-4 h-4 rounded-full" 
                />
                {blog.name}
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800/80 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/80 text-blue-700 dark:text-blue-300 text-xs font-medium">×</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if $selectedBlogs.length > 0 && $selectedTags.length > 0}
        <div class="flex items-center justify-center my-3">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span class="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">AND</span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
      {/if}

      {#if $selectedTags.length > 0}
        <div class="mb-4" transition:fade|local={{ duration: 200 }}>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">선택된 태그</h4>
          <div class="flex flex-wrap gap-2">
            {#each $selectedTags as tag (tag)}
              <button
                transition:fade|local={{ duration: 200 }}
                on:click={() => toggleTag(tag)}
                class="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-all duration-200 shadow-sm hover:shadow"
              >
                {tag}
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800/80 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/80 text-blue-700 dark:text-blue-300 text-xs font-medium">×</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="flex items-center justify-end gap-2 mt-4">
    <button 
      on:click={handleSearch}
      class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md flex items-center gap-1.5"
    >
      <span>검색</span>
      <Search class="h-3.5 w-3.5" />
    </button>
    <button 
      on:click={onReset}
      class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
    >
      <span>초기화</span>
      <RotateCcw class="h-3.5 w-3.5" />
    </button>
  </div>
</div>