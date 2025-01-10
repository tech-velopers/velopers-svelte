<script lang="ts">
  import "./app.css";
  import { onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";

  // 태그 타입 정의
  interface Tag {
    id: number;
    tagName: string;
  }

  // 전체 태그 목록
  let allTags: Tag[] = [];

  // API에서 태그 목록 가져오기
  async function fetchTags() {
    try {
      const response = await fetch('http://144.24.81.210:8080/api/tags');
      const data = await response.json();
      allTags = data.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    } catch (error) {
      console.error('태그 목록을 가져오는데 실패했습니다:', error);
    }
  }

  // 다크모드 상태 관리
  let isDarkMode = false;
  
  onMount(() => {
    fetchTags();
    // 시스템 다크모드 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // 저장된 다크모드 설정 확인
    const savedTheme = localStorage.getItem('theme');
    
    isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  });

  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 카테고리 데이터
  const categories = [
    { name: "All", count: 150 },
    { name: "Frontend", count: 45 },
    { name: "Backend", count: 38 },
    { name: "DevOps", count: 27 },
    { name: "AI", count: 22 },
    { name: "Architecture", count: 18 },
    { name: "UX/UI", count: 15 },
    { name: "Else", count: 12 }
  ];

  // 현재 선택된 카테고리
  let currentCategory = "All";
  const selectCategory = (category: string) => {
    currentCategory = category;
  };

  // 선택된 태그 관리 (tagName으로 관리)
  let selectedTags: string[] = [];
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      selectedTags = selectedTags.filter(t => t !== tagName);
    } else {
      selectedTags = [...selectedTags, tagName];
    }
  };

  // 랜덤하게 2-3개의 태그 선택
  function getRandomTags() {
    if (allTags.length === 0) return [];
    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.random() < 0.5 ? 2 : 3).map(tag => tag.tagName).sort();
  }

  // 임시 블로그 포스트 데이터
  const posts = Array(10).fill(null).map(() => ({
    title: "샘플 블로그 포스트 제목입니다",
    company: {
      name: ["네이버", "카카오", "토스", "쿠팡", "라인", "당근마켓"][Math.floor(Math.random() * 6)],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${Math.random()}`
    },
    date: "2024-01-20",
    preview: "이것은 블로그 포스트의 미리보기 내용입니다. 실제 컨텐츠는 백엔드에서 가져올 예정입니다.",
    image: "https://picsum.photos/200/200",
    tags: getRandomTags()
  }));

  // 인기 게시글 데이터
  const popularPosts = Array(5).fill({
    title: "인기 게시글 제목",
    views: "1.2k",
  });

  // 페이지네이션
  let currentPage = 1;
  const totalPages = 10;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function goToPage(page: number) {
    currentPage = page;
  }

  // 선택된 블로그 관리
  let selectedBlogs: string[] = [];
  const toggleBlog = (blogName: string) => {
    if (selectedBlogs.includes(blogName)) {
      selectedBlogs = selectedBlogs.filter(b => b !== blogName);
    } else {
      selectedBlogs = [...selectedBlogs, blogName];
    }
  };

  // 검색 및 초기화 함수
  const searchWithSelected = () => {
    // TODO: 선택된 태그와 블로그로 검색 구현
    console.log('Search with:', { selectedTags, selectedBlogs });
  };

  const resetSelected = () => {
    selectedTags = [];
    selectedBlogs = [];
  };

  // 이미지 로딩 상태 관리
  let loadedImages = new Set<string>();
  function handleImageLoad(imageUrl: string) {
    loadedImages = loadedImages.add(imageUrl);
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-black transition-colors">
  <!-- 헤더 -->
  <header class="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b shadow-sm transition-colors">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" class="inline-flex items-center hover:opacity-90 transition-opacity">
        <span class="text-orange-500 text-sm font-bold leading-none">&lt;</span>
        <span class="text-2xl font-bold text-gray-900 dark:text-white leading-none">V</span>
        <span class="text-orange-500 text-sm font-bold leading-none">&gt;</span>
        <span class="text-2xl font-bold text-gray-900 dark:text-white leading-none ml-0.5">elopers</span>
      </a>
      <nav class="flex items-center space-x-2">
        <div class="md:flex items-center space-x-2 hidden">
          <a 
            href="/" 
            class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            홈
          </a>
          <a 
            href="/about" 
            class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            소개
          </a>
          <a 
            href="https://github.com/sm0514sm" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-current">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
        <button 
          on:click={toggleDarkMode}
          class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="다크모드 토글"
        >
          {#if isDarkMode}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700 hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          {/if}
        </button>
        <div class="h-4 w-px mx-2 bg-gray-300 dark:bg-gray-700"></div>
        <div class="flex items-center space-x-2">
          <a 
            href="/login" 
            class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            로그인
          </a>
          <a href="/signup" class="hidden md:block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">회원가입</a>
        </div>
      </nav>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- 로고 이미지 -->
    <div class="mb-8">
      <div class="bg-black rounded-2xl overflow-hidden dark:ring-1 dark:ring-gray-700">
        <img 
          src="/velopers.png" 
          alt="Velopers 로고" 
          class="w-full h-36 md:h-40 object-contain scale-[1.75] md:scale-100"
        />
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- 메인 컨텐츠 영역 -->
      <div class="flex-1">
        <!-- 카테고리 버튼 -->
        <div class="mb-6">
          <div class="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-2">
            {#each categories as category}
              <button 
                class="px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full border-2 transition-all duration-200
                  whitespace-nowrap text-sm font-medium shadow-sm hover:shadow
                  {currentCategory === category.name 
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800'} 
                  hover:-translate-y-0.5"
                on:click={() => selectCategory(category.name)}
              >
                <span>{category.name}</span>
                <span class="ml-1 {currentCategory === category.name ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'} text-xs font-normal">
                  ({category.count})
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- 블로그 포스트 목록 -->
        <div class="space-y-4">
          {#each posts as post}
            <article class="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 md:gap-6 dark:ring-1 dark:ring-gray-800">
              <div class="flex-1 flex flex-col">
                <div class="group cursor-pointer">
                  <h2 class="text-base md:text-lg font-semibold mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">{post.title}</h2>
                  <p class="text-gray-600 dark:text-gray-300 mb-2 flex-grow text-sm">{post.preview}</p>
                </div>
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-1.5">
                    {#each post.tags as tag}
                      <button 
                        on:click={() => toggleTag(tag)}
                        class="px-2 py-0.5 rounded-md text-xs md:text-sm transition-all duration-200 hover:-translate-y-0.5 
                          {selectedTags.includes(tag) 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                      >
                        {tag}
                      </button>
                    {/each}
                  </div>
                </div>
                <div class="mt-auto">
                  <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <HoverCard.Root openDelay={500}>
                      <HoverCard.Trigger class="flex items-center hover:text-blue-500 transition-colors">
                        <img src={post.company.avatar} alt="Company" class="w-4 md:w-5 h-4 md:h-5 rounded-full mr-2" />
                        <span class="font-medium">{post.company.name}</span>
                      </HoverCard.Trigger>
                      <HoverCard.Content class="w-72 p-4">
                        <div class="flex flex-col space-y-3">
                          <div class="flex justify-between space-x-3">
                            <Avatar.Root class="h-12 w-12">
                              <Avatar.Image src={post.company.avatar} alt={post.company.name} />
                              <Avatar.Fallback>{post.company.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                            </Avatar.Root>
                            <div class="space-y-1 flex-1">
                              <h4 class="text-sm font-semibold dark:text-white">{post.company.name}</h4>
                              <p class="text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                              <div class="flex items-center pt-2">
                                <div class="flex text-xs text-gray-500 dark:text-gray-400">
                                  <span class="flex items-center">
                                    <span class="font-bold text-gray-900 dark:text-white mr-1">25</span>
                                    포스트
                                  </span>
                                  <span class="mx-2">•</span>
                                  <span class="flex items-center">
                                    <span class="font-bold text-gray-900 dark:text-white mr-1">1.2k</span>
                                    구독자
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="flex gap-2">
                            <button 
                              class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors {selectedBlogs.includes(post.company.name) 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                              on:click={() => toggleBlog(post.company.name)}
                            >
                              {selectedBlogs.includes(post.company.name) ? '선택 해제' : '선택하기'}
                            </button>
                            <a 
                              href="#" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                              블로그로 이동
                            </a>
                          </div>
                        </div>
                      </HoverCard.Content>
                    </HoverCard.Root>
                    <span class="mx-2">•</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
              <div class="w-20 h-20 md:w-36 md:h-36 flex-shrink-0 overflow-hidden rounded-lg relative">
                {#if !loadedImages.has(post.image)}
                  <Skeleton class="w-full h-full absolute inset-0" />
                {/if}
                {#if loadedImages.has(post.image)}
                  <div transition:fade={{ duration: 300 }}>
                    <img 
                      src={post.image} 
                      alt="Post thumbnail" 
                      class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                {/if}
                <img 
                  src={post.image} 
                  alt=""
                  class="hidden"
                  on:load={() => handleImageLoad(post.image)}
                />
              </div>
            </article>
          {/each}
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-center mt-6">
          <div class="flex items-center space-x-1 md:space-x-2">
            <button 
              class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === 1 ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} dark:text-gray-300"
              disabled={currentPage === 1}
              on:click={() => goToPage(currentPage - 1)}
            >
              &lt;
            </button>
            {#each pages.slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)) as page}
              <button 
                class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}"
                on:click={() => goToPage(page)}
              >
                {page}
              </button>
            {/each}
            <button 
              class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} dark:text-gray-300"
              disabled={currentPage === totalPages}
              on:click={() => goToPage(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <!-- 우측 사이드바 -->
      <aside class="w-full lg:w-80 space-y-6">
        <!-- 검색 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
          <div class="relative flex items-center">
            <input
              type="search"
              placeholder="검색어를 입력하세요"
              class="w-full px-4 py-2 pr-12 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              class="absolute right-2 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label="검색"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 선택된 항목들 -->
        {#if selectedTags.length > 0 || selectedBlogs.length > 0}
          <div 
            class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700 overflow-hidden"
            transition:slide={{ duration: 300, easing: quintOut }}
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium dark:text-white">선택된 항목</h3>
              <div class="flex gap-2">
                <button 
                  on:click={searchWithSelected}
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
                  {#each selectedBlogs as blog (blog)}
                    <button
                      transition:fade={{ duration: 200 }}
                      on:click={() => toggleBlog(blog)}
                      class="group flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                    >
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog}`} alt={blog} class="w-4 h-4 rounded-full" />
                      {blog}
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

        <!-- 인기 블로그 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
          <h3 class="text-base font-medium mb-3 dark:text-white">인기 블로그</h3>
          <div class="space-y-3">
            {#each ["네이버", "카카오", "토스", "쿠팡", "라인"] as blog, i}
              <HoverCard.Root openDelay={500}>
                <HoverCard.Trigger>
                  <button 
                    on:click={() => toggleBlog(blog)}
                    class="w-full flex items-center gap-3 group p-2 rounded-lg transition-colors
                      {selectedBlogs.includes(blog) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'}"
                  >
                    <span class="text-lg font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog}`} alt={blog} class="w-8 h-8 rounded-full" />
                    <div class="flex-1 text-left">
                      <div class="font-medium group-hover:text-blue-500 transition-colors">{blog}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">구독자 {Math.floor(Math.random() * 900 + 100)}명</div>
                    </div>
                  </button>
                </HoverCard.Trigger>
                <HoverCard.Content class="w-72 p-4">
                  <div class="flex flex-col space-y-3">
                    <div class="flex justify-between space-x-3">
                      <Avatar.Root class="h-12 w-12">
                        <Avatar.Image src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog}`} alt={blog} />
                        <Avatar.Fallback>{blog.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <div class="space-y-1 flex-1">
                        <h4 class="text-sm font-semibold dark:text-white">{blog}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                        <div class="flex items-center pt-2">
                          <div class="flex text-xs text-gray-500 dark:text-gray-400">
                            <span class="flex items-center">
                              <span class="font-bold text-gray-900 dark:text-white mr-1">25</span>
                              포스트
                            </span>
                            <span class="mx-2">•</span>
                            <span class="flex items-center">
                              <span class="font-bold text-gray-900 dark:text-white mr-1">1.2k</span>
                              구독자
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button 
                        class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors {selectedBlogs.includes(blog) 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                        on:click={() => toggleBlog(blog)}
                      >
                        {selectedBlogs.includes(blog) ? '선택 해제' : '선택하기'}
                      </button>
                      <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                      >
                        블로그로 이동
                      </a>
                    </div>
                  </div>
                </HoverCard.Content>
              </HoverCard.Root>
            {/each}
          </div>
        </div>

        <!-- 인기 태그 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
          <h3 class="text-base font-medium mb-3 dark:text-white">인기 태그</h3>
          <div class="flex flex-wrap gap-2">
            {#each allTags as tag}
              <button
                on:click={() => toggleTag(tag.tagName)}
                class="px-2 py-1 rounded-md text-sm transition-all duration-200
                  {selectedTags.includes(tag.tagName) 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-0.5'}"
              >
                {tag.tagName}
              </button>
            {/each}
          </div>
        </div>

        <!-- 인기 게시글 -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">인기 게시글</h3>
          <div class="space-y-4">
            {#each popularPosts as post, i}
              <div class="flex items-start gap-3">
                <span class="text-lg font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                <div>
                  <h4 class="font-medium dark:text-white">{post.title}</h4>
                  <span class="text-sm text-gray-500 dark:text-gray-400">조회수 {post.views}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </aside>
    </div>
  </main>

  <!-- 푸터 -->
  <footer class="border-t dark:border-gray-800">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center space-x-4">
          <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">이용약관</a>
          <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">개인정보처리방침</a>
          <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">문의하기</a>
        </div>
        <div class="text-gray-500 dark:text-gray-400 text-sm">
          © 2024 Velopers. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</div>
