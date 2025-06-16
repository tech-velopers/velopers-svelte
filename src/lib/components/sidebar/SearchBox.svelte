<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { tick } from 'svelte';
  import { 
    selectedBlogs, 
    selectedTags, 
    toggleBlog, 
    toggleTag, 
    searchQuery,
    setSearchQuery,
    getSearchParamsUrl
  } from '$lib/stores/search';
  import { goto } from '$app/navigation';
  import { Search, RotateCcw, X, Check, Tag as TagIcon } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import type { TechBlog } from '$lib/stores/techBlogs';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import * as Hangul from 'hangul-js';

  export let searchWithSelected: () => void;
  export let onReset: () => void;

  const dispatch = createEventDispatcher<{
    search: { query: string };
  }>();

  interface Suggestion {
    type: 'blog' | 'tag';
    name: string;
    icon?: string;
    isSelected?: boolean;
  }

  let inputQuery = '';
  let suggestions: Suggestion[] = [];
  let showSuggestions = false;
  let blogs: TechBlog[] = [];
  let tags: Tag[] = [];
  let selectedSuggestionIndex = -1;

  let mainContainer: HTMLDivElement;

  const containerHeight = tweened(0, {
    duration: 200,
    easing: cubicOut
  });

  async function updateHeight() {
    await tick();
    if (!mainContainer) return;

    let requiredHeight = 0;
    if ($selectedBlogs.length > 0 || $selectedTags.length > 0) {
       requiredHeight = mainContainer.scrollHeight;
    }
    containerHeight.set(requiredHeight);
  }

  $: if ($selectedBlogs || $selectedTags) {
    updateHeight();
  }

  onMount(() => {
    updateHeight();
    inputQuery = $searchQuery;
    
    const unsubscribeBlogs = techBlogsStore.subscribe((value: TechBlog[]) => {
      blogs = value;
    });
    techBlogsStore.fetchTechBlogs();

    const unsubscribeTags = tagsStore.subscribe((value: Tag[]) => {
      tags = value;
    });
    tagsStore.fetchTags();
    
    return () => {
      unsubscribeBlogs();
      unsubscribeTags();
    };
  });

  $: {
    if (inputQuery && inputQuery.trim() !== '' && (blogs.length > 0 || tags.length > 0)) {
      const query = inputQuery.toLowerCase();
      const queryHangul = query;

      const blogSuggestions: Suggestion[] = blogs
        .filter(blog => {
          const blogName = blog.techBlogName;
          if (blogName.toLowerCase().includes(query)) return true;
          return Hangul.search(blogName, queryHangul) >= 0;
        })
        .map(blog => ({
          type: 'blog',
          name: blog.techBlogName,
          icon: blog.icon,
          isSelected: $selectedBlogs.some(b => b.name.toLowerCase() === blog.techBlogName.toLowerCase())
        }));

      const tagSuggestions: Suggestion[] = tags
        .filter(tag => {
          const tagName = tag.tagName;
          if (tagName.toLowerCase().includes(query)) return true;
          return Hangul.search(tagName, queryHangul) >= 0;
        })
        .map(tag => ({
          type: 'tag',
          name: tag.tagName,
          isSelected: $selectedTags.includes(tag.tagName)
        }));

      suggestions = [...blogSuggestions, ...tagSuggestions]
        .sort((a, b) => a.name.length - b.name.length)
        .slice(0, 5);
      
      showSuggestions = suggestions.length > 0;
      selectedSuggestionIndex = -1;
    } else {
      suggestions = [];
      showSuggestions = false;
      selectedSuggestionIndex = -1;
    }
  }

  async function selectSuggestion(suggestion: Suggestion) {
    const nameToToggle = suggestion.name;
    const typeToToggle = suggestion.type;
    const iconToToggle = suggestion.icon;

    inputQuery = '';
    setSearchQuery('');
    showSuggestions = false;
    selectedSuggestionIndex = -1;

    await tick();

    if (typeToToggle === 'blog') {
      toggleBlog({ 
        name: nameToToggle, 
        avatar: iconToToggle || ''
      });
    } else if (typeToToggle === 'tag') {
      toggleTag(nameToToggle);
    }

    goto(getSearchParamsUrl('/'), { replaceState: true });
  }

  async function trySelectBlogByExactMatch(): Promise<boolean> {
    if (!inputQuery || blogs.length === 0) return false;
    
    const lowerInputQuery = inputQuery.toLowerCase();
    const exactMatchBlog = blogs.find(blog => 
      blog.techBlogName.toLowerCase() === lowerInputQuery
    );
    
    if (exactMatchBlog) {
      const blogToToggle = { name: exactMatchBlog.techBlogName, avatar: exactMatchBlog.icon };
      
      inputQuery = '';
      setSearchQuery('');
      await tick();

      toggleBlog(blogToToggle);
      goto(getSearchParamsUrl('/'), { replaceState: true });
      return true;
    }
    return false;
  }
  
  async function trySelectTagByExactMatch(): Promise<boolean> {
    if (!inputQuery || tags.length === 0) return false;

    const lowerInputQuery = inputQuery.toLowerCase();
    const exactMatchTag = tags.find(tag =>
      tag.tagName.toLowerCase() === lowerInputQuery
    );

    if (exactMatchTag) {
      const tagToToggle = exactMatchTag.tagName;
      
      inputQuery = '';
      setSearchQuery('');
      await tick();

      toggleTag(tagToToggle);
      goto(getSearchParamsUrl('/'), { replaceState: true });
      return true;
    }
    return false;
  }

  async function handleSearch() {
    if (await trySelectBlogByExactMatch()) {
      showSuggestions = false;
      return;
    }
    
    if (await trySelectTagByExactMatch()) {
      showSuggestions = false;
      return;
    }

    const trimmedQuery = inputQuery.trim();
    if (trimmedQuery) {
      setSearchQuery(trimmedQuery);
      dispatch('search', { query: trimmedQuery });
      goto(getSearchParamsUrl('/'), { replaceState: true });
    } else if ($selectedTags.length > 0 || $selectedBlogs.length > 0) {
      setSearchQuery('');
      searchWithSelected();
      goto(getSearchParamsUrl('/'), { replaceState: true });
    }
    
    showSuggestions = false;
  }

  async function handleKeyDown(event: KeyboardEvent) {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'];
    if (!navigationKeys.includes(event.key) && !event.isComposing) {
      selectedSuggestionIndex = -1;
    }

    if (showSuggestions && !event.isComposing && suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selected = suggestions[selectedSuggestionIndex];
          await selectSuggestion(selected);
        } else {
          await handleSearch();
        }
      } else if (event.key === 'Escape') {
        showSuggestions = false;
        selectedSuggestionIndex = -1;
      }
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      await handleSearch();
    }
  }

  function handleInputFocus() {
    if (inputQuery.trim() !== '' && suggestions.length > 0) {
      showSuggestions = true;
    }
  }

  function handleInputBlur(event: FocusEvent) {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget && relatedTarget.closest('.suggestion-list')) {
         return;
      }
       
      if (showSuggestions) {
          showSuggestions = false;
          selectedSuggestionIndex = -1;
      }
    }, 150);
  }

  $: if ($searchQuery !== undefined) {
    inputQuery = $searchQuery;
  }
