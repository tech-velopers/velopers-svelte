<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { navigate } from "$lib/stores/router";
  import { selectedBlogs, toggleBlog } from '$lib/stores/search';
  import { techBlogMap } from '$lib/stores/techBlogs';
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils.js";
  import { Check, ExternalLink, FileText, Eye, CalendarDays } from 'lucide-svelte';
  import { formatRelativeDate } from '$lib/utils/dateUtils';

  // company 또는 blogInfo를 받을 수 있도록 수정
  export let company: {
    name?: string;
    avatar?: string;
    url?: string;
    postCnt?: number;
    icon?: string;
    baseUrl?: string;
    id?: number;
    techBlogName?: string;
    totalPostViewCnt?: number;
    lastCreatedAt?: number[];
  };

  // 추가 옵션 Props
  export let showBlogToggle: boolean = true;
  export let variant: 'sidebar' | 'postcard' = 'sidebar';
  export let openDelay: number = 300;
  export let triggerClass: string = "";
  export let contentClass: string = "w-72 p-3";
  export let avatarSize: string = "w-6 h-6";
  export let contentAvatarSize: string = "h-10 w-10";

  // 일관된 데이터 구조 보장
  $: blogName = company.name || company.techBlogName || '';
  $: blogAvatar = company.avatar || company.icon || '';
  $: blogUrl = company.url || company.baseUrl || '';
  $: blogId = company.id;
  $: postCount = company.postCnt || 0;
  $: totalViewCount = company.totalPostViewCnt || 0;
  $: lastCreatedAt = company.lastCreatedAt;

  // 이벤트 핸들러
  function navigateToBlog(event: Event) {
    event.stopPropagation();
    
    if (blogId) {
      navigate(`/blog/${blogId}`);
    } else if (blogName && $techBlogMap[blogName]?.id) {
      navigate(`/blog/${$techBlogMap[blogName].id}`);
    }
  }

  function handleToggleBlog(event: Event) {
    event.stopPropagation();
    toggleBlog({ name: blogName, avatar: blogAvatar });
  }

  function openBlogUrl(event: Event) {
    event.stopPropagation();
    if (blogUrl) {
      window.open(blogUrl, '_blank', 'noopener,noreferrer');
    }
  }
</script>

<HoverCard.Root {openDelay}>
  <HoverCard.Trigger class={triggerClass}>
    {#if variant === 'sidebar'}
      <button 
        on:click={handleToggleBlog}
        class={cn(
          "w-full flex items-center gap-2 group px-2 py-1.5 rounded-md transition-colors",
          $selectedBlogs.some(blog => blog.name === blogName)
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" 
            : "hover:bg-muted/50 text-foreground hover:text-blue-600 dark:hover:text-blue-400"
        )}
      >
        <Avatar.Root class={avatarSize}>
          <Avatar.Image 
            src={`/icons/${blogAvatar}` ||  `https://api.dicebear.com/7.x/initials/svg?seed=${blogName}`} 
            alt={blogName} 
          />
        </Avatar.Root>
        <div class="flex-1 text-left text-sm">
          <div class="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{blogName}</div>
        </div>
        {#if $selectedBlogs.some(blog => blog.name === blogName)}
          <Check class="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
        {/if}
      </button>
    {:else}
      <slot></slot>
    {/if}
  </HoverCard.Trigger>
  <HoverCard.Content class={contentClass}>
    <div class="flex flex-col space-y-2">
      <button 
        class="flex gap-3 w-full text-left cursor-pointer bg-transparent group" 
        on:click={navigateToBlog}
      >
        <Avatar.Root class={contentAvatarSize}>
          <Avatar.Image 
            src={`/icons/${blogAvatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${blogName}`} 
            alt={blogName} 
          />
        </Avatar.Root>
        <div class="space-y-1 flex-1">
          <h4 class="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{blogName}</h4>
          <div class="flex flex-col space-y-0.5 mt-1"> 
            <div class="flex items-center">
              <FileText class="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span class="text-xs text-muted-foreground">포스트 {postCount}개</span>
            </div>
            <div class="flex items-center">
              <Eye class="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span class="text-xs text-muted-foreground">총 조회수 {totalViewCount.toLocaleString()}회</span>
            </div>
            <div class="flex items-center">
              <CalendarDays class="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span class="text-xs text-muted-foreground">마지막 포스트: {formatRelativeDate(lastCreatedAt)}</span>
            </div>
          </div>
        </div>
      </button>
      <div class="flex gap-2 mt-1">
        {#if showBlogToggle}
          <Button 
            variant={$selectedBlogs.some(blog => blog.name === blogName) ? "destructive" : "default"}
            size="sm"
            class={cn(
              "flex-1 h-7 text-xs",
              !$selectedBlogs.some(blog => blog.name === blogName) && "bg-blue-500 hover:bg-blue-600 text-white"
            )}
            on:click={handleToggleBlog}
          >
            {$selectedBlogs.some(blog => blog.name === blogName) ? '선택 해제' : '선택하기'}
          </Button>
        {/if}
        <Button 
          variant="outline"
          size="sm"
          class="flex-1 h-7 text-xs"
          on:click={openBlogUrl}
        >
          <ExternalLink class="h-3 w-3 mr-1" />
          방문
        </Button>
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root> 