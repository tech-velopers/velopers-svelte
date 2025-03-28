<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl, API_ENDPOINTS } from '$lib/config';
  import { currentPath, currentUrl, navigate } from '$lib/stores/router';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import type { TechBlog } from '$lib/stores/techBlogs';
  import { selectedBlogs } from '$lib/stores/search';
  import { ExternalLink, Undo2, Share2, Calendar, FileText } from 'lucide-svelte';
  import { toast } from "svelte-sonner";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import PostCard from "$lib/components/main/PostCard.svelte";
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';

  let blog: TechBlog | null = null;
  let blogPosts: any[] = [];
  let loading = true;
  let postsLoading = true;
  let error: string | null = null;
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();
  let currentPage = 1;
  let totalPages = 1;
  let blogId: number | null = null;
  let techBlogsLoaded = false;
  
  let selectedBlogsSnapshot: any[] = [];
  
  $: {
    selectedBlogsSnapshot = $selectedBlogs;
  }

  // URL에서 블로그 ID 가져오기
  $: {
    const pathParts = $currentPath.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'blog') {
      try {
        const id = parseInt(pathParts[2]);
        if (!isNaN(id)) {
          blogId = id;
          // techBlogsLoaded가 true일 때만 fetchBlogDetails 호출
          if (techBlogsLoaded) {
            fetchBlogDetails(id);
          }
        } else {
          error = '잘못된 블로그 ID입니다.';
        }
      } catch (e) {
        console.error('URL 파싱 오류:', e);
        error = '잘못된 URL 형식입니다.';
      }
    }
  }

  // techBlogsStore 구독 및 데이터 로드 상태 감시
  $: {
    if (techBlogsLoaded && blogId !== null) {
      fetchBlogDetails(blogId);
    }
  }

  onMount(() => {
    loading = true;
    
    // 데이터 로드 함수 정의
    async function loadData() {
      try {
        // 데이터 로드
        await Promise.all([
          techBlogsStore.fetchTechBlogs(),
          tagsStore.fetchTags()
        ]);
        
        // 태그 데이터 구독
        tagsStore.subscribe(tags => {
          allTags = tags;
        });
        
        // 데이터 로드 완료 표시
        techBlogsLoaded = true;
      } catch (e) {
        console.error('데이터 로드 오류:', e);
        error = e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.';
      }
    }
    
    // 비동기 함수 호출
    loadData();
    
    const handlePopState = () => {
      console.log('popstate 이벤트 발생');
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // 정리 함수 직접 반환
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  // 블로그 정보 가져오기
  async function fetchBlogDetails(id: number) {
    try {
      loading = true;
      error = null;
      
      // techBlogsStore에서 블로그 정보 가져오기
      const blogs = get(techBlogsStore);
      const foundBlog = blogs.find(b => b.id === id);
      
      if (foundBlog) {
        blog = foundBlog;
        fetchBlogPosts(foundBlog.techBlogName, currentPage);
        
        // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
        const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
        window.scrollTo({ 
          top: 0, 
          behavior: isMobile ? 'auto' : 'smooth' 
        });
      } else {
        error = '블로그를 찾을 수 없습니다.';
        console.error(`블로그를 찾을 수 없음: ID ${id}`);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }

  // svelte/store에서 get 함수 import
  import { get } from 'svelte/store';

  // 블로그 게시글 가져오기
  async function fetchBlogPosts(blogName: string, page: number) {
    try {
      postsLoading = true;
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.posts), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          size: 10,
          blogs: [blogName],
          tags: [],
          category: 'all',
          query: ''
        }),
      });
      
      if (!response.ok) throw new Error('게시글을 불러오는데 실패했습니다.');
      
      const data = await response.json();
      blogPosts = data.content;
      totalPages = data.totalPages;
      currentPage = page;
    } catch (e) {
      console.error('게시글 로딩 오류:', e);
    } finally {
      postsLoading = false;
    }
  }

  // 페이지 변경 함수
  function goToPage(page: number) {
    if (blog) {
      fetchBlogPosts(blog.techBlogName, page);
      
      // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
      const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
      window.scrollTo({
        top: 0,
        behavior: isMobile ? 'auto' : 'smooth'
      });
    }
  }

  // 태그 토글 함수
  function handleToggleTag(tag: string) {
    // 태그 토글 후 현재 블로그의 게시글 다시 가져오기
    if (blog) {
      fetchBlogPosts(blog.techBlogName, 1);
    }
  }

  // 홈으로 이동 함수
  function goToHome() {
    navigate('/');
  }

  // 뒤로가기 함수
  function handleBackClick() {
    // 브라우저의 뒤로가기 사용
    window.history.back();
  }

  // 공유 기능
  function handleShareClick() {
    if (blog) {
      const shareUrl = `${window.location.origin}/blog/${blog.id}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("URL이 클립보드에 복사되었습니다.", {
            description: "이 블로그를 다른 사람과 공유해보세요!",
            duration: 3000
          });
        })
        .catch(() => {
          toast.error("URL 복사에 실패했습니다.", {
            description: "다시 시도해주세요.",
            duration: 3000
          });
        });
    }
  }

  // 블로그 URL 열기
  function openBlogUrl() {
    if (blog?.baseUrl) {
      window.open(blog.baseUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString?: string): string {
    if (!dateString) return '정보 없음';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // 검색 관련 함수들 (MainLayout에 필요)
  const searchWithSelected = () => {};
  const onSearch = () => {};
  const onReset = () => {};
</script>

<svelte:head>
  {#if blog}
    <title>{blog.techBlogName} | Velopers</title>
    <meta name="title" property="og:title" content={`${blog.techBlogName} - 기술 블로그`} />
    <meta name="description" property="og:description" content={`${blog.techBlogName}의 기술 블로그 정보와 최신 게시글을 확인하세요.`} />
    <meta name="image" property="og:image" content={`/icons/${blog.icon}`} />
    <meta name="type" property="og:type" content="website" />
    <meta name="url" property="og:url" content={`https://www.velopers.kr/blog/${blog.id}`} />
    <meta name="site_name" property="og:site_name" content="Velopers" />
    <meta property="og:locale" content="ko_KR" />
    {#if blog.lastCreatedAt}
      <meta property="article:published_time" content={blog.lastCreatedAt} />
      <meta property="article:modified_time" content={blog.lastCreatedAt} />
    {/if}
    <meta property="article:section" content="기술 블로그" />
    <meta property="article:publisher" content="https://www.velopers.kr" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${blog.techBlogName} - 기술 블로그`} />
    <meta name="twitter:description" content={`${blog.techBlogName}의 기술 블로그 정보와 최신 게시글을 확인하세요.`} />
    <meta name="twitter:image" content={`/icons/${blog.icon}`} />
    <link rel="canonical" href={`https://www.velopers.kr/blog/${blog.id}`} />
  {/if}
</svelte:head>

<MainLayout allTags={allTags} {searchWithSelected} {onSearch} {onReset} showLogo={true} showSidebar={false}>
  {#if loading}
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      <Skeleton class="w-full h-64" />
      <Skeleton class="w-2/3 h-8" />
      <Skeleton class="w-full h-96" />
    </div>
  {:else if error}
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          on:click={goToHome}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  {:else if blog}
    <div class="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-8">
      <!-- 블로그 헤더 섹션 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="p-4 md:p-6">
          <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
            <!-- 블로그 아이콘 -->
            <div class="w-20 h-20 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
              <img 
                src={`/icons/${blog?.icon}`} 
                alt={blog?.techBlogName}
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- 블로그 정보 -->
            <div class="flex-1">
              <h1 class="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {blog.techBlogName}
              </h1>
              
              <div class="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-4">
                <div class="flex items-center text-gray-600 dark:text-gray-300">
                  <FileText class="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5" />
                  <span class="text-sm md:text-base">게시글 {blog.postCnt}개</span>
                </div>
                
                {#if blog.lastCreatedAt}
                  <div class="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar class="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5" />
                    <span class="text-sm md:text-base">마지막 업데이트: {formatDate(blog.lastCreatedAt)}</span>
                  </div>
                {/if}
              </div>
              
              <div class="mt-3 md:mt-6 flex flex-wrap gap-2 md:gap-3">
                <a 
                  href={blog?.baseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center text-xs md:text-sm"
                  on:click={openBlogUrl}
                >
                  <span>블로그 방문</span>
                  <ExternalLink class="ml-1 md:ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                </a>
                
                <button 
                  class="px-3 py-1.5 md:px-4 md:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center text-sm md:text-base"
                  on:click={handleShareClick}
                >
                  <Share2 class="mr-1 md:mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>공유하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 블로그 게시글 섹션 -->
      <div class="space-y-3 md:space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            최근 게시글 ({blog?.postCnt ?? 0}개)
          </h2>
          
          <button 
            on:click={handleBackClick}
            class="px-2 py-1 md:px-3 md:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center text-xs md:text-sm"
          >
            <Undo2 class="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5" />
            <span>뒤로 가기</span>
          </button>
        </div>
        
        {#if postsLoading}
          <div class="space-y-4">
            {#each Array(3) as _, i}
              <Skeleton class="w-full h-48" />
            {/each}
          </div>
        {:else if blogPosts.length === 0}
          <div class="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-lg p-6">
            <p class="text-yellow-700 dark:text-yellow-400">
              이 블로그에 등록된 게시글이 없습니다.
            </p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each blogPosts as post (post.id)}
              <PostCard 
                {post} 
                toggleTag={handleToggleTag} 
                {loadedImages} 
                showBlogToggle={false}
              />
            {/each}
          </div>
          
          <!-- 페이지네이션 -->
          {#if totalPages > 1}
            <div class="flex justify-center mt-8">
              <div class="flex space-x-1">
                {#each Array(totalPages) as _, i}
                  <button 
                    class="w-10 h-10 flex items-center justify-center rounded-md {currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}"
                    on:click={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</MainLayout>

<style>
  /* 추가 스타일링이 필요한 경우 여기에 작성 */
</style> 