</script>

<div class="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
  <div class="space-y-2">
    <div class="relative">
      <Input
        type="search"
        bind:value={inputQuery}
        on:input={() => selectedSuggestionIndex = -1}
        on:keydown={handleKeyDown}
        on:focus={handleInputFocus}
        on:blur={handleInputBlur}
        placeholder="검색어 또는 블로그/태그명 입력"
        class="pl-9 pr-4 py-2"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls="suggestion-list"
        role="combobox"
      />
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      
      {#if showSuggestions && suggestions.length > 0}
        <div 
          transition:fade|local={{ duration: 150 }}
          class="suggestion-list absolute z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-md w-full mt-1 max-h-60 overflow-y-auto"
          id="suggestion-list"
          role="listbox"
        >
          <ul class="py-1">
            {#each suggestions as suggestion, index (suggestion.type + suggestion.name)}
              <button 
                class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center 
                  {index === selectedSuggestionIndex && suggestion.isSelected ? 'bg-blue-200 dark:bg-blue-700' 
                  : index === selectedSuggestionIndex ? 'bg-blue-100 dark:bg-blue-800' 
                  : suggestion.isSelected ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : ''}"
                on:click={() => { 
                   selectSuggestion(suggestion);
                }}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
                id={`suggestion-${index}`}
              >
                {#if suggestion.type === 'blog' && suggestion.icon}
                  <img 
                    src={`/icons/${suggestion.icon}`} 
                    alt={suggestion.name} 
                    class="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                  />
                {:else if suggestion.type === 'tag'}
                  <TagIcon class="w-4 h-4 mr-2 flex-shrink-0 text-muted-foreground" />
                {:else}
                   <div class="w-4 h-4 mr-2 flex-shrink-0"></div>
                {/if}
                <span class="text-sm flex-grow">{suggestion.name}</span>
                {#if suggestion.isSelected}
                  <Check class="ml-auto h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                {/if}
              </button>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
    <p class="text-xs text-muted-foreground">블로그나 태그를 선택하여 검색할 수 있습니다</p>
  </div>

  {#if $selectedTags.length > 0 || $selectedBlogs.length > 0}
    <div 
      bind:this={mainContainer}
      class="mt-4 overflow-hidden"
      style:height="{$containerHeight}px"
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
                animate:flip={{ duration: 200 }}
                transition:fade|local={{ duration: 200 }}
                on:click={() => {
                  toggleBlog(blog);
                  goto(getSearchParamsUrl('/'), { replaceState: true });
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
                animate:flip={{ duration: 200 }}
                transition:fade|local={{ duration: 200 }}
                on:click={() => {
                  toggleTag(tag);
                  goto(getSearchParamsUrl('/'), { replaceState: true });
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
        inputQuery = '';
        setSearchQuery('');
        goto(getSearchParamsUrl('/'), { replaceState: true });
      }}
      class="text-sm px-4 py-2 h-9"
    >
      <span>초기화</span>
      <RotateCcw class="ml-2 h-4 w-4" />
    </Button>
  </div>
</div>