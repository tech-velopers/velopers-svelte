<svelte:head>
  <title>모든 태그 | Velopers</title>
  <meta property="og:title" content="모든 태그 - Velopers" />
  <meta property="og:description" content="기술 블로그 게시글의 모든 태그를 확인하고 원하는 기술 스택의 글을 찾아보세요. Frontend, Backend, AI, DevOps 등 다양한 기술 태그를 제공합니다." />
  <meta property="og:image" content="https://www.velopers.kr/velopers.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.velopers.kr/all-tags" />
  <meta property="og:site_name" content="Velopers" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="모든 태그 - Velopers" />
  <meta name="twitter:description" content="기술 블로그 게시글의 모든 태그를 확인하고 원하는 기술 스택의 글을 찾아보세요. Frontend, Backend, AI, DevOps 등 다양한 기술 태그를 제공합니다." />
  <meta name="twitter:image" content="https://www.velopers.kr/velopers.png" />
  <meta name="description" content="기술 블로그 게시글의 모든 태그를 확인하고 원하는 기술 스택의 글을 찾아보세요. Frontend, Backend, AI, DevOps 등 다양한 기술 태그를 제공합니다." />
  <meta name="keywords" content="기술 태그, 프로그래밍 언어, 기술 스택, Frontend, Backend, AI, DevOps, 개발자" />
  <link rel="canonical" href="https://www.velopers.kr/all-tags" />
</svelte:head>

<script lang="ts">
  import { onMount } from "svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { selectedTags, toggleTag, resetSelected, getSearchParamsUrl } from '$lib/stores/search';
  import { goto } from '$app/navigation';
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

  let tags: Tag[] = [];
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
        // tagsStore 구독하여 tags 업데이트
        unsubscribe = tagsStore.subscribe((value: Tag[]) => {
          tags = value;
          // 스토어에서 데이터를 받아오면 로딩 상태 해제
          if (value.length > 0 || !isLoading) { // 이미 로딩 완료된 상태 방지
            isLoading = false;
          }
        });
        
        // 스토어에 태그 데이터 요청
        await tagsStore.fetchTags(); 
        
        // 스토어 fetchTags 내부 오류는 콘솔에만 찍히므로,
        // 초기 로딩 완료 후에도 tags가 비어있으면 에러 처리 (선택적 개선)
        // setTimeout(() => { // 비동기 처리 대기
        //  if (tags.length === 0 && isLoading) {
        //    error = '태그를 가져오는데 실패했습니다.';
        //    isLoading = false;
        //  }
        // }, 3000); // 적절한 타임아웃 설정 필요
        
        // 페이지 조회 로깅
        logger.logPageView('ALL_TAGS', undefined);
      } catch (e) {
        error = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      }
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  // 태그 토글 함수
  function handleTagToggle(tag: Tag) {
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
    // URL 파라미터와 함께 메인 페이지로 이동
    const urlWithParams = getSearchParamsUrl('/');
    goto(urlWithParams);
  }

  function handleReset() {
    resetSelected();
  }
</script>

<MainLayout
  allTags={tags.map(tag => ({ id: tag.id, tagName: tag.tagName }))}
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
        <div class="flex flex-col items-center">
          <Button 
            variant={$selectedTags.includes(tag.tagName) ? "default" : "outline"}
            size="sm"
            class={cn(
              "px-3 py-[0.3rem] h-auto font-normal text-sm transition-colors border w-full justify-center",
              $selectedTags.includes(tag.tagName) 
                ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
            )}
            on:click={() => handleTagToggle(tag)}
          >
            {tag.tagName} <span class="ml-1 text-xs opacity-75">({tag.count})</span>
          </Button>
        </div>
      {/each}
    </div>
  {/if}
</MainLayout> 