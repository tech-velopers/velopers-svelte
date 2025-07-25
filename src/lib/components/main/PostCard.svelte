<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
    import {techBlogMap} from '$lib/stores/techBlogs';
    import {selectedTags} from '$lib/stores/search';
    import {onMount} from "svelte";
    import {goto} from '$app/navigation';
    import {visitedPosts, markPostAsVisited} from '$lib/stores/visitedPosts';
    import {Eye, Sparkles, Star} from 'lucide-svelte';
    import {cn} from '$lib/utils';
    import {Button} from "$lib/components/ui/button";
    import logger from '$lib/utils/ActivityLogger';
    import BlogHoverCard from "$lib/components/sidebar/BlogHoverCard.svelte";
    import {formatDate} from '$lib/utils/dateUtils';
    import type {ViewMode} from '$lib/stores/viewMode';


    export let post: {
        id: number;
        title: string;
        url: string;
        preview: string;
        imageUrl: string;
        techBlogName: string;
        tags: string[];
        createdAt: number[];
        viewCnt?: number;
        twoLineSummary?: string;
        gptSummary?: string;
        score?: number | null;
    };

    export let toggleTag: (tag: string) => void;
    export let toggleBlog: (blog: { name: string; avatar: string }) => void;
    toggleBlog = () => {
    };
    export let loadedImages: Set<string>;
    export let showBlogToggle: boolean = true;
    export let viewMode: ViewMode = 'detailed';
    export let showAISummary: boolean = false;

    let imageLoaded = false;

    $: isTagSelected = (tag: string) => $selectedTags.includes(tag);
    $: isVisited = $visitedPosts.includes(post.id);

    $: blogInfo = $techBlogMap[post.techBlogName] || {
        icon: `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`,
        postCnt: 0
    };

    // blogInfo에 name 속성 추가
    $: blogInfoWithName = {
        ...blogInfo,
        name: post.techBlogName
    };

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

    // 태그 클릭 핸들러 추가
    function handleTagClick(tag: string, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
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
            goto(`/blog/${blogInfo.id}`);
        } else {
            console.error(`블로그 정보를 찾을 수 없음: ${blogName}`);
        }
    }
</script>

