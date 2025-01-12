<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { onMount } from 'svelte';

  export let post: {
    id: number;
    title: string;
    
    preview: string;
    imageUrl: string;
    company: {
      name: string;
      avatar: string;
    };
    tags: string[];
    createdAt: any;
  };

  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: string) => void;
  export let selectedTags: string[];
  export let selectedBlogs: string[];
  export let loadedImages: Set<string>;

  function handleImageLoad(imageUrl: string) {
    loadedImages = loadedImages.add(imageUrl);
  }

  function handlePostClick() {
    window.location.href = `/post/${post.id}`;
  }

  // 회사별 배경색 매핑
  const companyColors: { [key: string]: string } = {
    '네이버': 'bg-[#03C75A] text-white',
    '카카오': 'bg-[#FEE500] text-black',
    '토스': 'bg-[#0064FF] text-white',
    '쿠팡': 'bg-[#F62F5E] text-white',
    '라인': 'bg-[#00C300] text-white',
    '당근': 'bg-[#FF7E36] text-white',
    '배민': 'bg-[#2AC1BC] text-white'
  };

  // 기본 배경색 생성 함수
  function getDefaultColor(companyName: string): string {
    if (companyColors[companyName]) {
      return companyColors[companyName];
    }
    // 회사 이름의 첫 글자를 기준으로 고유한 색상 생성
    const colors = [
      'bg-blue-500 text-white',
      'bg-red-500 text-white',
      'bg-green-500 text-white',
      'bg-yellow-500 text-black',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white'
    ];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
  }
</script>

<button 
  on:click={handlePostClick} 
  type="button"
  class="w-full text-left cursor-pointer">
  <article class="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 md:gap-6 dark:ring-1 dark:ring-gray-800 group">
    <div class="md:hidden w-full h-48 flex-shrink-0 rounded-lg overflow-hidden relative order-first">
      {#if !loadedImages.has(post.imageUrl)}
        <Skeleton class="w-full h-full" />
      {/if}
      <img 
        src={post.imageUrl} 
        alt="Post thumbnail" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {!loadedImages.has(post.imageUrl) ? 'opacity-0' : 'opacity-100'}"
        on:load={() => handleImageLoad(post.imageUrl)}
      />
    </div>
    <div class="flex-1 flex flex-col">
      <div class="cursor-pointer">
        <h2 class="text-base md:text-lg font-semibold mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">{post.title}</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-2 flex-grow text-sm">{post.preview}</p>
      </div>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-1.5">
          {#each post.tags as tag}
            <button 
              type="button"
              on:click|stopPropagation={() => toggleTag(tag)}
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
      <div class="mt-4 md:mt-6">
        <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          <HoverCard.Root openDelay={500}>
            <HoverCard.Trigger class="flex items-center hover:text-blue-500 transition-colors">
              <Avatar.Root class="w-4 md:w-5 h-4 md:h-5">
                <Avatar.Image 
                  src={post.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.company.name}`} 
                  alt={post.company.name} 
                />
              </Avatar.Root>
              <span class="font-medium ml-2">{post.company.name}</span>
            </HoverCard.Trigger>
            <HoverCard.Content class="w-72 p-4">
              <div class="flex flex-col space-y-3">
                <div class="flex justify-between space-x-3">
                  <Avatar.Root class="h-12 w-12">
                    <Avatar.Image 
                      src={post.company.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.company.name}`} 
                      alt={post.company.name}
                    />
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
                    href="/blog/{post.company.name}" 
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
          <span>{new Date(post.createdAt[0], post.createdAt[1] - 1, post.createdAt[2]).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
    <div class="hidden md:block w-36 h-36 flex-shrink-0 rounded-lg overflow-hidden relative">
      {#if !loadedImages.has(post.imageUrl)}
        <Skeleton class="w-full h-full" />
      {/if}
      <img 
        src={post.imageUrl} 
        alt="Post thumbnail" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 {!loadedImages.has(post.imageUrl) ? 'opacity-0' : 'opacity-100'}"
        on:load={() => handleImageLoad(post.imageUrl)}
      />
    </div>
  </article>
</button> 