<script lang="ts">
  import { onMount } from "svelte";
  import { getApiUrl } from "$lib/config";
  import * as Avatar from "$lib/components/ui/avatar";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";

  interface TechBlog {
    id: number;
    techBlogName: string;
    icon: string;
    baseUrl: string;
    postCnt: number;
  }

  let blogs: TechBlog[] = [];
  let isLoading = true;
  let error: string | null = null;
  let selectedBlogs: Array<{ name: string; avatar: string }> = [];
  let selectedTags: string[] = [];
  let allTags: Array<{ id: number; tagName: string }> = [];

  onMount(async () => {
    try {
      const response = await fetch(getApiUrl("/api/techBlogs"));
      if (!response.ok) throw new Error("블로그 정보를 불러오는데 실패했습니다.");
      blogs = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
    } finally {
      isLoading = false;
    }
  });

  function toggleBlog(blog: { name: string; avatar: string }) {
    const index = selectedBlogs.findIndex(b => b.name === blog.name);
    if (index === -1) {
      selectedBlogs = [...selectedBlogs, blog];
    } else {
      selectedBlogs = selectedBlogs.filter((_, i) => i !== index);
    }
  }

  function handleBlogClick(blog: TechBlog) {
    window.open(blog.baseUrl, '_blank', 'noopener,noreferrer');
  }

  function handlePostCountClick(blog: TechBlog, event: MouseEvent) {
    event.stopPropagation();
    toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
  }

  function handleSearch(event: CustomEvent<{query: string}>) {
    // TODO: 검색 기능 구현
    console.log('Search query:', event.detail.query);
  }

  function toggleTag(tagName: string) {
    if (selectedTags.includes(tagName)) {
      selectedTags = selectedTags.filter(t => t !== tagName);
    } else {
      selectedTags = [...selectedTags, tagName];
    }
  }

  function searchWithSelected(data: any) {
    // TODO: 선택된 항목으로 검색 구현
    console.log('Search with selected:', data);
  }

  function resetSelected() {
    selectedTags = [];
    selectedBlogs = [];
  }
</script>

<MainLayout
  {allTags}
  {selectedTags}
  {selectedBlogs}
  {toggleTag}
  {toggleBlog}
  {searchWithSelected}
  {resetSelected}
  onSearch={handleSearch}
  showLogo={true}
>
  <h1 class="text-2xl font-bold mb-6 dark:text-white">기술 블로그 모음</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center p-4">{error}</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each blogs as blog (blog.id)}
        <div 
          class="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 dark:ring-1 dark:ring-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          on:click={() => handleBlogClick(blog)}
          on:keydown={(e) => e.key === 'Enter' && handleBlogClick(blog)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-center space-x-4">
            <Avatar.Root class="h-12 w-12">
              <Avatar.Image 
                src={`/icons/${blog.icon}`} 
                alt={blog.techBlogName} 
              />
            </Avatar.Root>
            <div class="flex-1">
              <h3 class="text-lg font-semibold dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                {blog.techBlogName}
              </h3>
              <button
                type="button"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                on:click={(e) => handlePostCountClick(blog, e)}
              >
                게시글 {blog.postCnt}개
              </button>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button 
              type="button"
              class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors {selectedBlogs.some(b => b.name === blog.techBlogName)
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'}"
              on:click={(e) => {
                e.stopPropagation();
                toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
              }}
            >
              {selectedBlogs.some(b => b.name === blog.techBlogName) ? '선택 해제' : '선택하기'}
            </button>
            <button 
              type="button"
              class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
              on:click={(e) => {
                e.stopPropagation();
                handleBlogClick(blog);
              }}
            >
              블로그로 가기
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</MainLayout> 