<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { techBlogMap } from '$lib/stores/techBlogs';
  import { selectedBlogs, selectedTags } from '$lib/stores/search';
  import { onMount } from "svelte";
  import { navigate } from '$lib/stores/router';
  import {SquareArrowOutUpRight } from 'lucide-svelte';


  export let post: {
    id: number;
    title: string;
    url: string;
    preview: string;
    imageUrl: string;
    techBlogName: string;
    tags: string[];
    createdAt: any;
  };

  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let loadedImages: Set<string>;

  let imageLoaded = false;

  $: isTagSelected = (tag: string) => $selectedTags.includes(tag);
  $: isBlogSelected = (blogName: string) => $selectedBlogs.some(blog => blog.name === blogName);

  $: blogInfo = $techBlogMap[post.techBlogName] || {
    icon: `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`,
    postCnt: 0
  };

  // 날짜 포맷팅 함수
  function formatDate(date: number[]): string {
    const [year, month, day] = date;
    return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onMount(() => {
    if (post.imageUrl && loadedImages.has(post.imageUrl)) {
      imageLoaded = true;
    }
  });

  function handleImageLoad() {
    imageLoaded = true;
    if (post.imageUrl) {
      loadedImages.add(post.imageUrl);
    }
  }

  function handlePostClick() {
    navigate(`/post/${post.id}`);
  }
</script>

<div 
  on:click={handlePostClick}
  on:keydown={e => e.key === 'Enter' && handlePostClick()}
  role="button"
  tabindex="0" 
  class="w-full text-left cursor-pointer">
  <article class="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 md:gap-6 dark:ring-1 dark:ring-gray-800 group">
    <div class="md:hidden w-full h-48 flex-shrink-0 rounded-lg overflow-hidden relative order-first">
      {#if !imageLoaded}
        <Skeleton class="w-full h-full" />
      {/if}
      <img 
        src={post.imageUrl} 
        alt="Post thumbnail" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {!imageLoaded ? 'opacity-0' : 'opacity-100'}"
        on:load={() => handleImageLoad()}
      />
    </div>
    <div class="flex-1 flex flex-col">
      <div class="flex-grow">
        <h2 class="text-base md:text-lg font-semibold mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">{post.title}</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-3 text-sm">{post.preview}</p>
      </div>
      
      <div class="mt-auto space-y-3">
        <div class="flex flex-wrap gap-1.5">
          {#each post.tags as tag}
            <button 
              type="button"
              on:click|stopPropagation={() => toggleTag(tag)}
              class="px-2 py-0.5 rounded-md text-xs md:text-sm transition-all duration-200 hover:-translate-y-0.5 
                {isTagSelected(tag) 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              {tag}
            </button>
          {/each}
        </div>

        <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <HoverCard.Root openDelay={500}>
            <HoverCard.Trigger class="flex items-center hover:text-blue-500 transition-colors">
              <Avatar.Root class="w-5 md:w-6 h-5 md:h-6">
                <Avatar.Image 
                  src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                  alt={post.techBlogName} 
                />
              </Avatar.Root>
              <span class="font-medium ml-2">{post.techBlogName}</span>
            </HoverCard.Trigger>
            <HoverCard.Content class="w-72 p-4">
              <div class="flex flex-col space-y-3">
                <div class="flex justify-between space-x-3">
                  <Avatar.Root class="h-12 w-12">
                    <Avatar.Image 
                      src={`/icons/${blogInfo.icon}` || `https://api.dicebear.com/7.x/initials/svg?seed=${post.techBlogName}`} 
                      alt={post.techBlogName}
                    />
                  </Avatar.Root>
                  <div class="space-y-1 flex-1">
                    <h4 class="text-sm font-semibold dark:text-white">{post.techBlogName}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                    <div class="flex items-center pt-2">
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
                  <button 
                    class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 {isBlogSelected(post.techBlogName)
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                    on:click|stopPropagation={() => toggleBlog({ name: post.techBlogName, avatar: blogInfo.icon })}
                  >
                    <span>{isBlogSelected(post.techBlogName) ? '선택 해제' : '선택하기'}</span>
                  </button>
                  <a 
                    href={blogInfo.baseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                    on:click|stopPropagation={() => {
                      if (blogInfo.baseUrl) {
                        window.open(blogInfo.baseUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <span>블로그</span>
                    <SquareArrowOutUpRight class="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </HoverCard.Content>
          </HoverCard.Root>
          <span class="mx-2">•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
    <div class="hidden md:block w-36 h-36 flex-shrink-0 rounded-lg overflow-hidden relative">
      {#if !imageLoaded}
        <Skeleton class="w-full h-full" />
      {/if}
      <img 
        src={post.imageUrl} 
        alt="Post thumbnail" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {!imageLoaded ? 'opacity-0' : 'opacity-100'}"
        on:load={() => handleImageLoad()}
      />
    </div>
  </article>
</div> 