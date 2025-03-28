<script lang="ts">
  import { onMount } from "svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { selectedBlogs, toggleBlog, resetSelected, addBlogsGroup, selectedTags } from '$lib/stores/search';
  import { navigate } from '$lib/stores/router';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
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
  import { Search, ExternalLink } from 'lucide-svelte';
  import { Input } from "$lib/components/ui/input";
  import * as Hangul from 'hangul-js';
  import logger from '$lib/utils/ActivityLogger';

  let blogs: TechBlog[] = [];
  let isLoading = true;
  let error: string | null = null;
  let allTags: Tag[] = [];
  let sortOption = 'recent-update';
  let open = false;
  let searchQuery = '';

  // 네이버, 카카오, 네카라쿠배 그룹 정의
  const naverCompanies = [
    "네이버 D2",
    "네이버 플레이스",
    "네이버 페이",
    "네이버 DnA"
  ];

  const kakaoCompanies = [
    "카카오",
    "카카오뱅크",
    "카카오모빌리티",
    "카카오페이",
    "카카오엔터프라이즈",
    "카카오엔터테인먼트FE",
    "카카오헤어샵",
    "카카오스타일"
  ];

  const nekarakuCompanies = [
    "네이버 D2",
    "네이버 플레이스",
    "네이버 페이",
    "네이버 DnA",
    "카카오",
    "라인",
    "쿠팡",
    "우아한 형제들",
    "당근마켓",
    "토스"
  ];

  const sortOptions = [
    { value: 'name-asc', label: '이름순' },
    { value: 'name-desc', label: '이름역순' },
    { value: 'posts-desc', label: '게시글 많은순' },
    { value: 'posts-asc', label: '게시글 적은순' },
    { value: 'recent-update', label: '최근 추가된 순' },
  ];

  $: selectedValue = sortOptions.find((option) => option.value === sortOption)?.label ?? "정렬 방식 선택";

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  // 그룹 추가 함수
  function addGroupBlogs(companyNames: string[]) {
    if (!$techBlogMap) return;
    
    const blogsToAdd = companyNames
      .map(name => {
        const blog = $techBlogMap[name];
        return blog ? { name: blog.techBlogName, avatar: blog.icon } : null;
      })
      .filter((blog): blog is NonNullable<typeof blog> => blog !== null);
    
    addBlogsGroup(blogsToAdd);
    
    // 블로그 그룹 선택 로깅
    logger.logClick('BLOG_GROUP', undefined, companyNames[0].includes('네이버') 
      ? 'NAVER' 
      : companyNames[0].includes('카카오') 
        ? 'KAKAO' 
        : 'NEKARAKUBAE', {
      blogCount: blogsToAdd.length
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
      case 'recent-update':
        // lastCreatedAt이 없는 경우 가장 오래된 것으로 처리
        if (!a.lastCreatedAt) return 1;
        if (!b.lastCreatedAt) return -1;
        
        // 날짜 비교
        const dateA = new Date(a.lastCreatedAt);
        const dateB = new Date(b.lastCreatedAt);
        return dateB.getTime() - dateA.getTime();
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
        
        // 페이지 조회 로깅
        logger.logPageView('ALL_BLOGS', undefined);
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
    // 블로그 사이트 클릭 로깅
    logger.logClick('BLOG_SITE', blog.id, blog.techBlogName, {
      url: blog.baseUrl
    });
    window.open(blog.baseUrl, '_blank', 'noopener,noreferrer');
  }

  function handlePostCountClick(blog: TechBlog, event: MouseEvent) {
    event.stopPropagation();
    toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
  }

  // 블로그 카드 클릭 시 블로그 상세 페이지로 이동하는 함수
  function navigateToBlog(blog: TechBlog) {
    // 블로그 카드 클릭 로깅
    logger.logClick('BLOG_CARD', blog.id, blog.techBlogName, {
      postCount: blog.postCnt
    });
    navigate(`/blog/${blog.id}`);
  }

  // 블로그 선택 함수 (별도 버튼용)
  function handleToggleBlog(blog: TechBlog, event: MouseEvent) {
    event.stopPropagation();
    
    // 블로그 선택/해제 로깅
    const isSelected = $selectedBlogs.some(b => b.name === blog.techBlogName);
    logger.logClick(isSelected ? 'BLOG_UNSELECT' : 'BLOG_SELECT', blog.id, blog.techBlogName, {
      totalSelected: isSelected ? $selectedBlogs.length - 1 : $selectedBlogs.length + 1
    });
    
    toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
  }

  // 날짜 포맷팅 함수 개선
  function formatDate(dateString?: string): string {
    if (!dateString) return '정보 없음';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // 오늘 날짜인 경우
    if (date.toDateString() === now.toDateString()) {
      return '오늘';
    }
    
    // 어제 날짜인 경우
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }
    
    // 일주일 이내인 경우
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      // 음수 일수가 나오는 경우 '오늘'로 표시
      return diffDays < 0 ? '오늘' : `${diffDays}일 전`;
    }
    
    // 한달 이내인 경우
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    if (date > oneMonthAgo) {
      const diffWeeks = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
      // 음수 주수가 나오는 경우 '오늘'로 표시
      return diffWeeks < 0 ? '오늘' : `${diffWeeks}주 전`;
    }
    
    // 그 외의 경우
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  // 날짜에 따른 클래스 결정 함수
  function getDateClass(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // 일주일 이내인 경우
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return 'text-green-600 dark:text-green-400 font-medium';
    }
    
    // 한달 이내인 경우
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    if (date > oneMonthAgo) {
      return 'text-blue-600 dark:text-blue-400';
    }
    
    return 'text-gray-500 dark:text-gray-400';
  }

  // 블로그 카드 스타일 결정 함수
  function getBlogCardClass(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // 일주일 이내인 경우
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return 'border-green-300 dark:border-green-700';
    }
    
    return '';
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
    // 필터링된 블로그로 검색 로깅
    if ($selectedBlogs.length > 0 || $selectedTags.length > 0) {
      logger.logClick('FILTERED_SEARCH', undefined, `필터: ${$selectedBlogs.length}개 블로그, ${$selectedTags.length}개 태그`, {
        blogCount: $selectedBlogs.length,
        tagCount: $selectedTags.length
      });
    }
    navigate('/');
  }

  function handleReset() {
    resetSelected();
  }

  // 최근 업데이트 여부 확인 함수
  function isRecentlyUpdated(dateString?: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    // 2일 이내인 경우
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);
    return date > twoDaysAgo;
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each filteredBlogs as blog (blog.id)}
        <div 
          class="w-full text-left bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md dark:border-gray-700 cursor-pointer transition-all p-3 sm:p-4 md:p-5 flex flex-col {getBlogCardClass(blog.lastCreatedAt)}"
          on:click={() => navigateToBlog(blog)}
          on:keydown={(e) => e.key === 'Enter' && navigateToBlog(blog)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start space-x-4">
            <Avatar.Root class="h-12 w-12 flex-shrink-0">
              <Avatar.Image 
                src={`/icons/${blog.icon}`} 
                alt={blog.techBlogName} 
              />
            </Avatar.Root>
            <div class="flex-1 min-w-0">
              <div class="flex items-center">
                <h3 class="text-lg font-semibold dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors truncate">
                  {blog.techBlogName}
                </h3>
                {#if isRecentlyUpdated(blog.lastCreatedAt)}
                  <span class="inline-block ml-2 px-1.5 py-0.5 text-xs leading-none font-bold bg-red-500 text-white rounded-full animate-pulse">NEW</span>
                {/if}
                <button
                  class="ml-auto px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center {$selectedBlogs.some(b => b.name === blog.techBlogName) 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                  on:click={(e) => handleToggleBlog(blog, e)}
                >
                  <span>{$selectedBlogs.some(b => b.name === blog.techBlogName) ? '선택 해제' : '선택하기'}</span>
                </button>
              </div>
              <div class="mt-1.5 flex items-center overflow-hidden">
                <span class="text-xs text-gray-500 dark:text-gray-400 mr-1">URL:</span>
                <a 
                  href={blog.baseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center group transition-colors"
                  on:click|stopPropagation={(e) => handleBlogClick(blog)}
                >
                  <span>블로그 바로가기</span>
                  <ExternalLink class="h-3 w-3 ml-1 flex-shrink-0 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                </a>
              </div>
              <div class="flex flex-col mt-2.5">
                <div class="flex items-center">
                  <span
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    게시글 {blog.postCnt}개
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400">마지막 업데이트:</span>
                  <span class="text-xs ml-1 {getDateClass(blog.lastCreatedAt)}">
                    {formatDate(blog.lastCreatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</MainLayout> 