<a
  href="/post/{post.id}"
  data-sveltekit-preload-data="hover"
  on:click={() => markPostAsVisited(post.id)}
  class="w-full text-left block">
  <article
    class={cn(
      "bg-card text-card-foreground p-3 sm:p-4 md:p-5 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300",
      "flex flex-row flex-wrap sm:flex-nowrap gap-4 md:gap-4 lg:gap-6",
      "dark:ring-1 dark:ring-gray-800 group",
      isVisited 
        ? "bg-[#f3f4f6] dark:bg-[#1f2937]"
        : ""
    )}
  >
    <div class="flex-1 flex flex-col">
      <div class="flex-grow">
        <h2
          class={cn(
            "text-sm sm:text-base md:text-lg font-semibold mb-2",
            "group-hover:text-blue-500 transition-colors duration-300",
            isVisited 
              ? "text-[#6b7280] dark:text-[#9ca3af]" 
              : "text-gray-900 dark:text-white"
          )}
        >{post.title}</h2>
        {#if viewMode === 'detailed'}
          {#if showAISummary && post.gptSummary}
            <!-- AI 요약 표시 -->
            <div class={cn(
              "mb-3 p-3 rounded-lg border-l-4 border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500",
              isVisited ? "opacity-70" : ""
            )}>
              <div class="flex items-center gap-2 mb-2">
                <Sparkles class="h-4 w-4 text-purple-500" />
                <span class="text-sm font-medium text-purple-700 dark:text-purple-300">AI 요약</span>
                {#if post.score}
                  <div class="flex items-center gap-1">
                    <Star class="h-3 w-3 text-yellow-500 fill-current" />
                    <span class="text-xs text-gray-600 dark:text-gray-400">{post.score.toFixed(1)}</span>
                  </div>
                {/if}
              </div>
              <div class={cn(
                "text-xs sm:text-sm prose prose-sm max-w-none",
                "prose-headings:text-gray-900 dark:prose-headings:text-white",
                "prose-p:text-gray-700 dark:prose-p:text-gray-300",
                "prose-li:text-gray-700 dark:prose-li:text-gray-300",
                isVisited 
                  ? "text-[#9ca3af] dark:text-[#6b7280]" 
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {@html post.gptSummary}
              </div>
            </div>
          {:else if post.twoLineSummary}
            <p class={cn(
              "mb-0 sm:mb-3 text-xs sm:text-sm flex items-center gap-1",
              isVisited 
                ? "text-[#9ca3af] dark:text-[#6b7280]" 
                : "text-gray-600 dark:text-gray-300"
            )}>
              {post.twoLineSummary}
            </p>
          {:else}
            <p class={cn(
              "mb-0 sm:mb-3 text-xs sm:text-sm",
              isVisited 
                ? "text-[#9ca3af] dark:text-[#6b7280]" 
                : "text-gray-600 dark:text-gray-300"
            )}>
              {post.preview}
            </p>
          {/if}
        {/if}
      </div>

      <div class="mt-auto space-y-3 hidden sm:block">
        {#if viewMode === 'detailed'}
          <div class="flex flex-wrap gap-1.5">
            {#each post.tags as tag}
              <Button
                variant={isTagSelected(tag) ? "default" : "outline"}
                size="sm"
                class={cn(
                  "px-3 py-[0.3rem] h-auto font-normal text-sm transition-colors border",
                  isTagSelected(tag) 
                    ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                    : isVisited 
                      ? "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" 
                      : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
                )}
                on:click={(e) => handleTagClick(tag, e)}
              >
                {tag}
              </Button>
            {/each}
          </div>
        {/if}

        <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <BlogHoverCard
            company={blogInfoWithName}
            variant="postcard"
            {showBlogToggle}
            openDelay={500}
            triggerClass="flex items-center hover:text-blue-500 transition-colors"
            contentClass="w-64 sm:w-72 p-3 sm:p-4"
            avatarSize="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6"
            contentAvatarSize="h-10 w-10 sm:h-12 sm:w-12"
          >
            <div class="flex items-center hover:text-blue-500 transition-colors">
              <Avatar.Root class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6">
                <Avatar.Image
                  src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`}
                  alt={post.techBlogName}
                  loading="lazy"
                />
              </Avatar.Root>
              <span
                class="font-medium ml-1.5 sm:ml-2 cursor-pointer hover:underline text-xs sm:text-sm"
                on:click={(e) => navigateToBlog(post.techBlogName, e)}
                on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
                role="button"
                tabindex="0"
              >{post.techBlogName}</span>
            </div>
          </BlogHoverCard>
          <span class="mx-1.5 sm:mx-2">•</span>
          <span>{formatDate(post.createdAt)}</span>

          {#if post.viewCnt !== undefined}
            <span class="mx-1.5 sm:mx-2">•</span>
            <div class="flex items-center">
              <Eye class="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" strokeWidth={1.5}/>
              <span>{post.viewCnt.toLocaleString()}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
    {#if viewMode === 'detailed'}
      <div
        class="w-16 sm:w-24 md:w-28 lg:w-36 h-16 sm:h-24 md:h-28 lg:h-36 flex-shrink-0 rounded-lg overflow-hidden relative group">
        {#if !imageLoaded}
          <Skeleton class="w-full h-fㄴull"/>
        {/if}
        <img
          src={post.imageUrl ? post.imageUrl : `/icons/${blogInfo.icon}`}
          alt="Post thumbnail"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          class={cn(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          on:load={() => handleImageLoad()}
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
      </div>
    {/if}

    <!-- 모바일에서만 보이는 태그와 메타 정보 영역 -->
    <div class="w-full order-2 -mt-0.5 hidden max-sm:block">
      {#if viewMode === 'detailed'}
        <div class="flex flex-wrap gap-1.5 mb-2">
          {#each post.tags as tag}
            <Button
              variant={isTagSelected(tag) ? "default" : "outline"}
              size="sm"
              class={cn(
                "px-3 py-[0.3rem] h-auto font-normal text-xs transition-colors border",
                isTagSelected(tag) 
                  ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  : isVisited 
                    ? "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" 
                    : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
              )}
              on:click={(e) => handleTagClick(tag, e)}
            >
              {tag}
            </Button>
          {/each}
        </div>
      {/if}

      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <BlogHoverCard
          company={blogInfoWithName}
          variant="postcard"
          {showBlogToggle}
          openDelay={500}
          triggerClass="flex items-center hover:text-blue-500 transition-colors"
          contentClass="w-64 p-3"
          avatarSize="w-4 h-4"
          contentAvatarSize="h-10 w-10"
        >
          <div class="flex items-center hover:text-blue-500 transition-colors">
            <Avatar.Root class="w-4 h-4">
              <Avatar.Image
                src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`}
                alt={post.techBlogName}
                loading="lazy"
              />
            </Avatar.Root>
            <span
              class="font-medium ml-1.5 cursor-pointer hover:underline text-xs"
              on:click={(e) => navigateToBlog(post.techBlogName, e)}
              on:keydown={(e) => e.key === 'Enter' && navigateToBlog(post.techBlogName, e)}
              role="button"
              tabindex="0"
            >{post.techBlogName}</span>
          </div>
        </BlogHoverCard>
        <span class="mx-1.5">•</span>
        <span>{formatDate(post.createdAt)}</span>

        {#if post.viewCnt !== undefined}
          <span class="mx-1.5">•</span>
          <div class="flex items-center">
            <Eye class="w-3 h-3 mr-1" strokeWidth={1.5}/>
            <span>{post.viewCnt.toLocaleString()}</span>
          </div>
        {/if}
      </div>
    </div>
  </article>
</a> 