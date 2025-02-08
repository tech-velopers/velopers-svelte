<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';

  export let selectedTags: string[];
  export let selectedBlogs: Array<{
    name: string;
    avatar: string;
  }>;
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let searchWithSelected: (data: any) => void;
  export let resetSelected: () => void;

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

  const handleSearch = async () => {
    const data = await fetchPosts();
    if (data) {
      searchWithSelected(data);
    }
  };
</script>

{#if selectedTags.length > 0 || selectedBlogs.length > 0}
  <div 
    class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700 overflow-hidden"
    transition:slide={{ duration: 300, easing: quintOut }}
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-medium dark:text-white">선택된 항목</h3>
      <div class="flex gap-2">
        <button 
          on:click={handleSearch}
          class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          검색
        </button>
        <button 
          on:click={resetSelected}
          class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>

    {#if selectedBlogs.length > 0}
      <div class="mb-4" transition:slide={{ duration: 200 }}>
        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">선택된 블로그</h4>
        <div class="flex flex-wrap gap-2">
          {#each selectedBlogs as blog (blog.name)}
            <button
              transition:fade={{ duration: 200 }}
              on:click={() => toggleBlog(blog)}
              class="group flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
            >
              <img 
                src={`/icons/${blog.avatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${blog.name}`}
                alt={blog.name} 
                class="w-4 h-4 rounded-full" 
              />
              {blog.name}
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700 text-blue-700 dark:text-blue-300 text-xs">×</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if selectedTags.length > 0}
      <div transition:slide={{ duration: 200 }}>
        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">선택된 태그</h4>
        <div class="flex flex-wrap gap-2">
          {#each selectedTags as tag (tag)}
            <button
              transition:fade={{ duration: 200 }}
              on:click={() => toggleTag(tag)}
              class="group flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
            >
              {tag}
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700 text-blue-700 dark:text-blue-300 text-xs">×</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if} 