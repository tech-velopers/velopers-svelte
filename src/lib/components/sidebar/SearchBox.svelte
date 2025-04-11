<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { tick } from 'svelte';
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
  import { Search, RotateCcw, X, Check } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils.js";
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import type { TechBlog } from '$lib/stores/techBlogs';
  import * as Hangul from 'hangul-js';

  export let searchWithSelected: () => void;
  export let onReset: () => void;

  const dispatch = createEventDispatcher<{
    search: { query: string };
  }>();

  // 입력 중인 검색어를 임시로 저장하는 변수
  let inputQuery = '';
  let suggestions: Array<{name: string, icon: string, isSelected?: boolean}> = [];
  let showSuggestions = false;
  let blogs: TechBlog[] = [];
  let selectedSuggestionIndex = -1;

  let mainContainer: HTMLDivElement;

  // 높이 애니메이션을 위한 tweened 스토어
  const containerHeight = tweened(0, {
    duration: 200,
    easing: cubicOut
  });

  // 컨테이너 높이를 측정하고 tweened 스토어를 업데이트하는 함수
  async function updateHeight() {
    await tick();
    if (!mainContainer) return;

    let requiredHeight = 0;
    if ($selectedBlogs.length > 0 || $selectedTags.length > 0) {
       requiredHeight = mainContainer.scrollHeight;
    }
    containerHeight.set(requiredHeight);
  }

  // 선택된 블로그/태그 변경 시 높이 업데이트
  $: if ($selectedBlogs || $selectedTags) {
    updateHeight();
  }

  // 컴포넌트 마운트 시 검색어 초기화
  onMount(() => {
    updateHeight();
    // 스토어에서 검색어를 가져와 설정
    inputQuery = $searchQuery;
    
    // techBlogsStore 구독
    const unsubscribe = techBlogsStore.subscribe((value: TechBlog[]) => {
      blogs = value;
    });
    
    // 테크블로그 데이터 가져오기
    techBlogsStore.fetchTechBlogs();
    
    return unsubscribe;
  });

  // 블로그명 자동완성 함수
  $: {
    if (inputQuery && inputQuery.trim() !== '' && blogs.length > 0) {
      const query = inputQuery.toLowerCase();
      suggestions = blogs
        .filter(blog => {
          const blogName = blog.techBlogName;
          
          // 일반 텍스트 검색 (대소문자 구분 없음)
          if (blogName.toLowerCase().includes(query)) return true;
          
          // Hangul.js의 search 함수를 사용하여 한글 초성 검색
          return Hangul.search(blogName, query) >= 0;
        })
        .map(blog => ({
          name: blog.techBlogName,
          icon: blog.icon,
          // 이미 선택된 블로그인지 확인
          isSelected: $selectedBlogs.some(b => b.name.toLowerCase() === blog.techBlogName.toLowerCase())
        }))
        // 글자 길이가 짧은 순으로 정렬
        .sort((a, b) => a.name.length - b.name.length)
        .slice(0, 5); // 최대 5개까지만 표시
      
      showSuggestions = suggestions.length > 0;
      // 새로운 검색 결과가 나타날 때마다 선택 인덱스 초기화
      selectedSuggestionIndex = -1;
    } else {
      suggestions = [];
      showSuggestions = false;
      selectedSuggestionIndex = -1;
    }
  }

  function selectSuggestion(suggestion: {name: string, icon: string, isSelected?: boolean}) {
    inputQuery = suggestion.name;
    showSuggestions = false;
    selectedSuggestionIndex = -1;
  }

  // 블로그 이름이 완전히 일치하는지 확인하고 일치하면 선택
  function trySelectBlogByExactMatch() {
    if (!inputQuery) return false;
    
    // 블로그 이름과 정확히 일치하는 항목 찾기
    const exactMatchBlog = blogs.find(blog => 
      blog.techBlogName.toLowerCase() === inputQuery.toLowerCase()
    );
    
    if (exactMatchBlog) {
      // 블로그 선택
      toggleBlog({ 
        name: exactMatchBlog.techBlogName, 
        avatar: exactMatchBlog.icon 
      });
      
      // 검색창 비우기
      inputQuery = '';
      setSearchQuery('');
      
      // URL 업데이트
      updateUrl();
      return true;
    }
    return false;
  }

  async function handleSearch() {
    // 정확히 일치하는 블로그가 있으면 선택
    const exactMatch = trySelectBlogByExactMatch();
    
    if (!exactMatch) {
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
    showSuggestions = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    // 화살표 키, Enter, Escape가 아닌 다른 키가 입력되면 포커스 초기화
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'];
    if (!navigationKeys.includes(event.key) && !event.isComposing) {
      selectedSuggestionIndex = -1;
    }

    if (showSuggestions && !event.isComposing) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (selectedSuggestionIndex === -1) {
          selectedSuggestionIndex = 0;
        } else if (selectedSuggestionIndex === suggestions.length - 1) {
          // 마지막 항목에서 다시 처음으로 순환
          selectedSuggestionIndex = 0;
        } else {
          selectedSuggestionIndex = selectedSuggestionIndex + 1;
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (selectedSuggestionIndex === -1 || selectedSuggestionIndex === 0) {
          // 선택된 항목이 없거나 첫 항목에서 마지막으로 순환
          selectedSuggestionIndex = suggestions.length - 1;
        } else {
          selectedSuggestionIndex = selectedSuggestionIndex - 1;
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          selectSuggestion(selectedSuggestion);
          
          // 블로그 선택
          toggleBlog({ 
            name: selectedSuggestion.name, 
            avatar: selectedSuggestion.icon 
          });
          
          // 검색창 비우기
          inputQuery = '';
          setSearchQuery('');
          
          // URL 업데이트
          updateUrl();
        } else {
          handleSearch();
        }
      } else if (event.key === 'Escape') {
        showSuggestions = false;
        selectedSuggestionIndex = -1;
      }
    } else if (event.key === 'Enter') {
      handleSearch();
    }
  }

  function handleInputFocus() {
    if (inputQuery.trim() !== '' && suggestions.length > 0) {
      showSuggestions = true;
    }
  }

  function handleInputBlur(event: FocusEvent) {
    // 자동완성 항목을 클릭할 시간을 주기 위해 지연
    setTimeout(() => {
      showSuggestions = false;
      selectedSuggestionIndex = -1;
    }, 200);
  }

  // searchQuery 스토어가 변경될 때만 inputQuery 업데이트
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
        on:keydown={handleKeyDown}
        on:focus={handleInputFocus}
        on:blur={handleInputBlur}
        placeholder="검색어를 입력하세요"
        class="pl-9 pr-4 py-2"
      />
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      
      {#if showSuggestions && suggestions.length > 0}
        <div 
          transition:fade|local={{ duration: 150 }}
          class="absolute z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-md w-full mt-1 max-h-60 overflow-y-auto"
        >
          <ul class="py-1">
            {#each suggestions as suggestion, index}
              <button 
                class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer {index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''} flex items-center {suggestion.isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
                on:click={() => {
                  selectSuggestion(suggestion);
                  handleSearch();
                }}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
              >
                <img 
                  src={`/icons/${suggestion.icon}`} 
                  alt={suggestion.name} 
                  class="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                />
                <span class="text-sm">{suggestion.name}</span>
                {#if suggestion.isSelected}
                  <Check class="ml-auto h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
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
                animate:flip={{ duration: 200 }}
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