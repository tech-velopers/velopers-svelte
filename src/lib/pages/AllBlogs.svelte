<script lang="ts">
  import { onMount } from "svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { selectedBlogs, toggleBlog, resetSelected } from '$lib/stores/search';
  import { navigate } from '$lib/stores/router';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import type { TechBlog } from '$lib/stores/techBlogs';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { Button } from "$lib/components/ui/button";
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { Search, SquareArrowOutUpRight } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import * as Hangul from 'hangul-js';

  let blogs: TechBlog[] = [];
  let isLoading = true;
  let error: string | null = null;
  let allTags: Tag[] = [];
  let sortOption = 'name-asc';
  let open = false;
  let searchQuery = '';

  const sortOptions = [
    { value: 'name-asc', label: '이름순' },
    { value: 'name-desc', label: '이름역순' },
    { value: 'posts-desc', label: '게시글 많은순' },
    { value: 'posts-asc', label: '게시글 적은순' },
  ];

  $: selectedValue = sortOptions.find((option) => option.value === sortOption)?.label ?? "정렬 방식 선택";

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  $: sortedBlogs = [...blogs].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.techBlogName.localeCompare(b.techBlogName);
      case 'name-desc':
        return b.techBlogName.localeCompare(a.techBlogName);
      case 'posts-desc':
        return b.postCnt - a.postCnt;
      case 'posts-asc':
        return a.postCnt - b.postCnt;
      default:
        return 0;
    }
  });

  $: filteredBlogs = sortedBlogs.filter(blog => {
    const blogName = blog.techBlogName;
    const query = searchQuery;
    
    // 검색어가 비어있으면 모든 블로그 표시
    if (!query) return true;

    // 영문 대소문자 구분 없이 검색하기 위해 소문자로 변환
    const lowerBlogName = blogName.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // 일반 텍스트 검색 (대소문자 구분 없음)
    if (lowerBlogName.includes(lowerQuery)) return true;
    
    // Hangul.js의 search 함수를 사용하여 한글 초성 검색
    return Hangul.search(blogName, query) >= 0;
  });

  onMount(() => {
    let unsubscribe: () => void;
    let tagsUnsubscribe: () => void;
    
    async function init() {
      try {
        unsubscribe = techBlogsStore.subscribe((value: TechBlog[]) => {
          blogs = value;
        });
        tagsUnsubscribe = tagsStore.subscribe((value: Tag[]) => {
          allTags = value;
        });
        await Promise.all([
          techBlogsStore.fetchTechBlogs(),
          tagsStore.fetchTags()
        ]);
      } catch (e) {
        error = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      } finally {
        isLoading = false;
      }
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
      if (tagsUnsubscribe) tagsUnsubscribe();
    };
  });

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

  function searchWithSelected(data: any) {
    // ... existing code ...
    navigate('/');
  }

  function handleReset() {
    resetSelected();
  }
</script>

<MainLayout
  {allTags}
  searchWithSelected={searchWithSelected}
  onSearch={handleSearch}
  onReset={handleReset}
  showLogo={true}
>
  <div class="flex flex-col gap-1 mb-6">
    <h1 class="text-2xl font-bold dark:text-white">모든 블로그</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">총 {blogs.length}개의 블로그가 존재해요</p>
    <div class="flex gap-4 items-center mt-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder="블로그 이름으로 검색..."
          class="w-full pl-10 pr-4 py-3 border-2 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      <Popover.Root bind:open let:ids>
        <Popover.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            class="w-[150px] justify-between"
          >
            {selectedValue}
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </Popover.Trigger>
        <Popover.Content class="w-[150px] p-0">
          <Command.Root>
            <Command.Group>
              {#each sortOptions as option}
                <Command.Item
                  value={option.value}
                  onSelect={(currentValue) => {
                    sortOption = currentValue;
                    closeAndFocusTrigger(ids.trigger);
                  }}
                  class="cursor-pointer"
                >
                  <Check
                    class={cn(
                      "mr-2 h-4 w-4",
                      sortOption !== option.value && "text-transparent"
                    )}
                  />
                  {option.label}
                </Command.Item>
              {/each}
            </Command.Group>
          </Command.Root>
        </Popover.Content>
      </Popover.Root>
    </div>
  </div>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center p-4">{error}</div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
      {#each filteredBlogs as blog (blog.id)}
        <div 
          class="w-full text-left bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-lg dark:border-gray-700 cursor-pointer transition-all p-2 sm:p-3 md:p-4 h-full flex flex-col"
          on:click={() => handleBlogClick(blog)}
          on:keydown={(e) => e.key === 'Enter' && handleBlogClick(blog)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start space-x-3">
            <Avatar.Root class="h-10 w-10 flex-shrink-0">
              <Avatar.Image 
                src={`/icons/${blog.icon}`} 
                alt={blog.techBlogName} 
              />
            </Avatar.Root>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors truncate">
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
          <div class="flex gap-1.5 mt-3">
            <button 
              type="button"
              class="flex-1 px-2.5 py-1 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 {$selectedBlogs.some(b => b.name === blog.techBlogName)
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'}"
              on:click={(e) => {
                e.stopPropagation();
                toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
              }}
            >
              <span>{$selectedBlogs.some(b => b.name === blog.techBlogName) ? '선택 해제' : '선택하기'}</span>
            </button>
            <button 
              type="button"
              class="flex-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
              on:click={(e) => {
                e.stopPropagation();
                handleBlogClick(blog);
              }}
            >
              <span>블로그</span>
              <SquareArrowOutUpRight class="h-3 w-3" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</MainLayout> 