<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EventDispatcher } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  
  export let selectedTags: string[] = [];
  export let selectedBlogs: Array<{
    name: string;
    avatar: string;
  }> = [];
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let searchWithSelected: (data: any) => void;
  export let resetSelected: () => void;

  let searchQuery = '';
  const dispatch: EventDispatcher<{search: {query: string}}> = createEventDispatcher();

  const fetchPosts = async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.posts), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'All',
          blogs: selectedBlogs.map(blog => blog.name),
          tags: selectedTags,
          page: 1,
          size: 10
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  async function handleSearch() {
    if (searchQuery.trim()) {
      dispatch('search', { query: searchQuery.trim() });
    } else if (selectedTags.length > 0 || selectedBlogs.length > 0) {
      const data = await fetchPosts();
      if (data) {
        searchWithSelected(data);
      }
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
      <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <input
        type="search"
        bind:value={searchQuery}
        on:keydown={handleKeyDown}
        placeholder="검색어를 입력하세요"
        class="w-full pl-10 pr-4 py-3 border-2 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
      <button 
        on:click={handleSearch}
        class="absolute right-3 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        aria-label="검색"
      >
      </button>
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400 ml-3">블로그나 태그를 선택하여 검색할 수 있습니다</p>
  </div>
  {#if selectedTags.length > 0 || selectedBlogs.length > 0}
    <div 
      class="mt-4"
      transition:slide={{ duration: 300, easing: quintOut }}
    >
      <div class="flex items-center justify-center my-3">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <span class="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">AND</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {#if selectedBlogs.length > 0}
        <div class="mb-4" transition:slide={{ duration: 200 }}>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">선택된 블로그</h4>
          <div class="flex flex-wrap gap-2">
            {#each selectedBlogs as blog (blog.name)}
              <button
                transition:fade={{ duration: 200 }}
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

      {#if selectedBlogs.length > 0 && selectedTags.length > 0}
        <div class="flex items-center justify-center my-3">
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span class="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">AND</span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
      {/if}

      {#if selectedTags.length > 0}
        <div class="mb-4" transition:slide={{ duration: 200 }}>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">선택된 태그</h4>
          <div class="flex flex-wrap gap-2">
            {#each selectedTags as tag (tag)}
              <button
                transition:fade={{ duration: 200 }}
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
  <div class="flex items-center justify-end gap-2 mt-6">
    <button 
      on:click={handleSearch}
      class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
    >
      검색
    </button>
    <button 
      on:click={resetSelected}
      class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      초기화
    </button>
  </div>
</div>