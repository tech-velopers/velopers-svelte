<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { techBlogMap } from '$lib/stores/techBlogs';
  import { selectedBlogs, selectedTags } from '$lib/stores/search';
  import { onMount } from "svelte";
  import { navigate, visitedPosts, markPostAsVisited } from '$lib/stores/router';
  import {ExternalLink, Eye } from 'lucide-svelte';
  import logger from '$lib/utils/ActivityLogger';


  export let post: {
    id: number;
    title: string;
    url: string;
    preview: string;
    imageUrl: string;
    techBlogName: string;
    tags: string[];
    createdAt: string;
    viewCnt?: number;
  };

  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void = () => {};
  export let loadedImages: Set<string>;
  export let showBlogToggle: boolean = true;

  let imageLoaded = false;

  $: isTagSelected = (tag: string) => $selectedTags.includes(tag);
  $: isBlogSelected = (blogName: string) => $selectedBlogs.some(blog => blog.name === blogName);
  $: isVisited = $visitedPosts.includes(post.id);

  $: blogInfo = $techBlogMap[post.techBlogName] || {
    icon: `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`,
    postCnt: 0
  };

  // 날짜 포맷팅 함수
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onMount(() => {
    if (post.imageUrl && loadedImages.has(post.imageUrl)) {
      imageLoaded = true;
    } else if (!post.imageUrl && blogInfo.icon && loadedImages.has(`/icons/${blogInfo.icon}`)) {
      imageLoaded = true;
    }
  });

  function handleImageLoad() {
    imageLoaded = true;
    if (post.imageUrl) {
      loadedImages.add(post.imageUrl);
    } else if (blogInfo.icon) {
      // 이미지 URL이 없을 경우 블로그 아이콘 경로를 캐시에 추가
      loadedImages.add(`/icons/${blogInfo.icon}`);
    }
  }

  function handlePostClick() {
    // 포스트 클릭 로깅
    logger.logClick('POST_CARD', post.id, post.title, {
      techBlogName: post.techBlogName,
      isVisited: isVisited
    });
    
    markPostAsVisited(post.id);
    navigate(`/post/${post.id}`);
  }

  // 블로그 선택 함수 - 선택만 하고 검색은 하지 않음
  function handleToggleBlog(blog: { name: string; avatar: string }) {
    // 블로그 토글 상태 확인
    const isSelected = isBlogSelected(blog.name);
    
    // 블로그 선택/해제 로깅
    logger.logClick(isSelected ? 'BLOG_UNSELECT' : 'BLOG_SELECT', undefined, blog.name, {
      from: 'post_card',
      totalSelected: isSelected ? $selectedBlogs.length - 1 : $selectedBlogs.length + 1
    });
    
    toggleBlog(blog);
  }

  // 태그 클릭 핸들러 추가
  function handleTagClick(tag: string) {
    // 태그 토글 상태 확인
    const isSelected = isTagSelected(tag);
    
    // 태그 클릭 로깅
    logger.logClick(isSelected ? 'TAG_UNSELECT' : 'TAG_SELECT', undefined, tag, {
      from: 'post_card',
      totalSelected: isSelected ? $selectedTags.length - 1 : $selectedTags.length + 1
    });
    
    toggleTag(tag);
  }

  // 블로그 상세 페이지로 이동하는 함수 추가
  function navigateToBlog(blogName: string, event: Event) {
    event.stopPropagation(); // 포스트 클릭 이벤트 전파 방지
    
    // 블로그 클릭 로깅
    logger.logClick('TECH_BLOG', undefined, blogName, {
      from: 'post_card'
    });
    
    // techBlogMap에서 블로그 ID 찾기
    const blogInfo = $techBlogMap[blogName];
    if (blogInfo && blogInfo.id) {
      navigate(`/blog/${blogInfo.id}`);
    } else {
      console.error(`블로그 정보를 찾을 수 없음: ${blogName}`);
    }
  }
  
  // 블로그 URL로 이동하는 함수
  function openBlogUrl(url: string | undefined, event: Event) {
    event.stopPropagation(); // 기본 이벤트 중지
    
    if (url) {
      // 블로그 URL 방문 로깅
      logger.logClick('BLOG_URL', undefined, post.techBlogName, {
        url: url,
        from: 'post_card'
      });
      
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
</script>

<style lang="postcss">
  .visited-post {
    background-color: #f3f4f6 !important; /* gray-100 */
  }
  
  :global(.dark) .visited-post {
    background-color: #1f2937 !important; /* gray-800 - 더 어두운 색상으로 변경 */
  }
  
  .visited-title {
    color: #6b7280 !important; /* gray-500 */
  }
  
  :global(.dark) .visited-title {
    color: #9ca3af !important; /* gray-400 - 더 어두운 색상으로 변경 */
  }
  
  .visited-text {
    color: #9ca3af !important; /* gray-400 */
  }
  
  :global(.dark) .visited-text {
    color: #6b7280 !important; /* gray-500 - 더 어두운 색상으로 변경 */
  }
  
  .visited-tag {
    background-color: #e5e7eb !important; /* gray-200 */
    color: #4b5563 !important; /* gray-600 */
  }
  
  :global(.dark) .visited-tag {
    background-color: #1f2937 !important; /* gray-800 - 더 어두운 색상으로 변경 */
    color: #9ca3af !important; /* gray-400 - 더 어두운 색상으로 변경 */
  }
  
  .unvisited-article {
    @apply dark:ring-2;
  }

  /* 모바일용 스타일 추가 */
  @media (max-width: 639px) {
    .mobile-meta-container {
      order: 2;
      width: 100%;
      margin-top: -0.5rem;
    }
  }
</style>

<div 
  on:click={handlePostClick}
  on:keydown={e => e.key === 'Enter' && handlePostClick()}
  role="button"
  tabindex="0" 
  class="w-full text-left cursor-pointer">
  <article 
    class="bg-white dark:bg-gray-900 p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-row flex-wrap sm:flex-nowrap gap-4 md:gap-4 lg:gap-6 dark:ring-1 dark:ring-gray-800 group {isVisited ? 'visited-post' : 'unvisited-article'}"
  >
    <div class="flex-1 flex flex-col">
      <div class="flex-grow">
        <h2 
          class="text-sm sm:text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300 {isVisited ? 'visited-title' : ''}"
        >{post.title}</h2>
        <p 
          class="text-gray-600 dark:text-gray-300 mb-0 sm:mb-3 text-xs sm:text-sm {isVisited ? 'visited-text' : ''}"
        >{post.preview}</p>
      </div>
      
      <div class="mt-auto space-y-3 hidden sm:block">
        <div class="flex flex-wrap gap-1 sm:gap-1.5">
          {#each post.tags as tag}
            <button 
              type="button"
              on:click|stopPropagation={() => handleTagClick(tag)}
              class="px-1.5 sm:px-2 py-0.5 rounded-md text-xs md:text-sm transition-all duration-200 hover:-translate-y-0.5 
                {isTagSelected(tag) 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                  : isVisited 
                    ? 'visited-tag dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              {tag}
            </button>
          {/each}
        </div>

        <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <HoverCard.Root openDelay={500}>
            <HoverCard.Trigger class="flex items-center hover:text-blue-500 transition-colors">
              <Avatar.Root class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6">
                <Avatar.Image 
                  src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                  alt={post.techBlogName} 
                />
              </Avatar.Root>
              <!-- 블로그 이름 클릭 시 블로그 상세 페이지로 이동 -->
              <span 
                class="font-medium ml-1.5 sm:ml-2 cursor-pointer hover:underline text-xs sm:text-sm" 
                on:click={(e) => navigateToBlog(post.techBlogName, e)}
                on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
                role="button"
                tabindex="0"
              >{post.techBlogName}</span>
            </HoverCard.Trigger>
            <HoverCard.Content class="w-64 sm:w-72 p-3 sm:p-4">
              <div class="flex flex-col space-y-2 sm:space-y-3">
                <div class="flex justify-between space-x-3">
                  <Avatar.Root class="h-10 w-10 sm:h-12 sm:w-12">
                    <Avatar.Image 
                      src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                      alt={post.techBlogName}
                    />
                  </Avatar.Root>
                  <div class="space-y-1 flex-1">
                    <!-- 블로그 이름 클릭 시 블로그 상세 페이지로 이동 -->
                    <div 
                      class="text-xs sm:text-sm font-semibold dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 hover:underline"
                      on:click={(e) => navigateToBlog(post.techBlogName, e)}
                      on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
                      role="button"
                      tabindex="0"
                    >{post.techBlogName}</div>
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                    <div class="flex items-center pt-1 sm:pt-2">
                      <div class="flex text-xs text-gray-500 dark:text-gray-400">
                        <span class="flex items-center">
                          <span class="font-bold text-gray-900 dark:text-white mr-1">{blogInfo.postCnt}</span>
                          포스트
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  {#if showBlogToggle}
                  <button 
                    class="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-1.5 {isBlogSelected(post.techBlogName)
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                    on:click|stopPropagation={() => handleToggleBlog({ name: post.techBlogName, avatar: blogInfo.icon })}
                  >
                    <span>{isBlogSelected(post.techBlogName) ? '선택 해제' : '선택하기'}</span>
                  </button>
                  {/if}
                  <a 
                    href={blogInfo.baseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
                    on:click|stopPropagation={(e) => openBlogUrl(blogInfo.baseUrl, e)}
                  >
                    <span>블로그</span>
                    <ExternalLink class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </a>
                </div>
              </div>
            </HoverCard.Content>
          </HoverCard.Root>
          <span class="mx-1.5 sm:mx-2">•</span>
          <span>{formatDate(post.createdAt)}</span>
          
          {#if post.viewCnt !== undefined}
            <span class="mx-1.5 sm:mx-2">•</span>
            <div class="flex items-center">
              <Eye class="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" strokeWidth={1.5} />
              <span>{post.viewCnt.toLocaleString()}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class="w-16 sm:w-24 md:w-28 lg:w-36 h-16 sm:h-24 md:h-28 lg:h-36 flex-shrink-0 rounded-lg overflow-hidden relative">
      {#if !imageLoaded}
        <Skeleton class="w-full h-full" />
      {/if}
      <img 
        src={post.imageUrl ? post.imageUrl : `/icons/${blogInfo.icon}`} 
        alt="Post thumbnail" 
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {!imageLoaded ? 'opacity-0' : 'opacity-100'}"
        on:load={() => handleImageLoad()}
      />
    </div>
    
    <!-- 모바일에서만 보이는 태그와 메타 정보 영역 -->
    <div class="mobile-meta-container hidden max-sm:block">
      <div class="flex flex-wrap gap-1 mb-2">
        {#each post.tags as tag}
          <button 
            type="button"
            on:click|stopPropagation={() => handleTagClick(tag)}
            class="px-1.5 py-0.5 rounded-md text-xs transition-all duration-200 hover:-translate-y-0.5 
              {isTagSelected(tag) 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                : isVisited 
                  ? 'visited-tag dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
          >
            {tag}
          </button>
        {/each}
      </div>

      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <HoverCard.Root openDelay={500}>
          <HoverCard.Trigger class="flex items-center hover:text-blue-500 transition-colors">
            <Avatar.Root class="w-4 h-4">
              <Avatar.Image 
                src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                alt={post.techBlogName} 
              />
            </Avatar.Root>
            <span 
              class="font-medium ml-1.5 cursor-pointer hover:underline text-xs" 
              on:click={(e) => navigateToBlog(post.techBlogName, e)}
              on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
              role="button"
              tabindex="0"
            >{post.techBlogName}</span>
          </HoverCard.Trigger>
          <HoverCard.Content class="w-64 p-3">
            <div class="flex flex-col space-y-2">
              <div class="flex justify-between space-x-3">
                <Avatar.Root class="h-10 w-10">
                  <Avatar.Image 
                    src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                    alt={post.techBlogName}
                  />
                </Avatar.Root>
                <div class="space-y-1 flex-1">
                  <div 
                    class="text-xs font-semibold dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 hover:underline"
                    on:click={(e) => navigateToBlog(post.techBlogName, e)}
                    on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
                    role="button"
                    tabindex="0"
                  >{post.techBlogName}</div>
                  <p class="text-xs text-gray-600 dark:text-gray-300">기술 블로그</p>
                  <div class="flex items-center pt-1">
                    <div class="flex text-xs text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="font-bold text-gray-900 dark:text-white mr-1">{blogInfo.postCnt}</span>
                        포스트
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                {#if showBlogToggle}
                <button 
                  class="flex-1 px-2 py-1 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 {isBlogSelected(post.techBlogName)
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                  on:click|stopPropagation={() => handleToggleBlog({ name: post.techBlogName, avatar: blogInfo.icon })}
                >
                  <span>{isBlogSelected(post.techBlogName) ? '선택 해제' : '선택하기'}</span>
                </button>
                {/if}
                <a 
                  href={blogInfo.baseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                  on:click|stopPropagation={(e) => openBlogUrl(blogInfo.baseUrl, e)}
                >
                  <span>블로그</span>
                  <ExternalLink class="h-3 w-3" />
                </a>
              </div>
            </div>
          </HoverCard.Content>
        </HoverCard.Root>
        <span class="mx-1.5">•</span>
        <span>{formatDate(post.createdAt)}</span>
        
        {#if post.viewCnt !== undefined}
          <span class="mx-1.5">•</span>
          <div class="flex items-center">
            <Eye class="w-3 h-3 mr-1" strokeWidth={1.5} />
            <span>{post.viewCnt.toLocaleString()}</span>
          </div>
        {/if}
      </div>
    </div>
  </article>
</div> 