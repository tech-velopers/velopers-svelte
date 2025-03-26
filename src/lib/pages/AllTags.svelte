<script lang="ts">
  import { onMount } from "svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { selectedTags, toggleTag, resetSelected } from '$lib/stores/search';
  import { navigate } from '$lib/stores/router';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { Button } from "$lib/components/ui/button";
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { Search } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import * as Hangul from 'hangul-js';
  import logger from '$lib/utils/ActivityLogger';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';

  interface TagWithCount {
    id: number;
    tagName: string;
    count: number;
  }

  let tags: TagWithCount[] = [];
  let allTags: Tag[] = [];
  let isLoading = true;
  let error: string | null = null;
  let sortOption = 'count-desc';
  let open = false;
  let searchQuery = '';

  const sortOptions = [
    { value: 'name-asc', label: '이름순' },
    { value: 'name-desc', label: '이름역순' },
    { value: 'count-desc', label: '게시글 많은순' },
    { value: 'count-asc', label: '게시글 적은순' },
  ];

  $: selectedValue = sortOptions.find((option) => option.value === sortOption)?.label ?? "정렬 방식 선택";

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  $: sortedTags = [...tags].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.tagName.localeCompare(b.tagName);
      case 'name-desc':
        return b.tagName.localeCompare(a.tagName);
      case 'count-desc':
        return b.count - a.count;
      case 'count-asc':
        return a.count - b.count;
      default:
        return 0;
    }
  });

  $: filteredTags = sortedTags.filter(tag => {
    const tagName = tag.tagName;
    const query = searchQuery;
    
    // 검색어가 비어있으면 모든 태그 표시
    if (!query) return true;

    // 영문 대소문자 구분 없이 검색하기 위해 소문자로 변환
    const lowerTagName = tagName.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // 일반 텍스트 검색 (대소문자 구분 없음)
    if (lowerTagName.includes(lowerQuery)) return true;
    
    // Hangul.js의 search 함수를 사용하여 한글 초성 검색
    return Hangul.search(tagName, query) >= 0;
  });

  onMount(() => {
    let unsubscribe: () => void;
    
    async function init() {
      try {
        // 일반 태그 정보를 위한 구독
        unsubscribe = tagsStore.subscribe((value: Tag[]) => {
          allTags = value;
        });
        
        // 태그와 카운트 정보를 가져옴
        const response = await fetch(getApiUrl(API_ENDPOINTS.allTags));
        if (!response.ok) {
          throw new Error('태그를 가져오는데 실패했습니다.');
        }
        tags = await response.json();
        
        await tagsStore.fetchTags();
        
        // 페이지 조회 로깅
        logger.logPageView('ALL_TAGS', undefined);
      } catch (e) {
        error = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      } finally {
        isLoading = false;
      }
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  // 태그 토글 함수
  function handleTagToggle(tag: TagWithCount) {
    // 태그 토글 상태 확인
    const isSelected = $selectedTags.includes(tag.tagName);
    
    // 태그 토글 로깅
    logger.logClick(isSelected ? 'TAG_UNSELECT' : 'TAG_SELECT', tag.id, tag.tagName, {
      count: tag.count,
      totalSelected: isSelected ? $selectedTags.length - 1 : $selectedTags.length + 1,
      from: 'all_tags_page'
    });
    
    // 태그 토글 실행
    toggleTag(tag.tagName);
  }

  // 검색 기능
  function handleSearch(event: CustomEvent<{query: string}> | null = null) {
    const searchTerm = event?.detail?.query || searchQuery;
  }

  // 검색어 입력 시 검색 업데이트
  let prevSearchQuery = '';
  $: {
    if (searchQuery !== prevSearchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      // 이전 검색어와 현재 검색어가 다를 때만 처리
      handleSearch(null);
      prevSearchQuery = searchQuery;
    }
  }

  function searchWithSelected(data: any) {
    // 필터링된 태그로 검색 로깅
    if ($selectedTags.length > 0) {
      logger.logClick('FILTERED_SEARCH', undefined, `필터: ${$selectedTags.length}개 태그`, {
        tagCount: $selectedTags.length
      });
    }
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
    <h1 class="text-2xl font-bold dark:text-white">모든 태그</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">총 {tags.length}개의 태그가 존재해요</p>
    <div class="flex gap-4 items-center mt-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder="태그 이름으로 검색..."
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
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {#each filteredTags as tag (tag.id)}
        <button 
          class="w-full bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md dark:border-gray-700 transition-all p-4 flex flex-col items-center justify-center"
          on:click={() => handleTagToggle(tag)}
        >
          <div class="flex flex-col items-center text-center">
            <span
              class="px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-block {$selectedTags.includes(tag.tagName)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
            >
              {tag.tagName}
            </span>
            <span class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              포스트 {tag.count}개
            </span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</MainLayout> 